import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  RefreshCw,
  BarChart3,
  Users,
  Activity,
  ArrowLeft,
  Settings,
  Landmark,
  LogOut,
  Image,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Overview", value: "overview", icon: LayoutDashboard },
  { title: "Bookings", value: "bookings", icon: CalendarCheck },
  { title: "Rooms", value: "rooms", icon: Building2 },
  { title: "Hero", value: "hero", icon: Image },
  { title: "Registered Guests", value: "guest-registrations", icon: Users },
  { title: "Calendar Sync", value: "sync", icon: RefreshCw },
  { title: "Analytics", value: "analytics", icon: BarChart3 },
  { title: "Staff", value: "staff", icon: Users },
  { title: "Activity Log", value: "activity", icon: Activity },
  { title: "Payments", value: "payments", icon: Landmark },
  { title: "Guest Registration", value: "guest-registration", icon: CalendarCheck },
  { title: "Settings", value: "settings", icon: Settings },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hiddenTabs?: string[];
}

export default function AdminSidebar({ activeTab, onTabChange, hiddenTabs }: AdminSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate("/staff-login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex items-center justify-center rounded-lg overflow-hidden">
            <Link to="/" aria-label="Home">
              <img src="/mba_suites_logo.png" alt="MBA" className="h-8 w-auto block" />
            </Link>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">MBA Suites</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => !hiddenTabs || !hiddenTabs.includes(item.value))
                .map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.value)}
                      isActive={activeTab === item.value}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/")} tooltip="Back to site">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to site</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
