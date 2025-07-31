import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Type, Image, Square, Link2, List, 
  Grid, MousePointer, Menu, Video
} from 'lucide-react';

interface ElementInserterProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onContentChange: (content: string) => void;
}

// 可插入的元素类型
const elementTypes = [
  { 
    id: 'text', 
    label: '文本段落', 
    icon: Type, 
    html: '<p>这是一个新的文本段落</p>' 
  },
  { 
    id: 'heading', 
    label: '标题', 
    icon: Type, 
    html: '<h2>新标题</h2>' 
  },
  { 
    id: 'button', 
    label: '按钮', 
    icon: MousePointer, 
    html: '<button style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">点击按钮</button>' 
  },
  { 
    id: 'link', 
    label: '链接', 
    icon: Link2, 
    html: '<a href="#" style="color: #3b82f6; text-decoration: underline;">新链接</a>' 
  },
  { 
    id: 'image', 
    label: '图片', 
    icon: Image, 
    html: '<img src="https://via.placeholder.com/300x200" alt="示例图片" style="max-width: 100%; height: auto; border-radius: 6px;" />' 
  },
  { 
    id: 'container', 
    label: '容器', 
    icon: Square, 
    html: '<div style="padding: 20px; border: 2px dashed #d1d5db; border-radius: 6px; min-height: 100px;">新容器 - 在此添加内容</div>' 
  },
  { 
    id: 'list', 
    label: '列表', 
    icon: List, 
    html: '<ul><li>列表项 1</li><li>列表项 2</li><li>列表项 3</li></ul>' 
  },
  { 
    id: 'grid', 
    label: '网格容器', 
    icon: Grid, 
    html: '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 6px;"><div style="padding: 16px; background: #f8fafc; border-radius: 4px;">网格项 1</div><div style="padding: 16px; background: #f8fafc; border-radius: 4px;">网格项 2</div></div>' 
  },
  { 
    id: 'nav', 
    label: '导航栏', 
    icon: Menu, 
    html: '<nav style="display: flex; gap: 20px; padding: 16px; background: #f8fafc; border-radius: 6px;"><a href="#" style="color: #374151; text-decoration: none;">首页</a><a href="#" style="color: #374151; text-decoration: none;">关于</a><a href="#" style="color: #374151; text-decoration: none;">联系</a></nav>' 
  },
  { 
    id: 'form', 
    label: '表单', 
    icon: Square, 
    html: '<form style="padding: 20px; border: 1px solid #d1d5db; border-radius: 6px;"><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 4px;">姓名:</label><input type="text" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" /></div><div style="margin-bottom: 16px;"><label style="display: block; margin-bottom: 4px;">邮箱:</label><input type="email" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" /></div><button type="submit" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px;">提交</button></form>' 
  }
];

export default function ElementInserter({ iframeRef, onContentChange }: ElementInserterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [insertMode, setInsertMode] = useState<'before' | 'after' | 'inside'>('after');
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  // 初始化插入目标选择
  React.useEffect(() => {
    if (!isVisible) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // 添加插入点样式
      const style = iframeDoc.createElement('style');
      style.textContent = `
        .element-inserter-target {
          outline: 2px dashed #10b981 !important;
          outline-offset: 2px !important;
          cursor: crosshair !important;
        }
        .element-inserter-before::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #10b981;
          z-index: 1000;
        }
        .element-inserter-after::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #10b981;
          z-index: 1000;
        }
      `;
      iframeDoc.head.appendChild(style);

      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target !== iframeDoc.documentElement && target !== iframeDoc.body) {
          clearTargetHighlights(iframeDoc);
          target.classList.add('element-inserter-target');
          setTargetElement(target);
        }
      };

      const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target) {
          target.classList.remove('element-inserter-target');
        }
      };

      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 保持目标元素选中状态
      };

      iframeDoc.addEventListener('mouseover', handleMouseOver);
      iframeDoc.addEventListener('mouseout', handleMouseOut);
      iframeDoc.addEventListener('click', handleClick);

      return () => {
        iframeDoc.removeEventListener('mouseover', handleMouseOver);
        iframeDoc.removeEventListener('mouseout', handleMouseOut);
        iframeDoc.removeEventListener('click', handleClick);
      };
    };

    iframe.addEventListener('load', handleIframeLoad);
    return () => iframe.removeEventListener('load', handleIframeLoad);
  }, [isVisible, iframeRef]);

  // 清除目标高亮
  const clearTargetHighlights = (doc: Document) => {
    const highlighted = doc.querySelectorAll('.element-inserter-target, .element-inserter-before, .element-inserter-after');
    highlighted.forEach(el => {
      el.classList.remove('element-inserter-target', 'element-inserter-before', 'element-inserter-after');
    });
  };

  // 插入元素
  const insertElement = (elementType: typeof elementTypes[0]) => {
    if (!targetElement) {
      alert('请先在预览中选择一个插入位置');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = elementType.html;
    const newElement = tempDiv.firstElementChild as HTMLElement;

    if (!newElement) return;

    try {
      switch (insertMode) {
        case 'before':
          targetElement.parentNode?.insertBefore(newElement, targetElement);
          break;
        case 'after':
          targetElement.parentNode?.insertBefore(newElement, targetElement.nextSibling);
          break;
        case 'inside':
          targetElement.appendChild(newElement);
          break;
      }

      // 更新内容
      updateParentContent();
      
      // 清除选择状态
      const iframe = iframeRef.current;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          clearTargetHighlights(iframeDoc);
        }
      }
      
      setTargetElement(null);
      
    } catch (error) {
      console.error('插入元素失败:', error);
      alert('插入元素失败，请重试');
    }
  };

  // 更新父组件内容
  const updateParentContent = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const html = iframeDoc.documentElement.outerHTML;
    onContentChange(html);
  };

  return (
    <>
      {/* 切换按钮 */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          variant={isVisible ? 'default' : 'outline'}
          className="shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isVisible ? '关闭插入' : '插入元素'}
        </Button>
      </div>

      {/* 元素��入面板 */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 w-80">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                插入新元素
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm">插入位置:</Label>
                <Select value={insertMode} onValueChange={(value: 'before' | 'after' | 'inside') => setInsertMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">之前</SelectItem>
                    <SelectItem value="after">之后</SelectItem>
                    <SelectItem value="inside">内部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {targetElement && (
                <Badge variant="outline" className="w-fit">
                  目标: {targetElement.tagName.toLowerCase()}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {elementTypes.map((elementType) => {
                  const Icon = elementType.icon;
                  return (
                    <Button
                      key={elementType.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => insertElement(elementType)}
                      disabled={!targetElement}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs text-center">{elementType.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {!targetElement && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    请在预览中悬停鼠标选择插入位置
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
