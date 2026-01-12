import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, 
  CreditCard, 
  FileText,
  GraduationCap, 
  Users, 
  Gift, 
  ChevronUp,
  LogOut,
  X,
  MessageSquare
} from "lucide-react";
import badgeLogo from "@/assets/logos/reelychat-mascot-badge.svg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const mainNavItems = [
  { icon: Home, label: "Getting Started", path: "/dashboard" },
  { icon: MessageSquare, label: "AutoDM", path: "/dashboard/autodm" },
  { icon: FileText, label: "Templates", path: "/dashboard/templates" },
  { icon: CreditCard, label: "Payments", path: "/dashboard/payments" },
  { icon: GraduationCap, label: "Learn", path: "/dashboard/learn" },
  { icon: Users, label: "Audience", path: "/dashboard/audience" },
  { icon: Gift, label: "Refer & Earn", path: "/dashboard/refer" },
];

// Slightly narrower sidebar for a tighter layout
// (class change applied below on the <aside>)

// Removed: SuperLinks & Lead Magnet (no longer shown in sidebar)
const appNavItems: Array<any> = []; // kept for compatibility if referenced elsewhere

const DashboardSidebar = ({ onClose, isMobile }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Persist collapsed state in localStorage so it's consistent across pages
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sidebar_collapsed');
      if (stored !== null) return stored === 'true';
    } catch (err) {
      // ignore (e.g., during SSR)
    }
    // default false (not collapsed) if not set
    return false;
  });

  // If user just logged in and there's no preference, default to collapsed
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar_collapsed');
      if (user && stored === null) {
        // Default: expanded on mobile, collapsed on desktop
        const initialCollapsed = !isMobile;
        localStorage.setItem('sidebar_collapsed', String(initialCollapsed));
        setCollapsed(initialCollapsed);
      }
    } catch (err) {
      // ignore
    }
  }, [user, isMobile]);

  // Ensure mobile users see the expanded sidebar
  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    }
  }, [isMobile]);
  
  const fullName = user?.user_metadata?.full_name || "User";
  const email = user?.email || "";

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const NavItem = ({ item, isActive, index }: { item: typeof mainNavItems[0]; isActive: boolean; index: number }) => (
    <Link
      to={item.path}
      onClick={handleNavClick}
      title={item.label}
      aria-label={item.label}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-4",
        "active:scale-[0.98] touch-manipulation group",
        isActive 
          ? "bg-gradient-to-r from-primary/20 to-transparent text-primary-foreground shadow-glow" 
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        collapsed ? "justify-center px-0 py-0 w-12 h-12 rounded-full" : ""
      )}
    >
      {/* Left active indicator (visible when expanded) */}
      {!collapsed && isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-lg bg-primary" />
      )}

      {/* Small active dot when collapsed */}
      {collapsed && isActive && (
        <span className="absolute left-1/2 -translate-x-1/2 top-2 w-2 h-2 rounded-full bg-primary" />
      )}

      <item.icon className={cn(collapsed ? "w-7 h-7" : "w-6 h-6", "flex-shrink-0 transition-transform duration-200 group-hover:scale-105", isActive && "animate-bounce-in")} />
      <span className={cn("text-sm font-medium truncate", collapsed && "hidden")}>{item.label}</span>
    </Link>
  );

  return (
    <aside className={cn(collapsed ? 'w-20 lg:w-20' : 'w-56 lg:w-56', 'h-screen sidebar-gradient flex flex-col overflow-hidden transition-all duration-200 border-r border-sidebar-border/60 shadow-sm')}>
      {/* Logo */}
      <div className="p-4 lg:p-6 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 group" aria-label="ReelyChat home">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 bg-card", collapsed && "mx-auto") }>
            <img src={badgeLogo} alt="ReelyChat" className="w-6 h-6" />
          </div>
          {!collapsed && (
            <span className={cn("text-lg lg:text-xl font-bold text-sidebar-foreground")}>ReelyChat</span>
          )}
        </Link>"
        
        {/* Close button for mobile */}
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = !collapsed;
              try { localStorage.setItem('sidebar_collapsed', String(next)); } catch (err) {}
              setCollapsed(next);
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronUp className={cn("w-5 h-5 transform transition-transform", collapsed ? "rotate-90" : "-rotate-90")} />
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className={cn("flex-1 px-4 space-y-4 overflow-y-auto min-h-0 no-scrollbar", collapsed && "items-center") }>
        {mainNavItems.map((item, index) => (
          <NavItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path}
            index={index}
          />
        ))}

        {/* Apps section removed for clarity */}
        
        {/* Divider for clearer grouping */}
        <div className="pt-6 w-full">
          <div className="px-3">
            <div className={cn("h-px bg-sidebar-border/60 rounded", collapsed && "hidden")} />
          </div>
        </div>
      </nav>

      {/* Upgrade Banner */}
      <div className="p-3 mt-4 flex-shrink-0 w-full">
        {!collapsed ? (
          <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl p-3 lg:p-4 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-xl lg:text-2xl">✨</span>
            </div>
            <p className="text-sm font-medium text-sidebar-foreground mb-1">
              You're on Free Plan
            </p>
            <p className="text-xs text-sidebar-foreground/70 mb-2 lg:mb-3 pr-6">
              Unlock unlimited access to all features.
            </p>

            <div className="mt-2">
              <Button
                size="sm"
                onClick={() => navigate('/dashboard/billing')}
                className="w-full bg-card text-foreground hover:bg-card/90 active:scale-[0.98] transition-transform text-xs lg:text-sm"
                title="Upgrade"
              >
                Upgrade
              </Button>
            </div>

            <div className="mt-2 text-xs text-sidebar-foreground/50">
              Contact support to upgrade.
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Button
              size="icon"
              className="w-12 h-12 p-0 rounded-full bg-gradient-to-br from-primary/40 to-purple-500/40 text-white shadow"
              onClick={() => navigate('/dashboard/billing')}
              title="Upgrade"
            >
              <CreditCard className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 mt-4 border-t border-sidebar-border flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button title={fullName} className="flex items-center gap-2 lg:gap-3 w-full p-2 lg:p-3 rounded-lg hover:bg-sidebar-accent active:scale-[0.98] transition-all touch-manipulation">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-reely-orange rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-base lg:text-lg">👤</span>
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{fullName}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{email}</p>
                </div>
              )}
              <ChevronUp className={cn("w-4 h-4 text-sidebar-foreground/50 flex-shrink-0", collapsed && "hidden")} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={cn("w-56", collapsed && "w-44") }>
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
