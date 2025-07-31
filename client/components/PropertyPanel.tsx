import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings, Type, Palette, Box, Image, Link2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Eye, EyeOff, ChevronRight, ChevronDown,
  Code, FileText
} from 'lucide-react';

interface PropertyPanelProps {
  selectedElement?: HTMLElement | null;
  onElementUpdate?: (element: HTMLElement, property: string, value: string) => void;
}

interface DOMNode {
  element: HTMLElement;
  tagName: string;
  id?: string;
  className?: string;
  children: DOMNode[];
  isExpanded: boolean;
}

export default function PropertyPanel({ selectedElement, onElementUpdate }: PropertyPanelProps) {
  const [elementData, setElementData] = useState<{
    tagName: string;
    id: string;
    className: string;
    textContent: string;
    attributes: { [key: string]: string };
    styles: { [key: string]: string };
  } | null>(null);

  const [domTree, setDomTree] = useState<DOMNode[]>([]);
  const [selectedNodeElement, setSelectedNodeElement] = useState<HTMLElement | null>(null);

  // 构建DOM树
  const buildDOMTree = (element: HTMLElement, depth = 0): DOMNode => {
    const children: DOMNode[] = [];
    
    // 只处理Element节点，跳过文本节点和注释节点
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        children.push(buildDOMTree(child, depth + 1));
      }
    });

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      children,
      isExpanded: depth < 2 // 默认展开前两层
    };
  };

  // 获取iframe中的DOM树
  const getDOMTreeFromIframe = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
      const body = iframe.contentDocument.body;
      if (body) {
        const tree = buildDOMTree(body);
        setDomTree([tree]);
      }
    }
  };

  // 页面加载时和选中元素变化时更新DOM树
  useEffect(() => {
    getDOMTreeFromIframe();
    
    // 监听iframe加载完成
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('load', getDOMTreeFromIframe);
      return () => iframe.removeEventListener('load', getDOMTreeFromIframe);
    }
  }, [selectedElement]);

  // 更新元素数据
  useEffect(() => {
    if (selectedElement) {
      const computedStyles = window.getComputedStyle(selectedElement);
      const styles: { [key: string]: string } = {};
      
      // 获取常用样式属性
      const styleProperties = [
        'color', 'background-color', 'font-size', 'font-weight', 'font-family',
        'text-align', 'padding', 'margin', 'width', 'height', 'border',
        'border-radius', 'display', 'position', 'top', 'left', 'right', 'bottom',
        'z-index', 'opacity', 'transform'
      ];
      
      styleProperties.forEach(prop => {
        const value = selectedElement.style.getPropertyValue(prop) || computedStyles.getPropertyValue(prop);
        if (value && value !== 'initial' && value !== 'normal') {
          styles[prop] = value;
        }
      });

      const attributes: { [key: string]: string } = {};
      for (let i = 0; i < selectedElement.attributes.length; i++) {
        const attr = selectedElement.attributes[i];
        if (attr.name !== 'style') {
          attributes[attr.name] = attr.value;
        }
      }

      setElementData({
        tagName: selectedElement.tagName.toLowerCase(),
        id: selectedElement.id || '',
        className: selectedElement.className || '',
        textContent: selectedElement.textContent || '',
        attributes,
        styles
      });
    } else {
      setElementData(null);
    }
  }, [selectedElement]);

  // 更新元素属性
  const handleAttributeChange = (attribute: string, value: string) => {
    if (!selectedElement || !onElementUpdate) return;
    
    if (value) {
      selectedElement.setAttribute(attribute, value);
    } else {
      selectedElement.removeAttribute(attribute);
    }
    
    onElementUpdate(selectedElement, attribute, value);
    
    // 更新本地状态
    setElementData(prev => prev ? {
      ...prev,
      attributes: { ...prev.attributes, [attribute]: value }
    } : null);
  };

  // 更新元素样式
  const handleStyleChange = (property: string, value: string) => {
    if (!selectedElement || !onElementUpdate) return;
    
    selectedElement.style.setProperty(property, value);
    onElementUpdate(selectedElement, property, value);
    
    // 更新本地状态
    setElementData(prev => prev ? {
      ...prev,
      styles: { ...prev.styles, [property]: value }
    } : null);
  };

  // 更新文本内容
  const handleTextContentChange = (value: string) => {
    if (!selectedElement || !onElementUpdate) return;
    
    selectedElement.textContent = value;
    onElementUpdate(selectedElement, 'textContent', value);
    
    setElementData(prev => prev ? { ...prev, textContent: value } : null);
  };

  // 切换DOM节点展开状态
  const toggleNodeExpansion = (node: DOMNode) => {
    const updateNode = (nodes: DOMNode[]): DOMNode[] => {
      return nodes.map(n => {
        if (n.element === node.element) {
          return { ...n, isExpanded: !n.isExpanded };
        }
        return { ...n, children: updateNode(n.children) };
      });
    };
    setDomTree(updateNode(domTree));
  };

  // 选择DOM节点
  const handleNodeSelect = (element: HTMLElement) => {
    setSelectedNodeElement(element);
    // 触发父组件的元素选择回调
    if (onElementUpdate) {
      // 这里我们需要模拟一个元素选择事件
      // 由于我们无法直接调用父组件的选择函数，我们设置一个标识
      element.click();
    }
  };

  // 渲染DOM树节点
  const renderDOMNode = (node: DOMNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedElement === node.element;
    const paddingLeft = depth * 16;

    return (
      <div key={`${node.tagName}-${node.id || node.className || Math.random()}`} className="text-sm">
        <div 
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded ${
            isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => handleNodeSelect(node.element)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node);
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded"
            >
              {node.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <span className="text-blue-600 font-mono">&lt;{node.tagName}&gt;</span>
          
          {node.id && (
            <span className="text-green-600 text-xs">#{node.id}</span>
          )}
          
          {node.className && (
            <span className="text-purple-600 text-xs">.{node.className.split(' ')[0]}</span>
          )}
        </div>
        
        {hasChildren && node.isExpanded && (
          <div>
            {node.children.map(child => renderDOMNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!elementData) {
    return (
      <div className="w-80 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="w-5 h-5" />
            元素编辑器
          </h3>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">在预览中选择一个元素</p>
              <p className="text-xs text-gray-400 mt-2">
                点击预览中的元素进行编辑
              </p>
            </div>
          </div>
          
          {/* DOM树区域 */}
          <div className="border-t bg-gray-50">
            <div className="p-3 border-b bg-white">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                DOM 树
              </h4>
            </div>
            <ScrollArea className="h-64">
              <div className="p-2">
                {domTree.map(node => renderDOMNode(node))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="w-5 h-5" />
            元素编辑器
          </h3>
          <Badge variant="secondary">{elementData.tagName}</Badge>
        </div>
        {elementData.id && (
          <Badge variant="outline" className="text-xs">
            #{elementData.id}
          </Badge>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="content">内容</TabsTrigger>
              <TabsTrigger value="style">样式</TabsTrigger>
              <TabsTrigger value="attributes">属性</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="px-4 pb-4 space-y-4">
              {/* 文本内容 */}
              <div>
                <Label className="text-sm font-medium">文本内容</Label>
                <Textarea
                  value={elementData.textContent}
                  onChange={(e) => handleTextContentChange(e.target.value)}
                  placeholder="元素文本内容"
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* 特定元素的内容属性 */}
              {elementData.tagName === 'img' && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">图片源</Label>
                    <Input
                      value={elementData.attributes.src || ''}
                      onChange={(e) => handleAttributeChange('src', e.target.value)}
                      placeholder="图片URL"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">替代文本</Label>
                    <Input
                      value={elementData.attributes.alt || ''}
                      onChange={(e) => handleAttributeChange('alt', e.target.value)}
                      placeholder="图片描述"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {elementData.tagName === 'a' && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">链接地址</Label>
                    <Input
                      value={elementData.attributes.href || ''}
                      onChange={(e) => handleAttributeChange('href', e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">打开方式</Label>
                    <Select
                      value={elementData.attributes.target || ''}
                      onValueChange={(value) => handleAttributeChange('target', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择打开方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">当前窗口</SelectItem>
                        <SelectItem value="_blank">新窗口</SelectItem>
                        <SelectItem value="_parent">父窗口</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="style" className="px-4 pb-4 space-y-4">
              {/* 文字样式 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    文字样式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">字体大小</Label>
                      <Input
                        value={elementData.styles['font-size'] || ''}
                        onChange={(e) => handleStyleChange('font-size', e.target.value)}
                        placeholder="16px"
                        className="mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">字体粗细</Label>
                      <Select
                        value={elementData.styles['font-weight'] || ''}
                        onValueChange={(value) => handleStyleChange('font-weight', value)}
                      >
                        <SelectTrigger className="mt-1 h-8">
                          <SelectValue placeholder="选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">正常</SelectItem>
                          <SelectItem value="bold">粗体</SelectItem>
                          <SelectItem value="lighter">细体</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">文字颜色</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={elementData.styles.color || '#000000'}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={elementData.styles.color || ''}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">文字对齐</Label>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={elementData.styles['text-align'] === 'left' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStyleChange('text-align', 'left')}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={elementData.styles['text-align'] === 'center' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStyleChange('text-align', 'center')}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={elementData.styles['text-align'] === 'right' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStyleChange('text-align', 'right')}
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={elementData.styles['text-align'] === 'justify' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStyleChange('text-align', 'justify')}
                      >
                        <AlignJustify className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 布局样式 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    布局样式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">背景颜色</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={elementData.styles['background-color'] || '#ffffff'}
                        onChange={(e) => handleStyleChange('background-color', e.target.value)}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={elementData.styles['background-color'] || ''}
                        onChange={(e) => handleStyleChange('background-color', e.target.value)}
                        placeholder="transparent"
                        className="flex-1 h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">宽度</Label>
                      <Input
                        value={elementData.styles.width || ''}
                        onChange={(e) => handleStyleChange('width', e.target.value)}
                        placeholder="auto"
                        className="mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">高度</Label>
                      <Input
                        value={elementData.styles.height || ''}
                        onChange={(e) => handleStyleChange('height', e.target.value)}
                        placeholder="auto"
                        className="mt-1 h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">内边距</Label>
                      <Input
                        value={elementData.styles.padding || ''}
                        onChange={(e) => handleStyleChange('padding', e.target.value)}
                        placeholder="0"
                        className="mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">外边距</Label>
                      <Input
                        value={elementData.styles.margin || ''}
                        onChange={(e) => handleStyleChange('margin', e.target.value)}
                        placeholder="0"
                        className="mt-1 h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">圆角</Label>
                    <Input
                      value={elementData.styles['border-radius'] || ''}
                      onChange={(e) => handleStyleChange('border-radius', e.target.value)}
                      placeholder="0"
                      className="mt-1 h-8"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attributes" className="px-4 pb-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">元素ID</Label>
                <Input
                  value={elementData.id}
                  onChange={(e) => handleAttributeChange('id', e.target.value)}
                  placeholder="元素唯一标识"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">CSS类名</Label>
                <Input
                  value={elementData.className}
                  onChange={(e) => handleAttributeChange('class', e.target.value)}
                  placeholder="class1 class2"
                  className="mt-1"
                />
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">自定义属性</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(elementData.attributes)
                    .filter(([key]) => !['id', 'class', 'src', 'alt', 'href', 'target'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input
                          value={key}
                          className="h-8 text-xs"
                          disabled
                        />
                        <Input
                          value={value}
                          onChange={(e) => handleAttributeChange(key, e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* DOM树区域 */}
        <div className="border-t bg-gray-50">
          <div className="p-3 border-b bg-white">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Code className="w-4 h-4" />
              DOM 树
            </h4>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2">
              {domTree.map(node => renderDOMNode(node))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
