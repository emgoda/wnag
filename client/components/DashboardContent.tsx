import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DataRow {
  id: string;
  status: "active" | "pending";
  statusText: string;
  timestamp: string;
  description: string;
  fileName?: string;
}

const sampleData: DataRow[] = [
  {
    id: "51136",
    status: "active",
    statusText: "绿色",
    timestamp: "今天 10:51:23",
    description: "任务详情页 分析中",
    fileName: ""
  },
  {
    id: "51134",
    status: "pending", 
    statusText: "待处理",
    timestamp: "今天 10:50:45",
    description: "定时任务 上传中...",
    fileName: "pending-01.txt"
  }
];

export function DashboardContent() {
  return (
    <div className="flex-1 bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-sm px-6 py-5 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                控制面板
              </h1>
              <p className="text-sm text-muted-foreground mt-1">欢迎回来，管理您的系统</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 shadow-sm">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  运行正常
                </span>
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-success transition-colors" />
              <Input
                placeholder="搜索任务..."
                className="pl-9 w-64 bg-white/70 border-border/50 focus:bg-white focus:border-success/50 transition-all duration-200"
              />
            </div>
            <Button size="sm" className="bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-lg shadow-success/25 transition-all duration-200 hover:scale-105">
              <span className="flex items-center gap-2">
                ✨ 新建任务
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-foreground mb-1">1,247</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                📊 总任务数
                <div className="text-xs bg-muted rounded-full px-2 py-0.5">+12%</div>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success/20 to-success/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-success mb-1">856</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                ✅ 已完成
                <div className="text-xs bg-success/10 text-success rounded-full px-2 py-0.5">+8%</div>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-orange-600/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-orange-500 mb-1">234</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                ⚡ 进行中
                <div className="text-xs bg-orange-50 text-orange-600 rounded-full px-2 py-0.5">活跃</div>
              </div>
            </div>
          </div>
          <div className="group bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="relative">
              <div className="text-3xl font-bold text-red-500 mb-1">157</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                ⏳ 待处理
                <div className="text-xs bg-red-50 text-red-600 rounded-full px-2 py-0.5">紧急</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-white to-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">最近任务</h2>
                <p className="text-sm text-muted-foreground">查看和管理您的最新任务</p>
              </div>
              <Button variant="outline" size="sm" className="hover:bg-muted/50">
                <span className="flex items-center gap-2">
                  🔄 刷新
                </span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/30 to-muted/10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">任务ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">时间</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">描述</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sampleData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gradient-to-r hover:from-muted/20 hover:to-transparent transition-all duration-200 group">
                    <td className="px-6 py-5 text-sm font-mono text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        #{row.id}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="outline"
                        className={
                          row.status === "active"
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 shadow-sm"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 shadow-sm"
                        }
                      >
                        <span className="flex items-center gap-1">
                          {row.status === "active" ? "🟢" : "🟡"}
                          {row.statusText}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        🕒 {row.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-foreground">
                      <div className="font-medium">{row.description}</div>
                      {row.fileName && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          📄 文件: {row.fileName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600">
                          👁️ 查看
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600">
                          ✏️ 编辑
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border bg-gradient-to-r from-muted/10 to-transparent flex items-center justify-between">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              📋 显示 1-2 条，共 2 条记录
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="opacity-50">
                ← 上一页
              </Button>
              <Button variant="outline" size="sm" disabled className="opacity-50">
                下一页 →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
