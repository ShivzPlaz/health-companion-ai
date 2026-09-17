import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  LayoutDashboard,
  MessageSquare,
  User,
  Stethoscope,
  Plus,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, getToken, getUser, setUserProfile } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { LanguageToggle } from "./language-toggle";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const items = [
  {
    titleKey: "sidebar.my_health",
    url: "/user",
    icon: User,
  },
  {
    titleKey: "sidebar.ai_consultation",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    titleKey: "sidebar.telemedicine",
    url: "/appointments",
    icon: Stethoscope,
  },
  {
    titleKey: "sidebar.symptom_analysis",
    url: "/symptoms",
    icon: Activity,
  },
  {
    titleKey: "sidebar.lab_reports",
    url: "/reports",
    icon: FileText,
  },
  {
    titleKey: "sidebar.dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<{ id: number; title: string }[]>([]);

  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getUser());
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const userName = user?.name || "Guest User";
  const userEmail = user?.email || "Not logged in";
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    if (!user) {
      fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Not logged in");
        })
        .then((data) => setUserProfile(data))
        .catch(() => {});
    }

    fetch(`${API_BASE_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setConversations(data.slice(0, 5)))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/60 p-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-hero shadow-soft">
            <Stethoscope className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-sm font-semibold">NexCure AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-3">
          <Button
            className="w-full justify-start bg-gradient-hero text-primary-foreground shadow-soft hover:opacity-95"
            onClick={() => {
              navigate({ to: "/chat" });
              window.dispatchEvent(new Event("new-chat"));
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> New consultation
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{t(item.titleKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Consultations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((c) => (
                <SidebarMenuItem key={c.id}>
                  <SidebarMenuButton asChild>
                    <button className="w-full flex items-start gap-2 h-auto py-2">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 text-left flex-1">
                        <p className="truncate font-medium leading-tight">{c.title}</p>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs text-muted-foreground">{t("sidebar.language", "Language")}</span>
          <LanguageToggle />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-accent/40 cursor-pointer transition-colors">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary text-sm font-semibold">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium leading-tight">{userName}</p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">{userEmail}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
                className="pointer-events-none"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/settings" className="w-full">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/settings" className="w-full">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
