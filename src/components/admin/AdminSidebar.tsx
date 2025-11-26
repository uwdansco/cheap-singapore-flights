import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Plane, 
  Mail, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  TestTube2,
  FlaskConical,
  Shield,
  Zap,
  User,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Subscribers", url: "/admin/subscribers", icon: Users },
  { title: "Destinations", url: "/admin/destinations", icon: MapPin },
  { title: "Deals", url: "/admin/deals", icon: Plane },
  { title: "Guarantee Claims", url: "/admin/guarantee-claims", icon: Shield },
  { title: "Send Email", url: "/admin/send-email", icon: Mail },
  { title: "Price Monitoring", url: "/admin/monitoring", icon: Activity },
  { title: "Comprehensive Test", url: "/admin/comprehensive-test", icon: Zap },
  { title: "Test Alerts", url: "/admin/test-alerts", icon: TestTube2 },
  { title: "Test System", url: "/admin/test-system", icon: FlaskConical },
  { title: "Audit Log", url: "/admin/audit", icon: Mail },
];

export function AdminSidebar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user?.email) return 'A';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <h2 className="font-bold text-lg">Admin</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || 'Admin'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email || ''}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-2 h-auto py-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || 'Admin'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {user?.email || ''}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
