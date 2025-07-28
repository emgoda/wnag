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
            <h1 className="text-lg font-medium text-foreground">审核管理终端</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              {reviewData.filter(r => r.status === "pending").length} 待审核
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📋 全部审核
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ⚡ 批量操作
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📊 审核统计
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              🔧 规则设置
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              👥 审核员管理
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Review List */}
        <div className="space-y-3">
          {reviewData.map((review, index) => (
            <div key={review.id} className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Review ID & Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={
                        review.status === "pending" ? "bg-orange-50 text-orange-600 border-orange-200" :
                        review.status === "reviewing" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        review.status === "approved" ? "bg-green-50 text-green-600 border-green-200" :
                        review.status === "rejected" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {review.statusText}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {review.id}
                  </div>
                </div>

                {/* Review Info */}
                <div className="col-span-3">
                  <div className="text-sm font-medium text-foreground mb-1">
                    {review.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    分类: {review.category}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    提交人: {review.submitter}
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <div className="text-sm text-foreground mb-1">
                    {review.description}
                  </div>
                  {review.attachments && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      📎 附件: {review.attachments} 个
                    </div>
                  )}
                </div>

                {/* Time & Reviewer */}
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    提交时间: {review.submittedTime}
                  </div>
                  {review.reviewerName && (
                    <div className="text-xs text-muted-foreground">
                      审核人: {review.reviewerName}
                    </div>
                  )}
                  {review.lastUpdate && (
                    <div className="text-xs text-muted-foreground">
                      更新: {review.lastUpdate}
                    </div>
                  )}
                </div>

                {/* Priority & Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={
                        review.priority === "high" ? "bg-red-50 text-red-600 border-red-200" :
                        review.priority === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }
                    >
                      {review.priority === "high" ? "🔴 高优先级" :
                       review.priority === "medium" ? "🟡 中优先级" :
                       "⚪ 低优先级"}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    {review.status === "pending" ? (
                      <>
                        <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700">
                          🔍 开始审核
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          📋 查看详情
                        </Button>
                      </>
                    ) : review.status === "reviewing" ? (
                      <>
                        <Button size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700">
                          ✅ 通过
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50">
                          ❌ 拒绝
                        </Button>
                      </>
                    ) : review.status === "waiting_info" ? (
                      <>
                        <Button variant="outline" size="sm" className="text-xs h-7 bg-yellow-50 text-yellow-700 border-yellow-200">
                          📞 催促补充
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          📋 查看详情
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          📋 查看详情
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          📝 审核记录
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-6 mb-4">
            {/* Left: Statistics */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">审核统计</div>
              <div className="grid grid-cols-5 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-orange-600 font-medium">
                    {reviewData.filter(r => r.status === "pending").length}
                  </div>
                  <div className="text-muted-foreground">待审核</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600 font-medium">
                    {reviewData.filter(r => r.status === "reviewing").length}
                  </div>
                  <div className="text-muted-foreground">审核中</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-medium">
                    {reviewData.filter(r => r.status === "approved").length}
                  </div>
                  <div className="text-muted-foreground">已通过</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-medium">
                    {reviewData.filter(r => r.status === "rejected").length}
                  </div>
                  <div className="text-muted-foreground">已拒绝</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-medium">
                    {reviewData.filter(r => r.status === "waiting_info").length}
                  </div>
                  <div className="text-muted-foreground">待补充</div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">快速操作</div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  🔄 刷新列表
                </Button>
                <Button variant="outline" size="sm">
                  📊 审核报告
                </Button>
                <Button variant="outline" size="sm">
                  📥 批量导入
                </Button>
                <Button variant="outline" size="sm">
                  🔍 高级筛选
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  📝 手动创建审核
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            共 {reviewData.length} 条审核记录 • 今日新增 3 条 • 平均审核时长 2.5 小时 • 审核通过率 78%
          </div>
        </div>
      </div>
    </div>
  );
}
