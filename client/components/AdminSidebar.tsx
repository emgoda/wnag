import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  Database, 
  CheckSquare, 
  Settings,
  ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", label: "首页", icon: Home, path: "/" },
  { id: "control", label: "控制面板", icon: BarChart3, path: "/control-panel" },
  { id: "data", label: "数据访问", icon: Database, path: "/data-access" },
  { id: "tasks", label: "所有任务", icon: CheckSquare, path: "/tasks", hasSubmenu: true },
  { id: "settings", label: "系统设置", icon: Settings, path: "/settings" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
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
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Bottom Status */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>用户已登录系统</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          版本: petfood.x 版本: accompany-ou
        </div>
      </div>
    </div>
  );
}
