import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Monitor, Smartphone, RefreshCw,
  Maximize, Minimize, MousePointer, ChevronDown
} from 'lucide-react';
import ElementInserter from './ElementInserter';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  pageName: string;
  onElementSelect?: (element: HTMLElement | null) => void;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
}

const Editor = forwardRef<any, EditorProps>(({ content, onChange, pageName, onElementSelect, selectedNodeId, onNodeSelect }, ref) => {
  const [previewMode, setPreviewMode] = useState('iphone-14-pro');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [elementSelectMode, setElementSelectMode] = useState(true); // 默认开启元素选择
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 设备尺寸
  const deviceSizes = {
    desktop: { width: '100%', height: '100%', label: '桌面' },
    'iphone-14-pro': { width: '393px', height: '852px', label: 'iPhone 14 Pro' },
    'android-14': { width: '360px', height: '800px', label: 'Android 14' }
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

    console.log('已为', addedListeners, '个元��添加事件监听器');
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

  // 生成或获取元素的唯一ID
  const getElementNodeId = (element: HTMLElement): string => {
    // 如果元素已经有data-node-id，直接返回
    if (element.hasAttribute('data-node-id')) {
      return element.getAttribute('data-node-id')!;
    }

    // 生成新的唯一ID
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    element.setAttribute('data-node-id', nodeId);
    return nodeId;
  };

  // 元素点击选择
  const handleElementClick = (e: Event) => {
    if (!elementSelectMode) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target && target !== document.documentElement && target !== document.body) {
      console.log('选中元素:', target.tagName, target.className, target.id);

      // 生成或获取元素ID
      const nodeId = getElementNodeId(target);

      // 清除之前的选中状态
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const prevSelected = iframe.contentDocument.querySelectorAll('.element-selected');
        prevSelected.forEach(el => el.classList.remove('element-selected'));
      }

      // 添加选中状态
      target.classList.add('element-selected');
      setSelectedElement(target);

      // 通知父组件新的选择逻辑
      console.log('通知父组件元素选择:', {
        tagName: target.tagName,
        nodeId: nodeId,
        element: target
      });

      // 使用新的nodeId回调
      if (onNodeSelect) {
        try {
          onNodeSelect(nodeId);
          console.log('✅ 成功调用onNodeSelect回调，nodeId:', nodeId);
        } catch (error) {
          console.error('❌ onNodeSelect回调出错:', error);
        }
      }

      // 保持对旧回调的兼容
      if (onElementSelect) {
        try {
          onElementSelect(target);
          console.log('✅ 成功调用onElementSelect回调（兼容）');
        } catch (error) {
          console.error('❌ onElementSelect回调出错:', error);
        }
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

  // 添加元素到页面
  const addElementToPage = (elementData: any, action: 'insert' | 'replace' | 'append') => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;

    if (!doc || !doc.body) {
      alert('无法访问页面文档，请刷新后重试');
      return;
    }

    // 创建新元素
    const newElement = doc.createElement(elementData.tag);

    // 设置内容
    if (elementData.content) {
      if (elementData.content.includes('<')) {
        newElement.innerHTML = elementData.content;
      } else {
        newElement.textContent = elementData.content;
      }
    }

    // 设置属性
    if (elementData.attributes) {
      Object.entries(elementData.attributes).forEach(([key, value]) => {
        newElement.setAttribute(key, value as string);
      });
    }

    // 添加基本样式
    newElement.style.margin = '10px';

    // 根据操作类型添加元素
    switch (action) {
      case 'insert':
        if (selectedElement && selectedElement.parentNode) {
          selectedElement.parentNode.insertBefore(newElement, selectedElement);
        } else {
          doc.body.appendChild(newElement);
        }
        break;
      case 'replace':
        if (selectedElement && selectedElement.parentNode) {
          selectedElement.parentNode.replaceChild(newElement, selectedElement);
          setSelectedElement(newElement);
        } else {
          doc.body.appendChild(newElement);
        }
        break;
      case 'append':
        if (selectedElement && selectedElement.tagName !== 'IMG' && selectedElement.tagName !== 'INPUT') {
          selectedElement.appendChild(newElement);
        } else {
          doc.body.appendChild(newElement);
        }
        break;
    }

    // 通知内容更新
    const updatedHTML = doc.documentElement.outerHTML;
    onChange(updatedHTML);

    // 重新设置选择功能
    setTimeout(() => {
      setupElementSelection();
    }, 200);

    console.log('✅ 元素添加成功:', elementData.tag, action);
  };

  // 暴露函数给父组件
  useImperativeHandle(ref, () => ({
    addElementToPage
  }));

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'flex-1'}`}>
      {/* 编辑器头部 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-medium text-gray-900">{pageName}</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {deviceSizes[previewMode as keyof typeof deviceSizes]?.label || '页面编辑器'}
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
            {/* 桌面按钮 */}
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                console.log('切换预览模式到: desktop');
                setPreviewMode('desktop');
              }}
              className="px-2"
            >
              <Monitor className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">桌面</span>
            </Button>

            {/* 手机设备下拉菜�� */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={previewMode !== 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  className="px-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">手机</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    console.log('切换预览模式到: iphone-14-pro');
                    setPreviewMode('iphone-14-pro');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>iPhone 14 Pro</span>
                    <span className="text-xs text-gray-500">(393×852)</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log('切换预览模式到: android-14');
                    setPreviewMode('android-14');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>🤖</span>
                    <span>Android 14</span>
                    <span className="text-xs text-gray-500">(360×800)</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
});

export default Editor;
