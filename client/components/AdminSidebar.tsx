import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  Database,
  CheckSquare,
  Settings,
  ChevronDown,
  Monitor,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", label: "首页", icon: Home, path: "/" },
  { id: "control", label: "控制台终端", icon: BarChart3, path: "/control-panel" },
  { id: "monitor", label: "网页监控", icon: Monitor, path: "/web-monitor" },
  { id: "web-creation", label: "网页制作", icon: Code, path: "/web-creation" },
  { id: "data", label: "数据访问", icon: Database, path: "/data-access" },
  { id: "tasks", label: "所有任务", icon: CheckSquare, path: "/tasks", hasSubmenu: true },
  { id: "settings", label: "系统设置", icon: Settings, path: "/settings" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-60 bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border h-full flex flex-col shadow-sm">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">管理控制台</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-success text-white font-medium shadow-lg shadow-success/25 scale-[1.02]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-success to-success/80 rounded-xl" />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10 transition-transform group-hover:scale-110", isActive && "text-white")} />
                  <span className="flex-1 relative z-10">{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronDown className={cn("w-4 h-4 relative z-10 transition-transform", isActive && "text-white")} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Status */}
      <div className="border-t border-sidebar-border/50 p-4 bg-sidebar-accent/20">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-sidebar-foreground">用户已登录系统</div>
            <div className="text-xs text-muted-foreground">在线状态良好</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-3 text-center">
          版本: petfood.x • accompany-ou
        </div>
      </div>
    </div>
  );
}
