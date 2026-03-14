import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Truck,
  ArrowRightLeft,
  ClipboardCheck,
  BookOpen,
  Sun,
  Moon,
  LogOut,
  Search,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/hooks/useStore';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Products', url: '/products', icon: Package },
  { title: 'Receipts', url: '/receipts', icon: ArrowDownToLine },
  { title: 'Deliveries', url: '/deliveries', icon: Truck },
  { title: 'Transfers', url: '/transfers', icon: ArrowRightLeft },
  { title: 'Adjustments', url: '/adjustments', icon: ClipboardCheck },
  { title: 'Stock Ledger', url: '/ledger', icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const store = useStore();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight text-foreground">
                CoreInventory
              </span>
            )}
            {collapsed && <Package className="h-5 w-5 text-primary" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="hover:bg-accent/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={toggle}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {!collapsed && (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => store.logout()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Log Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
