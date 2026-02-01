import { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AnnouncementSettings {
  enabled: boolean;
  text: string;
}

const WelcomeAnnouncementOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if already shown this session
    const shownThisSession = sessionStorage.getItem('welcome_announcement_shown');
    if (shownThisSession === 'true') {
      setHasBeenShown(true);
      setIsLoading(false);
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'welcome_announcement')
          .single();

        if (error) {
          console.error('Error fetching announcement:', error);
          setIsLoading(false);
          return;
        }

        const settings = data?.value as unknown as AnnouncementSettings;
        if (settings?.enabled && settings?.text) {
          setAnnouncement(settings);
          setIsVisible(true);
          // Block scroll
          document.body.style.overflow = 'hidden';
        }
      } catch (err) {
        console.error('Error loading announcement:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    document.body.style.overflow = '';
    // Mark as shown for this session (SPA navigation won't show it again)
    sessionStorage.setItem('welcome_announcement_shown', 'true');
    setHasBeenShown(true);
  };

  // Don't render anything while loading, if already shown, or if no announcement
  if (isLoading || hasBeenShown || !isVisible || !announcement) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="relative mx-4 max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="p-2 rounded-full bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Aviso</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {announcement.text}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 flex justify-end">
          <Button onClick={handleClose} className="btn-gold">
            <X size={16} className="mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnnouncementOverlay;
