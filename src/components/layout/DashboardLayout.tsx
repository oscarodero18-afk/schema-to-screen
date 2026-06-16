import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  User, 
  BadgePercent, 
  History, 
  ShieldCheck,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2 font-bold text-primary", className)}>
    <div className="bg-primary p-1 rounded-lg shadow-lg rotate-3 transition-transform duration-300">
      <div className="bg-white rounded p-0.5">
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>
    </div>
    <span className="tracking-tighter text-xl">Vertex<span className="text-accent">Tech</span></span>
  </div>
);

const DashboardLayout = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';

  const allItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { title: 'Prospect Leads', icon: Target, path: '/leads' },
    { title: 'Revenue Sales', icon: TrendingUp, path: '/sales' },
    { title: 'Solution Catalog', icon: ShoppingBag, path: '/products' },
    { title: 'Agent Network', icon: Users, path: '/agents', adminOnly: true },
    { title: 'Commissions', icon: BadgePercent, path: '/commissions' },
    { title: 'Internal Chat', icon: MessageSquare, path: '/chat' },
    { title: 'Renewals', icon: History, path: '/renewals' },
    { title: 'My Profile', icon: User, path: '/profile' },
    { title: 'Admin Panel', icon: ShieldCheck, path: '/admin', adminOnly: true },
  ];

  const menuItems = allItems.filter(item => !item.adminOnly || isAdmin);

  // Derive mobile items from menuItems to ensure role-based access is respected
  const mobileNavItems = menuItems.map(item => ({
    ...item,
    shortTitle: item.title === 'Solution Catalog' ? 'Catalog' : 
                item.title === 'Revenue Sales' ? 'Sales' : 
                item.title === 'Prospect Leads' ? 'Leads' : 
                item.title === 'Dashboard' ? 'Home' : 
                item.title === 'Agent Network' ? 'Network' :
                item.title === 'Internal Chat' ? 'Chat' :
                item.title === 'Admin Panel' ? 'Admin' : item.title
  }));

  const isActive = (path: string) => location.pathname === path;
  const hapticFeedback = () => { if (window.navigator.vibrate) window.navigator.vibrate(5); };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" collapsible="icon" className="hidden md:flex border-r border-border">
          <SidebarHeader className="p-4">
            <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden group">
              <Logo className="h-8 transition-all duration-300" />
            </Link>
          </SidebarHeader>
          <Separator />
          <SidebarContent className="p-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.path) ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold" : "hover:bg-accent/5"
                    )}
                  >
                    <Link to={item.path}>
                      <item.icon className={cn("h-4 w-4", isActive(item.path) && "text-primary")} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 px-1 py-2">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-xs font-bold">{profile?.full_name || 'User'}</span>
                <span className="truncate text-[10px] text-muted-foreground capitalize">{profile?.role} Account</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive transition-colors" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="flex h-16 items-center border-b border-border px-4 md:px-6 bg-card sticky top-0 z-40">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <div className="md:hidden flex items-center gap-3">
              <Logo className="h-8" />
            </div>
            <div className="ml-4 flex flex-1 items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight md:text-xl capitalize">
                {isActive('/dashboard') ? 'Vertex Tech Hub' : location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => signOut()}>
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            <Outlet />
          </div>

          {/* Global Footer */}
          <footer className="p-4 text-center border-t border-border/40 bg-muted/5 hidden md:block">
            <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase opacity-50">POWERED BY VERTEX TECH SOLUTIONS</p>
          </footer>

          {/* Enhanced Mobile Bottom Navigation - Scrollable */}
          <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-xl border-t border-border flex items-center overflow-x-auto no-scrollbar z-50 md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 gap-2">
            {mobileNavItems.map((item) => (
              <Link 
                key={item.title} 
                to={item.path} 
                onClick={hapticFeedback}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[72px] h-full transition-all duration-300 relative shrink-0 group",
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive(item.path) ? "bg-primary/10 shadow-inner scale-110" : "group-hover:bg-accent/10"
                )}>
                  <item.icon className={cn("h-5 w-5", isActive(item.path) && "animate-pulse")} />
                </div>
                <span className={cn(
                  "text-[9px] font-black mt-1.5 uppercase tracking-tighter transition-all",
                  isActive(item.path) ? "opacity-100" : "opacity-60"
                )}>{item.shortTitle}</span>
                {isActive(item.path) && (
                  <div className="absolute bottom-1 w-6 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                )}
              </Link>
            ))}
          </nav>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;