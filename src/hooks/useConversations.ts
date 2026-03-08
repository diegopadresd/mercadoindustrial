import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const startConversation = async (productId: string, sellerId: string) => {
    if (!user?.id) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para enviar mensajes',
        variant: 'destructive',
      });
      navigate('/auth');
      return null;
    }

    if (user.id === sellerId) {
      toast({
        title: 'Acción no permitida',
        description: 'No puedes iniciar una conversación contigo mismo',
        variant: 'destructive',
      });
      return null;
    }

    setIsCreating(true);

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (existingConversation) {
        navigate(`/mi-cuenta/chats?chat=${existingConversation.id}`);
        return existingConversation.id;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          product_id: productId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: 'Conversación iniciada',
        description: 'Ahora puedes enviar mensajes al vendedor',
      });

      navigate(`/mi-cuenta/chats?chat=${newConversation.id}`);
      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la conversación',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    startConversation,
    isCreating,
  };
};
