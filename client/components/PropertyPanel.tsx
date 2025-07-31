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
import {
  Settings, Type, Palette, Box, Image, Link2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Eye, EyeOff
} from 'lucide-react';

interface PropertyPanelProps {
  selectedElement?: HTMLElement | null;
  onElementUpdate?: (element: HTMLElement, property: string, value: string) => void;
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

  if (!elementData) {
    return (
      <div className="w-80 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="w-5 h-5" />
            属性编辑器
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">在预览中选择一个元素</p>
            <p className="text-xs text-gray-400 mt-2">
              开启元素编辑模式并点击元素
            </p>
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
            属性编辑器
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
    </div>
  );
}
