import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Clock, Wrench } from 'lucide-react';

export default function WebEditor() {
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            网页制作功能
          </CardTitle>
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            <Clock className="w-4 h-4 mr-1" />
            待开发
          </Badge>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="text-gray-600 text-lg leading-relaxed">
            我们正在开发强大的网页制作工具，敬请期待！
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">功能开发中</span>
            </div>
            
            <div className="text-sm text-gray-500 space-y-2">
              <p>🎨 可视化页面编辑器</p>
              <p>🧩 丰富的组件库</p>
              <p>📱 响应式设计支持</p>
              <p>💾 实时保存与预览</p>
              <p>🚀 一键发布部署</p>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            预计上线时间：开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
