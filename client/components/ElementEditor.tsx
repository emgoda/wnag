import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings, Type, Palette, Box, Link2, Image,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, Trash2, Copy, Move
} from 'lucide-react';

interface SelectedElement {
  element: HTMLElement;
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  styles: CSSStyleDeclaration;
  attributes: { [key: string]: string };
}

interface ElementEditorProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onContentChange: (content: string) => void;
  onElementSelect?: (element: HTMLElement | null) => void;
}

export default function ElementEditor({ iframeRef, onContentChange, onElementSelect }: ElementEditorProps) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 初��化元素选择功能
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // 添加选择样式
      const style = iframeDoc.createElement('style');
      style.textContent = `
        .element-editor-highlight {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        .element-editor-selected {
          outline: 3px solid #ef4444 !important;
          outline-offset: 2px !important;
          background-color: rgba(239, 68, 68, 0.1) !important;
        }
        .element-editor-editing {
          outline: 3px solid #10b981 !important;
          outline-offset: 2px !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // 添加鼠标悬停效果
      const handleMouseOver = (e: MouseEvent) => {
        if (editMode) return;
        const target = e.target as HTMLElement;
        if (target && target !== iframeDoc.documentElement && target !== iframeDoc.body) {
          target.classList.add('element-editor-highlight');
        }
      };

      const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target) {
          target.classList.remove('element-editor-highlight');
        }
      };

      // 添加点击选择功能
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        if (target && target !== iframeDoc.documentElement && target !== iframeDoc.body) {
          selectElement(target);
        }
      };

      // 绑定事件
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
  }, [iframeRef, editMode]);

  // 选择元素
  const selectElement = (element: HTMLElement) => {
    // 清除之前的选择
    clearSelection();

    // 添加选中样式
    element.classList.add('element-editor-selected');

    const selectedData: SelectedElement = {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || '',
      className: element.className || '',
      textContent: element.textContent || '',
      styles: window.getComputedStyle(element),
      attributes: getElementAttributes(element)
    };

    setSelectedElement(selectedData);
    setIsVisible(true);

    // 通知父组件元素选择变化
    if (onElementSelect) {
      onElementSelect(element);
    }
  };

  // 清除选择
  const clearSelection = () => {
    if (!iframeRef.current) return;
    
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    const selectedElements = iframeDoc.querySelectorAll('.element-editor-selected, .element-editor-editing');
    selectedElements.forEach(el => {
      el.classList.remove('element-editor-selected', 'element-editor-editing');
    });
  };

  // 获取元素属性
  const getElementAttributes = (element: HTMLElement): { [key: string]: string } => {
    const attrs: { [key: string]: string } = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  };

  // 更新元素内容
  const updateElementContent = (content: string) => {
    if (!selectedElement) return;

    selectedElement.element.textContent = content;
    setSelectedElement(prev => prev ? { ...prev, textContent: content } : null);
    
    // 通知父组件内容已更改
    updateParentContent();
  };

  // 更新元素样式
  const updateElementStyle = (property: string, value: string) => {
    if (!selectedElement) return;

    selectedElement.element.style.setProperty(property, value);
    
    // 通知父组件内容已更改
    updateParentContent();
  };

  // 更新元素属性
  const updateElementAttribute = (attribute: string, value: string) => {
    if (!selectedElement) return;

    if (value) {
      selectedElement.element.setAttribute(attribute, value);
    } else {
      selectedElement.element.removeAttribute(attribute);
    }

    setSelectedElement(prev => prev ? {
      ...prev,
      attributes: { ...prev.attributes, [attribute]: value }
    } : null);

    updateParentContent();
  };

  // 删除元素
  const deleteElement = () => {
    if (!selectedElement) return;

    if (confirm('确定要删除这个元素吗？')) {
      selectedElement.element.remove();
      setSelectedElement(null);
      setIsVisible(false);
      updateParentContent();
    }
  };

  // 复制元素
  const duplicateElement = () => {
    if (!selectedElement) return;

    const cloned = selectedElement.element.cloneNode(true) as HTMLElement;
    selectedElement.element.parentNode?.insertBefore(cloned, selectedElement.element.nextSibling);
    updateParentContent();
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

  // 切换编辑模式
  const toggleEditMode = () => {
    if (!selectedElement) return;

    if (editMode) {
      selectedElement.element.classList.remove('element-editor-editing');
      selectedElement.element.contentEditable = 'false';
    } else {
      selectedElement.element.classList.add('element-editor-editing');
      selectedElement.element.contentEditable = 'true';
      selectedElement.element.focus();
    }
    
    setEditMode(!editMode);
  };

  if (!isVisible || !selectedElement) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className="bg-white">
          点击预览中的元素进行编辑
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              元素编辑器
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
              >
                {editMode ? '完成' : '编辑'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedElement.tagName}</Badge>
            {selectedElement.id && (
              <Badge variant="outline">#{selectedElement.id}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">内容</TabsTrigger>
              <TabsTrigger value="style">样式</TabsTrigger>
              <TabsTrigger value="attributes">属性</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-3">
              <div>
                <Label className="text-sm">文本内容</Label>
                <Textarea
                  value={selectedElement.textContent}
                  onChange={(e) => updateElementContent(e.target.value)}
                  placeholder="元素文本内容"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateElement}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteElement}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  删除
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">字体大小</Label>
                  <Input
                    placeholder="16px"
                    onChange={(e) => updateElementStyle('font-size', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">字体颜色</Label>
                  <Input
                    type="color"
                    onChange={(e) => updateElementStyle('color', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">背景颜色</Label>
                <Input
                  type="color"
                  onChange={(e) => updateElementStyle('background-color', e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">文字对齐</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateElementStyle('text-align', 'left')}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateElementStyle('text-align', 'center')}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateElementStyle('text-align', 'right')}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">内边距</Label>
                  <Input
                    placeholder="10px"
                    onChange={(e) => updateElementStyle('padding', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">外边距</Label>
                  <Input
                    placeholder="10px"
                    onChange={(e) => updateElementStyle('margin', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attributes" className="space-y-3">
              <div>
                <Label className="text-xs">ID</Label>
                <Input
                  value={selectedElement.id}
                  onChange={(e) => updateElementAttribute('id', e.target.value)}
                  placeholder="元素ID"
                />
              </div>

              <div>
                <Label className="text-xs">CSS类名</Label>
                <Input
                  value={selectedElement.className}
                  onChange={(e) => updateElementAttribute('class', e.target.value)}
                  placeholder="CSS类名"
                />
              </div>

              {selectedElement.tagName === 'a' && (
                <div>
                  <Label className="text-xs">链接地址</Label>
                  <Input
                    value={selectedElement.attributes.href || ''}
                    onChange={(e) => updateElementAttribute('href', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {selectedElement.tagName === 'img' && (
                <>
                  <div>
                    <Label className="text-xs">图片地址</Label>
                    <Input
                      value={selectedElement.attributes.src || ''}
                      onChange={(e) => updateElementAttribute('src', e.target.value)}
                      placeholder="图片URL"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">替代文本</Label>
                    <Input
                      value={selectedElement.attributes.alt || ''}
                      onChange={(e) => updateElementAttribute('alt', e.target.value)}
                      placeholder="图片描述"
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
