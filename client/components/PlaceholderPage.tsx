import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex-1 bg-background">
      <div className="border-b border-border bg-white px-6 py-4">
        <h1 className="text-lg font-medium">{title}</h1>
      </div>
      
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Construction className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">页面开发中</h2>
          <p className="text-muted-foreground mb-4">
            {description || "此页面功能正在开发中，敬请期待。"}
          </p>
          <Button variant="outline">
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
