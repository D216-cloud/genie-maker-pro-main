import { Outlet, Link, Navigate, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Menu, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInstagram } from "@/hooks/useInstagram";

const MobileConnect = () => {
  const { connectInstagram, connecting, isConnected } = useInstagram();
  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => connectInstagram()} disabled={connecting || isConnected}>
        {connecting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Connecting</span> : (isConnected ? (<span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Connected</span>) : 'Connect')}
      </Button>
    </div>
  );
};

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Open the sidebar by default on mobile, close on desktop
      if (mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen lg:z-auto",
        isMobile && !sidebarOpen && "-translate-x-full",
        isMobile && sidebarOpen && "translate-x-0",
        "transition-transform duration-300 ease-out flex-shrink-0"
      )}>
        <DashboardSidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>
      
      <main className="flex-1 w-full min-w-0 overflow-x-hidden overflow-y-auto h-screen">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-muted active:scale-95 transition-transform"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-base font-bold text-foreground">ReelyChat</span>
          <div className="flex items-center gap-2">
            <MobileConnect />
            <Link to="/dashboard/billing">
              <Button size="sm" variant="outline" className="ml-1">Premium</Button>
            </Link>
          </div>
        </div>

        {/* Top Banner - Hidden on mobile */}
        <div className="hidden lg:flex bg-background border-b border-border px-6 py-3 items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 bg-reely-orange/10 text-reely-orange px-3 py-1 rounded-full text-sm font-medium animate-pulse-subtle">
            ✨ You're on Free Plan
          </span>
          <span className="text-sm text-muted-foreground">
            Unlock unlimited access to all features and get paid.
          </span>
          <Link to="#" className="text-sm text-primary font-medium hover:underline">
            Upgrade now
          </Link>
        </div>

        {/* Dev banner: missing Supabase config */}
        {(import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === undefined) && (
          <div className="bg-amber-50 border-t border-amber-200 text-amber-800 px-4 py-3 text-sm flex items-center gap-3">
            <span className="font-medium">Warning:</span>
            <span>Supabase client is not fully configured (check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY env vars). Auth may not work correctly in development.</span>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 lg:p-6 min-h-[calc(100vh-52px)] w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
