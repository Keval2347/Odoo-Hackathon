import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function Adjustments() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [counted, setCounted] = useState(0);
  const [reason, setReason] = useState('');

  const systemQty = productId && warehouseId ? store.getStock(productId, warehouseId) : 0;
  const diff = counted - systemQty;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !warehouseId || !reason) return;
    store.createAdjustment(productId, warehouseId, counted, reason);
    setProductId(''); setWarehouseId(''); setCounted(0); setReason('');
    setOpen(false);
  };

  const sorted = [...store.adjustments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Adjustments</h1>
            <p className="text-sm text-muted-foreground">Correct stock discrepancies from physical counts</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Adjustment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Stock Adjustment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{store.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warehouse</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>{store.warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {productId && warehouseId && (
                  <div className="p-3 rounded-lg bg-muted text-sm">
                    System quantity: <span className="font-bold">{systemQty}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Counted Quantity</Label>
                  <Input type="number" value={counted || ''} onChange={e => setCounted(parseInt(e.target.value) || 0)} />
                </div>
                {productId && warehouseId && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${diff > 0 ? 'bg-success/10 text-success' : diff < 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                    Difference: {diff > 0 ? '+' : ''}{diff}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Physical count discrepancy, damage, theft..." />
                </div>
                <Button type="submit" className="w-full">Apply Adjustment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sorted.length === 0 ? (
          <div className="surface-raised rounded-xl p-10 text-center">
            <p className="text-muted-foreground">No adjustments yet.</p>
          </div>
        ) : (
          <div className="surface-raised rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Warehouse</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">System</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Counted</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Diff</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reason</th>
              </tr></thead>
              <tbody>
                {sorted.map(a => {
                  const p = store.products.find(pr => pr.id === a.productId);
                  const w = store.warehouses.find(wh => wh.id === a.warehouseId);
                  return (
                    <tr key={a.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium">{p?.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{w?.name}</td>
                      <td className="py-3 px-4 text-right">{a.systemQuantity}</td>
                      <td className="py-3 px-4 text-right">{a.countedQuantity}</td>
                      <td className={`py-3 px-4 text-right font-bold ${a.difference > 0 ? 'text-success' : a.difference < 0 ? 'text-destructive' : ''}`}>
                        {a.difference > 0 ? '+' : ''}{a.difference}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">{a.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
