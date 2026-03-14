import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import {
  Package, AlertTriangle, XCircle, ArrowDownToLine, Truck, ArrowRightLeft, TrendingUp, TrendingDown, Activity,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color ?? 'bg-primary/10 text-primary'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const store = useStore();
  const totalProducts = store.products.filter(p => p.isActive).length;
  const lowStock = store.getLowStockProducts().length;
  const outOfStock = store.getOutOfStockProducts().length;
  const pendingReceipts = store.receipts.filter(r => r.status === 'draft').length;
  const pendingDeliveries = store.deliveries.filter(d => d.status !== 'validated').length;
  const pendingTransfers = store.transfers.filter(t => t.status === 'pending').length;
  const velocity = store.getStockVelocity();
  const recentLedger = [...store.ledger].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Inventory overview and insights</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard icon={Package} label="Total Products" value={totalProducts} />
          <KpiCard icon={AlertTriangle} label="Low Stock" value={lowStock} color="bg-warning/10 text-warning" />
          <KpiCard icon={XCircle} label="Out of Stock" value={outOfStock} color="bg-destructive/10 text-destructive" />
          <KpiCard icon={ArrowDownToLine} label="Pending Receipts" value={pendingReceipts} />
          <KpiCard icon={Truck} label="Pending Deliveries" value={pendingDeliveries} />
          <KpiCard icon={ArrowRightLeft} label="Pending Transfers" value={pendingTransfers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface-raised rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Stock Velocity</h2>
            {velocity.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={velocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="inbound" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="outbound" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No movement data yet. Create receipts, deliveries, or transfers to see trends.</p>
            )}
          </div>

          <div className="surface-raised rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-72 overflow-auto">
              {recentLedger.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
              {recentLedger.map(entry => {
                const product = store.products.find(p => p.id === entry.productId);
                const warehouse = store.warehouses.find(w => w.id === entry.warehouseId);
                const isPositive = entry.changeAmount > 0;
                return (
                  <div key={entry.id} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 h-6 w-6 rounded flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{product?.name ?? 'Unknown'}</p>
                      <p className="text-muted-foreground text-xs">
                        {isPositive ? '+' : ''}{entry.changeAmount} {entry.documentType} • {warehouse?.locationCode}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {lowStock > 0 && (
          <div className="surface-raised rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low Stock Alerts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {store.getLowStockProducts().map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{store.getTotalStock(p.id)}</p>
                    <p className="text-xs text-muted-foreground">min: {p.minStockLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
