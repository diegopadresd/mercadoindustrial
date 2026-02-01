import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  ArrowLeft,
  Loader2,
  Send,
  User,
} from 'lucide-react';

interface Conversation {
  id: string;
  product_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  product?: {
    title: string;
    images: string[];
  };
  other_user?: {
    full_name: string;
    email: string;
  };
  last_message?: {
    content: string;
    sender_id: string;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const Chats = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConversationId = searchParams.get('chat');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['my-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          product:products(title, images)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;

      // Fetch other user info and last message for each conversation
      const enrichedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          
          // Get other user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            other_user: profileData,
            last_message: lastMessageData,
            unread_count: count || 0,
          };
        })
      );

      return enrichedConversations as Conversation[];
    },
    enabled: !!user?.id,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation-messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedConversationId,
  });

  // Mark messages as read
  useEffect(() => {
    if (selectedConversationId && user?.id && messages) {
      const unreadMessages = messages.filter(m => !m.is_read && m.sender_id !== user.id);
      if (unreadMessages.length > 0) {
        supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', selectedConversationId)
          .neq('sender_id', user.id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
          });
      }
    }
  }, [selectedConversationId, messages, user?.id, queryClient]);

  // Subscribe to new messages
  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConversationId] });
          queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId || !user?.id) throw new Error('No conversation selected');
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversationId,
          sender_id: user.id,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['my-conversations'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar el mensaje', variant: 'destructive' });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link to={selectedConversationId ? '/mi-cuenta/chats' : '/mi-cuenta'}>
              <Button variant="ghost" size="icon" onClick={() => selectedConversationId && setSearchParams({})}>
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">
                {selectedConversation ? selectedConversation.other_user?.full_name || 'Chat' : 'Mis Chats'}
              </h1>
              <p className="text-muted-foreground">
                {selectedConversation 
                  ? selectedConversation.product?.title || 'Conversación'
                  : 'Conversaciones con vendedores y compradores'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className={`md:col-span-1 bg-card rounded-xl border border-border overflow-hidden ${
              selectedConversationId ? 'hidden md:block' : ''
            }`}>
              <ScrollArea className="h-full">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !conversations || conversations.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No tienes conversaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSearchParams({ chat: conv.id })}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedConversationId === conv.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User size={20} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {conv.other_user?.full_name || 'Usuario'}
                              </p>
                              {conv.unread_count! > 0 && (
                                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.product?.title || 'Sin producto asociado'}
                            </p>
                            {conv.last_message && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {conv.last_message.sender_id === user?.id ? 'Tú: ' : ''}
                                {conv.last_message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className={`md:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col ${
              !selectedConversationId ? 'hidden md:flex' : ''
            }`}>
              {!selectedConversationId ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Selecciona una conversación</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : !messages || messages.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="text-muted-foreground">No hay mensajes aún. ¡Inicia la conversación!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                message.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString('es-MX', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chats;
