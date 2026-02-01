import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WelcomeAnnouncementSettings {
  enabled: boolean;
  text: string;
}

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: announcementSettings, isLoading, error } = useQuery({
    queryKey: ['site-settings', 'welcome_announcement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'welcome_announcement')
        .single();

      if (error) throw error;
      return data?.value as unknown as WelcomeAnnouncementSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async (settings: WelcomeAnnouncementSettings) => {
      // Cast to satisfy Json type requirements
      const jsonValue = JSON.parse(JSON.stringify(settings));
      const { error } = await supabase
        .from('site_settings')
        .update({ value: jsonValue })
        .eq('key', 'welcome_announcement');

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'welcome_announcement'] });
    },
  });

  return {
    announcementSettings,
    isLoading,
    error,
    updateAnnouncement: updateAnnouncementMutation.mutate,
    isUpdating: updateAnnouncementMutation.isPending,
    updateError: updateAnnouncementMutation.error,
  };
};
