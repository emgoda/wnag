import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ReviewItem {
  id: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "waiting_info";
  statusText: string;
  type: "content" | "user" | "document" | "media" | "business";
  title: string;
  submitter: string;
  submittedTime: string;
  reviewerName?: string;
  priority: "high" | "medium" | "low";
  category: string;
  description: string;
  attachments?: number;
  lastUpdate?: string;
}

const reviewData: ReviewItem[] = [
  {
    id: "REV-2024-001",
    status: "reviewing",
    statusText: "审核中",
    type: "content",
    title: "用户发布内容审核",
    submitter: "张小明",
    submittedTime: "2024-01-20 09:15:23",
    reviewerName: "李审核员",
    priority: "high",
    category: "内容审核",
    description: "用户发布疑似违规内容，需要人工审核确认",
    attachments: 3,
    lastUpdate: "2024-01-20 10:30:15"
  },
  {
    id: "REV-2024-002",
    status: "pending",
    statusText: "待审核",
    type: "user",
    title: "用户实名认证申请",
    submitter: "王小红",
    submittedTime: "2024-01-20 08:45:12",
    priority: "medium",
    category: "身份认证",
    description: "用户提交身份证件，申请实名认证",
    attachments: 2
  },
  {
    id: "REV-2024-003",
    status: "waiting_info",
    statusText: "待补充",
    type: "business",
    title: "企业资质审核",
    submitter: "科技有限公司",
    submittedTime: "2024-01-19 16:20:45",
    reviewerName: "陈审核员",
    priority: "high",
    category: "企业认证",
    description: "企业资质文件不完整，等待用户补充材料",
    attachments: 5,
    lastUpdate: "2024-01-20 09:00:00"
  },
  {
    id: "REV-2024-004",
    status: "approved",
    statusText: "已通过",
    type: "document",
    title: "用户资料变更申请",
    submitter: "赵小刚",
    submittedTime: "2024-01-19 14:30:22",
    reviewerName: "刘审核员",
    priority: "low",
    category: "资料变更",
    description: "用户申请修改个人基本信息",
    attachments: 1,
    lastUpdate: "2024-01-20 08:15:30"
  },
  {
    id: "REV-2024-005",
    status: "rejected",
    statusText: "已拒绝",
    type: "media",
    title: "图片内容举报处理",
    submitter: "系统检测",
    submittedTime: "2024-01-19 12:15:08",
    reviewerName: "孙审核员",
    priority: "high",
    category: "违规处理",
    description: "AI检测到疑似违规图片，经人工审核确认违规",
    attachments: 4,
    lastUpdate: "2024-01-19 15:45:12"
  }
];

export function ControlTerminal() {
  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">📊 神经网络ML1.15</span>
            <h1 className="text-lg font-medium text-foreground">控制台终端目录</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              💾 暂停设定
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              🔄 重启
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ⚡ 关机
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              🔧 系统设定
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ⏸️ 暂停运算
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Task List */}
        <div className="space-y-3">
          {taskData.map((task, index) => (
            <div key={task.id} className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Task ID & Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={
                        task.status === "running" 
                          ? "bg-green-50 text-green-600 border-green-200" 
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      编号: {task.id}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.statusText}
                  </div>
                </div>

                {/* File Info */}
                <div className="col-span-2">
                  <div className="text-sm text-foreground">
                    {task.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {task.fileCount}
                  </div>
                </div>

                {/* Model/Details */}
                <div className="col-span-2">
                  {task.model && (
                    <div className="text-sm text-foreground">{task.model}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {task.type}
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-3">
                  {task.progress ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">进度</span>
                        <span className="text-foreground font-medium">{task.progressText}</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">等待中...</div>
                  )}
                </div>

                {/* Memory & Operations */}
                <div className="col-span-2">
                  {task.memory && (
                    <div className="text-xs">
                      <div className="text-muted-foreground">内存: {task.memory}</div>
                      {task.operations && (
                        <div className="text-muted-foreground">操作: {task.operations}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    {task.status === "running" ? (
                      <>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          暂停
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          停止
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="text-xs h-6 bg-green-50 hover:bg-green-100 text-green-700">
                          启动
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          删除
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Extended row for running tasks */}
              {task.status === "running" && task.progress && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="grid grid-cols-6 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">类型: </span>
                      <span className="text-foreground">文本处理</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">开始时间: </span>
                      <span className="text-foreground">09:45:23</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">预计完成: </span>
                      <span className="text-foreground">10:23:45</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPU: </span>
                      <span className="text-foreground">45%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">状态: </span>
                      <span className="text-green-600">正常运行</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">优先级: </span>
                      <span className="text-foreground">中等</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              共 {taskData.length} 个任务 • 
              {taskData.filter(t => t.status === "running").length} 个运行中 • 
              {taskData.filter(t => t.status === "paused").length} 个已暂停
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                🔄 刷新列表
              </Button>
              <Button variant="outline" size="sm">
                📊 性能监控
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                ➕ 新建任务
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
