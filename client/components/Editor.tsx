import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Monitor, Smartphone, RefreshCw,
  Maximize, Minimize, MousePointer
} from 'lucide-react';
import ElementInserter from './ElementInserter';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  pageName: string;
  onElementSelect?: (element: HTMLElement | null) => void;
}

export default function Editor({ content, onChange, pageName, onElementSelect }: EditorProps) {
  const [previewMode, setPreviewMode] = useState('mobile');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [elementSelectMode, setElementSelectMode] = useState(true); // 默认开启��素选择
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 设备尺寸
  const deviceSizes = {
    desktop: { width: '100%', height: '100%', label: '桌面' },
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

        // 内容更新后，重新设置事件监听器
        setTimeout(() => {
          setupElementSelection();
        }, 100);
      }
    }
  }, [content]);

  // 在组件挂载时确保默认为手机模式
  useEffect(() => {
    console.log('Editor组件挂载，当前预览模式:', previewMode);
  }, []);

  // 设置元素选择功能
  const setupElementSelection = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      console.log('iframe引用不存在');
      return;
    }

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      console.log('无法访问iframe文档');
      return;
    }

    console.log('设置元素选择功能', {
      docReady: doc.readyState,
      bodyChildren: doc.body?.children.length,
      elementSelectMode
    });

    // 添加选择样式
    let existingStyle = doc.querySelector('#element-selection-styles');
    if (!existingStyle) {
      const style = doc.createElement('style');
      style.id = 'element-selection-styles';
      style.textContent = `
        .element-hover {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        .element-selected {
          outline: 3px solid #ef4444 !important;
          outline-offset: 2px !important;
          background-color: rgba(239, 68, 68, 0.1) !important;
        }
      `;
      doc.head.appendChild(style);
      console.log('已添加选择样式');
    }

    // 获取所有可选择的元素
    const elements = doc.querySelectorAll('*');
    console.log('找到可选择元素数量:', elements.length);

    // 清除之前的事件监听器
    elements.forEach(el => {
      el.removeEventListener('mouseover', handleMouseOver);
      el.removeEventListener('mouseout', handleMouseOut);
      el.removeEventListener('click', handleElementClick);
    });

    // 添加新的事件监听器
    let addedListeners = 0;
    elements.forEach(el => {
      if (el !== doc.documentElement && el !== doc.body) {
        el.addEventListener('mouseover', handleMouseOver);
        el.addEventListener('mouseout', handleMouseOut);
        el.addEventListener('click', handleElementClick);
        addedListeners++;
      }
    });

    console.log('已为', addedListeners, '个元素添加事件监听器');
  };

  // 鼠标悬停效果
  const handleMouseOver = (e: Event) => {
    if (!elementSelectMode) return;
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target && target !== document.documentElement && target !== document.body) {
      target.classList.add('element-hover');
    }
  };

  // 鼠标离开效果
  const handleMouseOut = (e: Event) => {
    if (!elementSelectMode) return;
    const target = e.target as HTMLElement;
    if (target) {
      target.classList.remove('element-hover');
    }
  };

  // 元素点击选择
  const handleElementClick = (e: Event) => {
    if (!elementSelectMode) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target && target !== document.documentElement && target !== document.body) {
      console.log('选中元素:', target.tagName, target.className, target.id);

      // 清除之前的选中状态
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const prevSelected = iframe.contentDocument.querySelectorAll('.element-selected');
        prevSelected.forEach(el => el.classList.remove('element-selected'));
      }

      // 添加选中状态
      target.classList.add('element-selected');
      setSelectedElement(target);

      // 通知父组件 - 立即调用
      console.log('通知父组件元素选择:', {
        tagName: target.tagName,
        hasCallback: !!onElementSelect,
        element: target
      });

      if (onElementSelect) {
        try {
          onElementSelect(target);
          console.log('✅ 成功调用onElementSelect回调');
        } catch (error) {
          console.error('❌ onElementSelect回调出错:', error);
        }
      } else {
        console.warn('❌ onElementSelect回调不存在');
      }
    }
  };

  // 设置iframe加载监听器
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('iframe加载完成，设置元素选择');
      setTimeout(() => {
        setupElementSelection();
      }, 200);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, []);

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
          {selectedElement && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              已选中: {selectedElement.tagName.toLowerCase()}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* 设备切换 */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {Object.entries(deviceSizes).map(([key, device]) => (
              <Button
                key={key}
                variant={previewMode === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  console.log('切换预览模式到:', key);
                  setPreviewMode(key);
                }}
                className="px-2"
              >
                {key === 'desktop' && <Monitor className="w-4 h-4" />}
                {key === 'mobile' && <Smartphone className="w-4 h-4" />}
                <span className="ml-1 hidden sm:inline">{device.label}</span>
              </Button>
            ))}
          </div>

          <Button
            variant={elementSelectMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setElementSelectMode(!elementSelectMode);
              // 立即重新设置选择功能
              setTimeout(() => {
                setupElementSelection();
              }, 100);
            }}
            className="flex items-center gap-2"
          >
            <MousePointer className="w-4 h-4" />
            {elementSelectMode ? '选择模式' : '浏览模式'}
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
          className={`h-full bg-gray-100 overflow-auto ${previewMode === 'desktop' ? '' : 'flex items-center justify-center'}`}
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <div
            className={`transition-all duration-300 ${
              previewMode === 'desktop'
                ? 'w-full h-full'
                : 'bg-white shadow-lg rounded-lg overflow-hidden'
            }`}
            style={previewMode === 'desktop' ? {} : {
              width: deviceSizes[previewMode as keyof typeof deviceSizes].width,
              height: deviceSizes[previewMode as keyof typeof deviceSizes].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-blue-400', 'border-2', 'border-dashed');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-blue-400', 'border-2', 'border-dashed');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-blue-400', 'border-2', 'border-dashed');

              try {
                const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));

                if (dragData.type === 'element') {
                  console.log('拖拽放置元素:', dragData);

                  // 创建新元素
                  const iframe = iframeRef.current;
                  if (iframe && iframe.contentDocument) {
                    const doc = iframe.contentDocument;
                    const newElement = doc.createElement(dragData.tag);

                    // 设置内容
                    if (dragData.content) {
                      if (dragData.content.includes('<')) {
                        newElement.innerHTML = dragData.content;
                      } else {
                        newElement.textContent = dragData.content;
                      }
                    }

                    // 设置属性
                    if (dragData.attributes) {
                      Object.entries(dragData.attributes).forEach(([key, value]) => {
                        newElement.setAttribute(key, value as string);
                      });
                    }

                    // 添加到页面body
                    doc.body.appendChild(newElement);

                    // 通知内容变化
                    const updatedHTML = doc.documentElement.outerHTML;
                    onChange(updatedHTML);

                    console.log('✅ 元素添加成功:', dragData.tag);
                  }
                }
              } catch (error) {
                console.error('拖拽处理失败:', error);
              }
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
        
        {/* 元素插入工具 */}
        <ElementInserter
          iframeRef={iframeRef}
          onContentChange={onChange}
        />
      </div>
    </div>
  );
}
