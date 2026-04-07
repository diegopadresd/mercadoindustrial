import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProductHistory } from '@/hooks/useProductHistory';
import {
  Clock,
  Plus,
  Loader2,
  ArrowDown,
  ArrowUp,
  MapPin,
  DollarSign,
  Eye,
  MessageSquare,
  Package,
} from 'lucide-react';

const eventLabels: Record<string, { label: string; icon: any; color: string }> = {
  stock_decrease: { label: 'Stock bajó', icon: ArrowDown, color: 'text-red-600' },
  stock_increase: { label: 'Stock subió', icon: ArrowUp, color: 'text-green-600' },
  location_change: { label: 'Cambio ubicación', icon: MapPin, color: 'text-blue-600' },
  price_change: { label: 'Cambio precio', icon: DollarSign, color: 'text-amber-600' },
  status_change: { label: 'Cambio estado', icon: Eye, color: 'text-purple-600' },
  manual_note: { label: 'Nota manual', icon: MessageSquare, color: 'text-muted-foreground' },
  created: { label: 'Producto creado', icon: Package, color: 'text-green-600' },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
}

export default function ProductHistoryDialog({ open, onOpenChange, productId, productTitle }: Props) {
  const { history, isLoading, addEntry } = useProductHistory(productId);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addEntry.mutateAsync({
      product_id: productId,
      event_type: 'manual_note',
      new_value: newNote.trim(),
    });
    setNewNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Historial: {productTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Add note */}
        <div className="flex gap-2">
          <Input
            placeholder="Agregar nota al historial..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!newNote.trim() || addEntry.isPending}
          >
            {addEntry.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </Button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto space-y-3 mt-2">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          ) : !history?.length ? (
            <p className="text-center text-muted-foreground py-8">Sin historial aún</p>
          ) : (
            history.map((entry) => {
              const meta = eventLabels[entry.event_type] || eventLabels.manual_note;
              const Icon = meta.icon;
              return (
                <div key={entry.id} className="flex gap-3 border-l-2 border-border pl-4 pb-3 relative">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-current ${meta.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon size={14} className={meta.color} />
                      <Badge variant="outline" className="text-xs">{meta.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {(entry.previous_value || entry.new_value) && (
                      <p className="text-sm mt-1">
                        {entry.previous_value && <span className="line-through text-muted-foreground">{entry.previous_value}</span>}
                        {entry.previous_value && entry.new_value && ' → '}
                        {entry.new_value && <span className="font-medium">{entry.new_value}</span>}
                      </p>
                    )}
                    {entry.reason && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        <strong>Razón:</strong> {entry.reason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
