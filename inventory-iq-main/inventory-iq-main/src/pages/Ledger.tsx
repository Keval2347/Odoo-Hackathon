import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function Ledger() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [whFilter, setWhFilter] = useState('all');

  const sorted = [...store.ledger]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter(e => {
      const product = store.products.find(p => p.id === e.productId);
      const matchSearch = !search || product?.name.toLowerCase().includes(search.toLowerCase()) || product?.sku.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || e.documentType === typeFilter;
      const matchWh = whFilter === 'all' || e.warehouseId === whFilter;
      return matchSearch && matchType && matchWh;
    });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold">Stock Ledger</h1>
          <p className="text-sm text-muted-foreground">Complete audit trail of all inventory movements</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={whFilter} onValueChange={setWhFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {store.warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="surface-raised rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Warehouse</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Change</th>
              </tr></thead>
              <tbody>
                {sorted.map(e => {
                  const product = store.products.find(p => p.id === e.productId);
                  const warehouse = store.warehouses.find(w => w.id === e.warehouseId);
                  const isPositive = e.changeAmount > 0;
                  return (
                    <tr key={e.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium">{product?.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{product?.sku}</td>
                      <td className="py-3 px-4 text-muted-foreground">{warehouse?.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs capitalize">{e.documentType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPositive ? '+' : ''}{e.changeAmount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No ledger entries match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
