import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface ProjectItem {
  id: string;
  status: "pending" | "in_progress" | "testing" | "completed" | "on_hold";
  statusText: string;
  projectName: string;
  clientName: string;
  priority: "high" | "medium" | "low";
  assignedTo?: string;
  progress?: number;
  progressText?: string;
  deadline: string;
  estimatedHours: string;
  technologies: string[];
  description: string;
}

const projectData: ProjectItem[] = [
  {
    id: "PRJ-001",
    status: "pending",
    statusText: "待开发",
    projectName: "企业官网重构",
    clientName: "科技有限公司",
    priority: "high",
    assignedTo: "",
    deadline: "2024-02-15",
    estimatedHours: "120h",
    technologies: ["React", "TypeScript", "TailwindCSS"],
    description: "企业官网全面重构，包含响应式设计和SEO优化"
  },
  {
    id: "PRJ-002",
    status: "pending",
    statusText: "待开发",
    projectName: "电商小程序",
    clientName: "零售连锁集团",
    priority: "medium",
    assignedTo: "",
    deadline: "2024-03-01",
    estimatedHours: "200h",
    technologies: ["微信小程序", "Node.js", "MongoDB"],
    description: "多商户电商平台小程序，支持在线支付和订单管理"
  },
  {
    id: "PRJ-003",
    status: "pending",
    statusText: "待开发",
    projectName: "数据可视化平台",
    clientName: "金融投资公司",
    priority: "high",
    assignedTo: "",
    deadline: "2024-01-30",
    estimatedHours: "150h",
    technologies: ["Vue.js", "D3.js", "Python"],
    description: "实时数据分析和可视化平台，支持多种图表类型"
  },
  {
    id: "PRJ-004",
    status: "pending",
    statusText: "待开发",
    projectName: "在线教育系统",
    clientName: "教育培训机构",
    priority: "medium",
    assignedTo: "",
    deadline: "2024-04-15",
    estimatedHours: "300h",
    technologies: ["Next.js", "PostgreSQL", "Redis"],
    description: "完整的在线教育平台，包含课程管理、直播功能和学习进度追踪"
  },
  {
    id: "PRJ-005",
    status: "pending",
    statusText: "待开发",
    projectName: "移动端App",
    clientName: "健康医疗公司",
    priority: "low",
    assignedTo: "",
    deadline: "2024-05-20",
    estimatedHours: "250h",
    technologies: ["React Native", "GraphQL", "AWS"],
    description: "健康管理App，包含健康数据记录和医生咨询功能"
  },
  {
    id: "PRJ-006",
    status: "pending",
    statusText: "待开发",
    projectName: "CRM管理系统",
    clientName: "销售服务公司",
    priority: "medium",
    assignedTo: "",
    deadline: "2024-03-30",
    estimatedHours: "180h",
    technologies: ["Angular", "Spring Boot", "MySQL"],
    description: "客户关系管理系统，支持销售流程自动化和客户数据分析"
  },
  {
    id: "PRJ-007",
    status: "pending",
    statusText: "待开发",
    projectName: "IoT监控平台",
    clientName: "智能制造企业",
    priority: "high",
    assignedTo: "",
    deadline: "2024-02-28",
    estimatedHours: "220h",
    technologies: ["React", "MQTT", "InfluxDB"],
    description: "工业设备IoT监控平台，实时数据采集和预警系统"
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-50 text-red-600 border-red-200";
    case "medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "low": return "bg-green-50 text-green-600 border-green-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case "high": return "高优先级";
    case "medium": return "中优先级";
    case "low": return "低优先级";
    default: return "普通";
  }
};

export function ControlTerminal() {
  const [projects, setProjects] = useState<ProjectItem[]>(projectData);

  const handleDeleteProject = (projectId: string) => {
    if (confirm(`确定要删除项目 ${projectId} 吗？此操作不可撤销。`)) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
    }
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">💼 项目管理</span>
            <h1 className="text-lg font-medium text-foreground">待开发项目</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📊 项目统计
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              👥 分配开发者
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              📅 排期管理
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              🔍 筛选项目
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              ➕ 新建项目
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Project List */}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={project.id} className="bg-white border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Project ID & Priority */}
                <div className="col-span-2">
                  <div className="flex flex-col gap-2">
                    <Badge 
                      variant="outline"
                      className="bg-blue-50 text-blue-600 border-blue-200 w-fit"
                    >
                      {project.id}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={getPriorityColor(project.priority) + " w-fit"}
                    >
                      {getPriorityText(project.priority)}
                    </Badge>
                  </div>
                </div>

                {/* Project Info */}
                <div className="col-span-3">
                  <div className="text-base font-medium text-foreground mb-1">
                    {project.projectName}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    客户：{project.clientName}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </div>
                </div>

                {/* Technologies */}
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">技术栈</div>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 2).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">截止日期</div>
                    <div className="text-sm font-medium text-foreground">{project.deadline}</div>
                    <div className="text-xs text-muted-foreground">预计：{project.estimatedHours}</div>
                  </div>
                </div>

                {/* Assignment Status */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">分配状态</div>
                    {project.assignedTo ? (
                      <div className="text-sm text-foreground">{project.assignedTo}</div>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                        待分配
                      </Badge>
                    )}
                    <div className="text-xs text-blue-600">{project.statusText}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    <Button variant="outline" size="sm" className="text-xs h-7 bg-green-50 hover:bg-green-100 text-green-700">
                      开始开发
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      分配
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-gray-500">
                      详情
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </div>

              {/* Extended project details */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="grid grid-cols-6 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">项目类型: </span>
                    <span className="text-foreground">Web开发</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">创建时间: </span>
                    <span className="text-foreground">2024-01-15</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">需求复杂度: </span>
                    <span className="text-foreground">中等</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">预算范围: </span>
                    <span className="text-foreground">10-20万</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">团队规模: </span>
                    <span className="text-foreground">2-3人</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">风险评估: </span>
                    <span className="text-green-600">低风险</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              共 {projects.length} 个待开发项目 •
              {projects.filter(p => p.priority === "high").length} 个高优先级 •
              {projects.filter(p => !p.assignedTo).length} 个待分配 •
              预计总工时：{projects.reduce((sum, p) => sum + parseInt(p.estimatedHours), 0)}h
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                📊 工时统计
              </Button>
              <Button variant="outline" size="sm">
                📈 进度报告
              </Button>
              <Button variant="outline" size="sm">
                🔄 批量操作
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
