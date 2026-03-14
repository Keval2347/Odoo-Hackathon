import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TransferItem } from '@/lib/types';

export default function Transfers() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [items, setItems] = useState<TransferItem[]>([{ productId: '', quantity: 0 }]);

  const addItem = () => setItems([...items, { productId: '', quantity: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, updates: Partial<TransferItem>) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, ...updates } : item));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (!from || !to || from === to || validItems.length === 0) return;
    store.createTransfer(from, to, validItems);
    setFrom(''); setTo('');
    setItems([{ productId: '', quantity: 0 }]);
    setOpen(false);
  };

  const sorted = [...store.transfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transfers</h1>
            <p className="text-sm text-muted-foreground">Internal stock movements between warehouses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Transfer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Create Transfer</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Warehouse</Label>
                    <Select value={from} onValueChange={setFrom}>
                      <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                      <SelectContent>{store.warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To Warehouse</Label>
                    <Select value={to} onValueChange={setTo}>
                      <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                      <SelectContent>{store.warehouses.filter(w => w.id !== from).map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Items</Label>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select value={item.productId} onValueChange={v => updateItem(i, { productId: v })}>
                          <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                          <SelectContent>{store.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({from ? store.getStock(p.id, from) : store.getTotalStock(p.id)} avail)</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 0 })} />
                      </div>
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Add Item</Button>
                </div>
                <Button type="submit" className="w-full">Create Transfer (Pending)</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sorted.length === 0 ? (
          <div className="surface-raised rounded-xl p-10 text-center">
            <p className="text-muted-foreground">No transfers yet. Move stock between warehouses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(t => {
              const fromWh = store.warehouses.find(w => w.id === t.fromWarehouseId);
              const toWh = store.warehouses.find(w => w.id === t.toWarehouseId);
              return (
                <div key={t.id} className="surface-raised rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{fromWh?.name} → {toWh?.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={t.status === 'completed' ? 'status-completed' : 'status-pending'}>{t.status}</Badge>
                      {t.status === 'pending' && (
                        <Button size="sm" onClick={() => store.completeTransfer(t.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="text-muted-foreground text-xs">
                      <th className="text-left py-1">Product</th><th className="text-right py-1">Quantity</th>
                    </tr></thead>
                    <tbody>
                      {t.items.map((item, i) => {
                        const p = store.products.find(pr => pr.id === item.productId);
                        return <tr key={i} className="border-t"><td className="py-2">{p?.name}</td><td className="py-2 text-right font-bold">{item.quantity}</td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
