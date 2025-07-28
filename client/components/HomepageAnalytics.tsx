import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  label: string;
  value: string | number;
  trend?: string;
  category: "output" | "device" | "monthly";
}

const analyticsData: AnalyticsData[] = [
  { label: "一个月输出量", value: "13756", category: "output" },
  { label: "一个月���备量", value: "13756", category: "device" },
  { label: "一个月输入量", value: "13756", category: "output" },
  { label: "设备输入", value: "401", category: "device" },
  { label: "设备上线", value: "401", category: "device" },
  { label: "本月输入量", value: "401", category: "monthly" },
  { label: "存储设置", value: "401", category: "device" },
  { label: "设备输入量", value: "401", category: "device" },
  { label: "一个月输出量", value: "80", category: "output" },
  { label: "存储设置", value: "80", category: "device" },
  { label: "本月输出量", value: "80", category: "monthly" },
  { label: "一个月输入量", value: "80", category: "output" },
];

export function HomepageAnalytics() {
  return (
    <div className="flex-1 bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-sm px-6 py-5 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              首页
            </h1>
            <p className="text-sm text-muted-foreground mt-1">系统数据概览</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200">
              数据已同步
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Data Metrics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                📊 神经网络ML1.15
              </h2>
              
              <div className="space-y-4">
                {analyticsData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.category === 'output' ? 'bg-blue-500' :
                        item.category === 'device' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}></div>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <div className="font-semibold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-muted-foreground">输出相关</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <span className="text-muted-foreground">设备相关</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                    <span className="text-muted-foreground">月度统计</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Pie Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="relative">
                  {/* Main Pie Chart */}
                  <div className="w-80 h-80 relative">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="20"
                      />
                      
                      {/* Blue segment (major portion - ~85%) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray="427 75"
                        strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Light blue segment (~10%) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="20"
                        strokeDasharray="50 452"
                        strokeDashoffset="-427"
                        className="transition-all duration-1000 ease-out delay-300"
                      />
                      
                      {/* Green segment (~5%) */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="20"
                        strokeDasharray="25 477"
                        strokeDashoffset="-477"
                        className="transition-all duration-1000 ease-out delay-600"
                      />
                    </svg>
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">85%</div>
                        <div className="text-sm text-muted-foreground mt-1">总体完成率</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                        <span className="text-muted-foreground">主要数据</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                        <span className="text-muted-foreground">次要数据</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                        <span className="text-muted-foreground">其他数据</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">13,756</div>
            <div className="text-sm text-muted-foreground">月度输出总量</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">401</div>
            <div className="text-sm text-muted-foreground">设备在线数</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">80</div>
            <div className="text-sm text-muted-foreground">今日处理量</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">98.5%</div>
            <div className="text-sm text-muted-foreground">系统稳定性</div>
          </div>
        </div>
      </div>
    </div>
  );
}
