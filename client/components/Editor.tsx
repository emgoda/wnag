import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Monitor, Tablet, Smartphone, RefreshCw,
  Maximize, Minimize
} from 'lucide-react';
import ElementInserter from './ElementInserter';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  pageName: string;
  onElementSelect?: (element: HTMLElement | null) => void;
}

export default function Editor({ content, onChange, pageName, onElementSelect }: EditorProps) {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elementEditMode, setElementEditMode] = useState(true); // 默认开启编辑模式
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 设备尺寸
  const deviceSizes = {
    desktop: { width: '100%', height: '100%', label: '桌面' },
    tablet: { width: '768px', height: '1024px', label: '平板' },
    mobile: { width: '375px', height: '667px', label: '手机' }
  };

  // 更新预览内容
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [content]);

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

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'flex-1'}`}>
      {/* 编辑器头部 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-medium text-gray-900">{pageName}</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            页面编辑器
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 设备切换 */}
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

          <Button
            variant={elementEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setElementEditMode(!elementEditMode)}
            className="flex items-center gap-2"
          >
            <MousePointer className="w-4 h-4" />
            {elementEditMode ? '退出编辑' : '元素编辑'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPreview}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* 页面编辑主体 */}
      <div className="flex-1 relative">
        <div 
          className="h-full bg-gray-100 flex items-center justify-center overflow-auto"
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
              title={`编辑 - ${pageName}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
        
        {/* 元素编辑工具 */}
        {elementEditMode && (
          <>
            <ElementEditor
              iframeRef={iframeRef}
              onContentChange={onChange}
              onElementSelect={onElementSelect}
            />
            <ElementInserter
              iframeRef={iframeRef}
              onContentChange={onChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
