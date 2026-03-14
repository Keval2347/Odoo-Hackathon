import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ReceiptItem } from '@/lib/types';

export default function Receipts() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([{ productId: '', quantity: 0, warehouseId: '' }]);

  const addItem = () => setItems([...items, { productId: '', quantity: 0, warehouseId: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, updates: Partial<ReceiptItem>) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, ...updates } : item));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId && i.quantity > 0 && i.warehouseId);
    if (!supplier || validItems.length === 0) return;
    store.createReceipt(supplier, validItems);
    setSupplier('');
    setItems([{ productId: '', quantity: 0, warehouseId: '' }]);
    setOpen(false);
  };

  const sorted = [...store.receipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Receipts</h1>
            <p className="text-sm text-muted-foreground">Incoming stock from suppliers</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Receipt</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Create Receipt</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Acme Corp" />
                </div>
                <div className="space-y-3">
                  <Label>Items</Label>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select value={item.productId} onValueChange={v => updateItem(i, { productId: v })}>
                          <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                          <SelectContent>{store.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="flex-1">
                        <Select value={item.warehouseId} onValueChange={v => updateItem(i, { warehouseId: v })}>
                          <SelectTrigger><SelectValue placeholder="Warehouse" /></SelectTrigger>
                          <SelectContent>{store.warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Add Item</Button>
                </div>
                <Button type="submit" className="w-full">Create Receipt (Draft)</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sorted.length === 0 ? (
          <div className="surface-raised rounded-xl p-10 text-center">
            <p className="text-muted-foreground">No receipts yet. Create one to start receiving stock.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(r => (
              <div key={r.id} className="surface-raised rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{r.supplierName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={r.status === 'validated' ? 'status-completed' : 'status-draft'}>
                      {r.status}
                    </Badge>
                    {r.status === 'draft' && (
                      <Button size="sm" onClick={() => store.validateReceipt(r.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />Validate
                      </Button>
                    )}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-muted-foreground text-xs">
                    <th className="text-left py-1">Product</th><th className="text-left py-1">Warehouse</th><th className="text-right py-1">Quantity</th>
                  </tr></thead>
                  <tbody>
                    {r.items.map((item, i) => {
                      const p = store.products.find(pr => pr.id === item.productId);
                      const w = store.warehouses.find(wh => wh.id === item.warehouseId);
                      return (
                        <tr key={i} className="border-t">
                          <td className="py-2">{p?.name}</td>
                          <td className="py-2 text-muted-foreground">{w?.name}</td>
                          <td className="py-2 text-right font-bold">+{item.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
