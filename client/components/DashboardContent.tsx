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
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium">控制面板</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">状态:</span>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                运行正常
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜索任务..."
                className="pl-9 w-64"
              />
            </div>
            <Button size="sm" className="bg-success hover:bg-success/90">
              新建任务
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
                        variant={row.status === "active" ? "default" : "secondary"}
                        className={
                          row.status === "active" 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-orange-50 text-orange-600 border-orange-200"
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
