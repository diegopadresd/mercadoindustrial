import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlogPosts, type BlogPost } from '@/hooks/useBlogPosts';
import { useQueryClient } from '@tanstack/react-query';

const slugify = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminBlog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useBlogPosts(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    author: 'Equipo Mercado Industrial',
    category: '',
    read_time: '5 min',
    is_published: false,
  });

  const resetForm = () => {
    setForm({ title: '', excerpt: '', content: '', image_url: '', author: 'Equipo Mercado Industrial', category: '', read_time: '5 min', is_published: false });
    setEditingPost(null);
  };

  const openNew = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content || '',
      image_url: post.image_url || '',
      author: post.author,
      category: post.category || '',
      read_time: post.read_time || '5 min',
      is_published: post.is_published,
    });
    setDialogOpen(true);
  };

  const handleAIGenerate = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Escribe un tema', description: 'Ingresa un título o tema para generar el contenido', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog', {
        body: { topic: form.title },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        category: data.category || prev.category,
        read_time: data.read_time || prev.read_time,
      }));
      toast({ title: '✨ Contenido generado', description: 'Revisa y edita el contenido antes de publicar' });
    } catch (err: any) {
      toast({ title: 'Error al generar', description: err.message || 'No se pudo generar contenido', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Título requerido', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const slug = slugify(form.title);
      const payload = {
        slug,
        title: form.title,
        excerpt: form.excerpt || null,
        content: form.content || null,
        image_url: form.image_url || null,
        author: form.author,
        category: form.category || null,
        read_time: form.read_time || '5 min',
        is_published: form.is_published,
        created_by: user!.id,
      };

      if (editingPost) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editingPost.id);
        if (error) throw error;
        toast({ title: 'Artículo actualizado' });
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
        toast({ title: 'Artículo creado' });
      }

      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase.from('blog_posts').update({ is_published: !post.is_published }).eq('id', post.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: post.is_published ? 'Artículo despublicado' : 'Artículo publicado' });
    }
  };

  const deletePost = async (post: BlogPost) => {
    if (!confirm('¿Eliminar este artículo?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({ title: 'Artículo eliminado' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Blog</h1>
          <p className="text-muted-foreground">Gestiona los artículos del blog</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus size={18} /> Nuevo artículo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No hay artículos aún</p>
          <Button onClick={openNew} className="gap-2"><Plus size={18} /> Crear primer artículo</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-4 flex items-center gap-4">
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.is_published ? 'default' : 'secondary'}>
                      {post.is_published ? 'Publicado' : 'Borrador'}
                    </Badge>
                    {post.category && <Badge variant="outline">{post.category}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.author} · {new Date(post.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(post)} title={post.is_published ? 'Despublicar' : 'Publicar'}>
                    {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePost(post)}><Trash2 size={16} /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Editar artículo' : 'Nuevo artículo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Título o tema del artículo..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="flex-1" />
              <Button variant="outline" onClick={handleAIGenerate} disabled={generating} className="gap-2 shrink-0">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generar con IA
              </Button>
            </div>
            <Input placeholder="Resumen breve (excerpt)" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="URL de imagen (opcional)" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              <Input placeholder="Categoría" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Autor" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
              <Input placeholder="Tiempo de lectura" value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))} />
            </div>
            <Textarea placeholder="Contenido del artículo (markdown)..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={15} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
                <span className="text-sm">Publicar inmediatamente</span>
              </label>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingPost ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
