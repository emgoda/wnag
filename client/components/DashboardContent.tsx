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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <div className="text-sm text-muted-foreground">总任务数</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-success">856</div>
            <div className="text-sm text-muted-foreground">已完成</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-orange-500">234</div>
            <div className="text-sm text-muted-foreground">进行中</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-2xl font-bold text-red-500">157</div>
            <div className="text-sm text-muted-foreground">待处理</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-medium">最近任务</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">任务ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">状态</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">时间</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">描述</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sampleData.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-mono text-foreground">
                      #{row.id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          row.status === "active"
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-50"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                        }
                      >
                        {row.statusText}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {row.timestamp}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div>{row.description}</div>
                      {row.fileName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          文件: {row.fileName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          查看
                        </Button>
                        <Button variant="outline" size="sm">
                          编辑
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              显示 1-2 条，共 2 条记录
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
