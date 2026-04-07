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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Receipt,
  Banknote,
  ChevronDown,
} from 'lucide-react';

const eventLabels: Record<string, { label: string; icon: any; color: string }> = {
  stock_decrease: { label: 'Stock bajó', icon: ArrowDown, color: 'text-red-600' },
  stock_increase: { label: 'Stock subió', icon: ArrowUp, color: 'text-green-600' },
  location_change: { label: 'Cambio ubicación', icon: MapPin, color: 'text-blue-600' },
  price_change: { label: 'Cambio precio', icon: DollarSign, color: 'text-amber-600' },
  status_change: { label: 'Cambio estado', icon: Eye, color: 'text-purple-600' },
  manual_note: { label: 'Nota manual', icon: MessageSquare, color: 'text-muted-foreground' },
  created: { label: 'Producto creado', icon: Package, color: 'text-green-600' },
  expense: { label: 'Gasto', icon: Receipt, color: 'text-red-500' },
  cost: { label: 'Costo', icon: Banknote, color: 'text-orange-500' },
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
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseType, setExpenseType] = useState<'expense' | 'cost'>('expense');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addEntry.mutateAsync({
      product_id: productId,
      event_type: 'manual_note',
      new_value: newNote.trim(),
    });
    setNewNote('');
  };

  const handleAddExpense = async () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseDescription.trim() || isNaN(amount) || amount <= 0) return;
    await addEntry.mutateAsync({
      product_id: productId,
      event_type: expenseType,
      new_value: `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
      reason: expenseDescription.trim(),
    });
    setExpenseAmount('');
    setExpenseDescription('');
  };

  const isExpenseEntry = (type: string) => type === 'expense' || type === 'cost';

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

        {/* Add expense/cost */}
        <Collapsible open={expenseOpen} onOpenChange={setExpenseOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt size={14} />
                Registrar gasto / costo
              </span>
              <ChevronDown size={14} className={`transition-transform ${expenseOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 rounded-md border border-border p-3">
            <Select value={expenseType} onValueChange={(v) => setExpenseType(v as 'expense' | 'cost')}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gasto (ej. reparación, flete)</SelectItem>
                <SelectItem value="cost">Costo (ej. adquisición, parte)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Concepto (ej. Tune up motor)"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddExpense}
                disabled={!expenseDescription.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0 || addEntry.isPending}
              >
                {addEntry.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Agregar'}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

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
                    {isExpenseEntry(entry.event_type) ? (
                      <div className="mt-1">
                        <span className={`text-base font-bold ${meta.color}`}>{entry.new_value}</span>
                        {entry.reason && (
                          <p className="text-sm text-muted-foreground">{entry.reason}</p>
                        )}
                      </div>
                    ) : (
                      <>
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
                      </>
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
