import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Code, Eye, Monitor, Tablet, Smartphone, RefreshCw,
  Maximize, Minimize, Copy, CheckCircle, MousePointer
} from 'lucide-react';
import ElementEditor from './ElementEditor';
import ElementInserter from './ElementInserter';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  pageName: string;
  onElementSelect?: (element: HTMLElement | null) => void;
}

export default function Editor({ content, onChange, pageName }: EditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elementEditMode, setElementEditMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 设备尺寸
  const deviceSizes = {
    desktop: { width: '100%', height: '100%', label: '桌面' },
    tablet: { width: '768px', height: '1024px', label: '平板' },
    mobile: { width: '375px', height: '667px', label: '手机' }
  };

  // 更新预览内容
  useEffect(() => {
    if (iframeRef.current && activeTab === 'preview') {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [content, activeTab]);

  // 处理内容变化
  const handleContentChange = (value: string) => {
    onChange(value);
  };

  // 刷新预览
  const handleRefreshPreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  };

  // 复制代码
  const handleCopyCode = async () => {
    try {
      // 首先尝试使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // 回退到传统的复制方法
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error('复制命令执行失败');
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('复制失败:', error);
      // 显示用户友好的错误提示
      alert('复制失败���请手动选择文本复制');
    }
  };

  // 格式化HTML代码
  const formatHTML = (html: string) => {
    // 简单的HTML格式化
    return html
      .replace(/></g, '>\n<')
      .replace(/\n\s*\n/g, '\n')
      .split('\n')
      .map((line, index) => {
        const indent = '  '.repeat(Math.max(0, (line.match(/</g) || []).length - (line.match(/\//g) || []).length));
        return indent + line.trim();
      })
      .join('\n');
  };

  const handleFormatCode = () => {
    const formatted = formatHTML(content);
    onChange(formatted);
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'flex-1'}`}>
      {/* 编辑器头部 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-medium text-gray-900">{pageName}</h2>
          <Badge variant="outline">HTML</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 设备切换（预览模式） */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 border rounded-lg p-1">
              {Object.entries(deviceSizes).map(([key, device]) => (
                <Button
                  key={key}
                  variant={previewMode === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode(key)}
                  className="px-2"
                >
                  {key === 'desktop' && <Monitor className="w-4 h-4" />}
                  {key === 'tablet' && <Tablet className="w-4 h-4" />}
                  {key === 'mobile' && <Smartphone className="w-4 h-4" />}
                  <span className="ml-1 hidden sm:inline">{device.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* 工具按钮 */}
          {activeTab === 'preview' && (
            <Button
              variant={elementEditMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setElementEditMode(!elementEditMode)}
              className="flex items-center gap-2"
            >
              <MousePointer className="w-4 h-4" />
              {elementEditMode ? '退出编辑' : '元素编辑'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="flex items-center gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </Button>

          {activeTab === 'preview' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPreview}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* 编辑器主体 */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              源码编辑
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              实时预览
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 mx-4 mb-4">
            <div className="h-full border rounded-lg">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
                <span className="text-sm text-gray-600">HTML源码</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFormatCode}
                  className="text-xs"
                >
                  格式化代码
                </Button>
              </div>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="h-full resize-none border-none rounded-none font-mono text-sm"
                placeholder="在此编辑HTML源码..."
                style={{ minHeight: 'calc(100vh - 200px)' }}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 mx-4 mb-4 relative">
            <div
              className="h-full border rounded-lg bg-gray-100 flex items-center justify-center overflow-auto"
              style={{ minHeight: 'calc(100vh - 200px)' }}
            >
              <div
                className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
                style={{
                  width: deviceSizes[previewMode as keyof typeof deviceSizes].width,
                  height: deviceSizes[previewMode as keyof typeof deviceSizes].height,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-none"
                  title={`预览 - ${pageName}`}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>

            {/* 元素编辑器 - 只在预览模式且开启元素编辑时显示 */}
            {elementEditMode && (
              <>
                <ElementEditor
                  iframeRef={iframeRef}
                  onContentChange={onChange}
                />
                <ElementInserter
                  iframeRef={iframeRef}
                  onContentChange={onChange}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
