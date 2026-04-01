import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Search,
  Send,
  Eye,
  Calendar,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminPreguntas = () => {
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-questions', search],
    queryFn: async () => {
      let query = supabase
        .from('product_questions')
        .select(`
          *,
          products (
            title,
            sku,
            images
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (search) {
        query = query.or(`question.ilike.%${search}%,customer_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { error } = await supabase
        .from('product_questions')
        .update({
          answer,
          answered_at: new Date().toISOString(),
          answered_by: user?.id,
        })
        .eq('id', questionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      toast({
        title: 'Respuesta enviada',
        description: 'La pregunta se respondió correctamente',
      });
      setSelectedQuestion(null);
      setAnswer('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la respuesta',
        variant: 'destructive',
      });
    },
  });

  const pendingCount = questions?.filter(q => !q.answer).length || 0;

  const handleAnswer = () => {
    if (!answer.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor escribe una respuesta',
        variant: 'destructive',
      });
      return;
    }
    answerMutation.mutate({ questionId: selectedQuestion.id, answer });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Preguntas
          </h1>
          <p className="text-muted-foreground">
            {pendingCount > 0 && <span className="text-red-500 font-medium">{pendingCount} pendientes • </span>}
            {questions?.length || 0} preguntas totales
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por pregunta o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-yellow-600">
              {pendingCount} {pendingCount === 1 ? 'pregunta pendiente' : 'preguntas pendientes'} de responder
            </p>
            <p className="text-sm text-muted-foreground">
              Responde las preguntas de tus clientes para mejorar la experiencia de compra
            </p>
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead>Pregunta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando preguntas...
                </TableCell>
              </TableRow>
            ) : questions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <MessageSquare className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                  <p className="text-muted-foreground">No hay preguntas</p>
                </TableCell>
              </TableRow>
            ) : (
              questions?.map((question) => (
                <TableRow key={question.id} className={!question.answer ? 'bg-yellow-500/5' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {question.products?.images?.[0] ? (
                        <img src={question.products.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted" />
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">{question.products?.title}</p>
                        <p className="text-sm text-muted-foreground">{question.products?.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium">{question.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{question.customer_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 max-w-xs">{question.question}</p>
                  </TableCell>
                  <TableCell>
                    {question.answer ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={14} />
                        Respondida
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <AlertCircle size={14} />
                        Pendiente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{new Date(question.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant={question.answer ? 'ghost' : 'default'}
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setAnswer(question.answer || '');
                      }}
                      className={!question.answer ? 'btn-gold' : ''}
                    >
                      {question.answer ? (
                        <>
                          <Eye size={16} className="mr-1" />
                          Ver
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-1" />
                          Responder
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Answer Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedQuestion?.answer ? 'Ver Pregunta' : 'Responder Pregunta'}
            </DialogTitle>
            <DialogDescription>
              Producto: {selectedQuestion?.products?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">
                {selectedQuestion?.customer_name} pregunta:
              </p>
              <p className="font-medium">{selectedQuestion?.question}</p>
            </div>

            {selectedQuestion?.answer ? (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Tu respuesta:</p>
                <p>{selectedQuestion.answer}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tu respuesta</label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
              {selectedQuestion?.answer ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!selectedQuestion?.answer && (
              <Button 
                className="btn-gold" 
                onClick={handleAnswer}
                disabled={answerMutation.isPending}
              >
                {answerMutation.isPending ? 'Enviando...' : 'Enviar Respuesta'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPreguntas;
