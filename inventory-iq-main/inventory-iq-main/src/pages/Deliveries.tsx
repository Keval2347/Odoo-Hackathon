import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeliveryItem } from '@/lib/types';

export default function Deliveries() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<DeliveryItem[]>([{ productId: '', quantity: 0, warehouseId: '' }]);

  const addItem = () => setItems([...items, { productId: '', quantity: 0, warehouseId: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, updates: Partial<DeliveryItem>) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, ...updates } : item));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId && i.quantity > 0 && i.warehouseId);
    if (!customer || validItems.length === 0) return;
    store.createDelivery(customer, validItems);
    setCustomer('');
    setItems([{ productId: '', quantity: 0, warehouseId: '' }]);
    setOpen(false);
  };

  const sorted = [...store.deliveries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const statusFlow: Record<string, string> = { draft: 'picking', picking: 'packed', packed: 'validated' };
  const statusLabel: Record<string, string> = { draft: 'Start Picking', picking: 'Mark Packed', packed: 'Validate & Ship' };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deliveries</h1>
            <p className="text-sm text-muted-foreground">Outgoing shipments to customers</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Delivery</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>Create Delivery Order</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer Inc." />
                </div>
                <div className="space-y-3">
                  <Label>Items</Label>
                  {items.map((item, i) => {
                    const availableQty = item.productId && item.warehouseId ? store.getStock(item.productId, item.warehouseId) : (item.productId ? store.getTotalStock(item.productId) : 0);
                    const isOutOfStock = item.productId && availableQty === 0;
                    const isOver = item.productId && item.quantity > availableQty;

                    return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Select value={item.productId} onValueChange={v => updateItem(i, { productId: v })}>
                            <SelectTrigger className={isOutOfStock ? "text-destructive border-destructive font-medium" : ""}><SelectValue placeholder="Product" /></SelectTrigger>
                            <SelectContent>{store.products.map(p => {
                              const pStock = store.getTotalStock(p.id);
                              return (
                                <SelectItem key={p.id} value={p.id}>
                                  <span className={pStock === 0 ? "text-destructive font-medium" : ""}>
                                    {p.name} {pStock === 0 ? "(Out of stock)" : `(${pStock})`}
                                  </span>
                                </SelectItem>
                              );
                            })}</SelectContent>
                          </Select>
                        </div>
                        <div className="w-20">
                          <Input className={isOver ? "border-destructive text-destructive font-medium" : ""} type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="flex-1">
                          <Select value={item.warehouseId} onValueChange={v => updateItem(i, { warehouseId: v })}>
                            <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                            <SelectContent>{store.warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        {items.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                      {(isOutOfStock || isOver) && item.productId && (
                        <div className="text-xs text-destructive px-1">
                          {isOutOfStock 
                            ? "Product is out of stock in this location." 
                            : `Quantity exceeds available stock. Remaining available: ${availableQty}`}
                        </div>
                      )}
                    </div>
                  )})}
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Add Item</Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={items.some(i => {
                    if (!i.productId) return false;
                    const avail = i.warehouseId ? store.getStock(i.productId, i.warehouseId) : store.getTotalStock(i.productId);
                    return i.quantity > avail || avail === 0;
                  })}
                >
                  Create Delivery (Draft)
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sorted.length === 0 ? (
          <div className="surface-raised rounded-xl p-10 text-center">
            <p className="text-muted-foreground">No deliveries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(d => (
              <div key={d.id} className="surface-raised rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{d.customerName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      d.status === 'validated' ? 'status-completed' :
                      d.status === 'packed' ? 'status-validated' :
                      d.status === 'picking' ? 'status-pending' : 'status-draft'
                    }>{d.status}</Badge>
                    {d.status !== 'validated' && (
                      <Button size="sm" onClick={() => store.updateDeliveryStatus(d.id, statusFlow[d.status] as "draft" | "picking" | "packed" | "validated")}>
                        {statusLabel[d.status]}
                      </Button>
                    )}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-muted-foreground text-xs">
                    <th className="text-left py-1">Product</th><th className="text-left py-1">Warehouse</th><th className="text-right py-1">Quantity</th>
                  </tr></thead>
                  <tbody>
                    {d.items.map((item, i) => {
                      const p = store.products.find(pr => pr.id === item.productId);
                      const w = store.warehouses.find(wh => wh.id === item.warehouseId);
                      return (
                        <tr key={i} className="border-t"><td className="py-2">{p?.name}</td><td className="py-2 text-muted-foreground">{w?.name}</td><td className="py-2 text-right font-bold">-{item.quantity}</td></tr>
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
