import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Products() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', categoryId: '', uom: 'pcs', minStockLevel: 10 });

  const filtered = store.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory && p.isActive;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.categoryId) return;
    store.addProduct(form);
    setForm({ name: '', sku: '', categoryId: '', uom: 'pcs', minStockLevel: 10 });
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} products</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="HP EliteBook 840" />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="HP-LAP-009" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {store.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>UoM</Label>
                    <Input value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Min Stock Level</Label>
                  <Input type="number" value={form.minStockLevel} onChange={e => setForm(f => ({ ...f, minStockLevel: parseInt(e.target.value) || 0 }))} />
                </div>
                <Button type="submit" className="w-full">Create Product</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {store.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="surface-raised rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">UoM</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Min Level</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock by Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const total = store.getTotalStock(p.id);
                  const cat = store.categories.find(c => c.id === p.categoryId);
                  const isLow = total <= p.minStockLevel && total > 0;
                  const isOut = total === 0;
                  const stockByWh = store.stock.filter(s => s.productId === p.id && s.quantity > 0);
                  return (
                    <tr key={p.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{p.sku}</td>
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{cat?.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.uom}</td>
                      <td className="py-3 px-4 text-right font-bold">{total}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{p.minStockLevel}</td>
                      <td className="py-3 px-4">
                        {isOut && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                        {isLow && <Badge variant="outline" className="text-xs border-warning/50 text-warning">Low Stock</Badge>}
                        {!isOut && !isLow && <Badge variant="outline" className="text-xs border-success/50 text-success">In Stock</Badge>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {stockByWh.map(s => {
                            const wh = store.warehouses.find(w => w.id === s.warehouseId);
                            return (
                              <span key={s.warehouseId} className="text-xs bg-muted px-2 py-0.5 rounded">
                                {wh?.locationCode}: {s.quantity}
                              </span>
                            );
                          })}
                          {stockByWh.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
