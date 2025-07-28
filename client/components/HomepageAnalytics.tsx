import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  label: string;
  value: string | number;
  trend?: string;
  category: "output" | "device" | "monthly";
}

const analyticsData: AnalyticsData[] = [
  { label: "一个月输出量", value: "13756", category: "output" },
  { label: "一个月设备量", value: "13756", category: "device" },
  { label: "一个月输入量", value: "13756", category: "output" },
  { label: "设备输���", value: "401", category: "device" },
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
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">📊 神经网络ML1.15</span>
          <h1 className="text-lg font-medium text-foreground">首页</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left side - Data Table */}
          <div className="col-span-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月输出量</span>
                  <span className="text-sm font-medium">13762</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月设备量</span>
                  <span className="text-sm font-medium">13762</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月输入量</span>
                  <span className="text-sm font-medium">13762</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">存储设置</span>
                  <span className="text-sm font-medium">13762</span>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月设备量</span>
                  <span className="text-sm font-medium">402</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">设备上线</span>
                  <span className="text-sm font-medium">402</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月设备量</span>
                  <span className="text-sm font-medium">402</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">设备输入量</span>
                  <span className="text-sm font-medium">402</span>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月输出量</span>
                  <span className="text-sm font-medium">80</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月设备量</span>
                  <span className="text-sm font-medium">80</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">一个月输入量</span>
                  <span className="text-sm font-medium">80</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">存储设置</span>
                  <span className="text-sm font-medium">80</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Pie Chart */}
          <div className="col-span-6">
            <div className="flex flex-col items-center h-full justify-center">
              {/* Chart Legend */}
              <div className="mb-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-muted-foreground">输出相关</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-sm"></div>
                  <span className="text-muted-foreground">设备相关</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-muted-foreground">其他统计</span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="w-80 h-80 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="4"
                  />

                  {/* Blue segment (major portion - ~88%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray="442 60"
                    strokeDashoffset="0"
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Cyan segment (~8%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="40"
                    strokeDasharray="40 462"
                    strokeDashoffset="-442"
                    className="transition-all duration-1000 ease-out delay-300"
                  />

                  {/* Green segment (~4%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="40"
                    strokeDasharray="20 482"
                    strokeDashoffset="-482"
                    className="transition-all duration-1000 ease-out delay-600"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
