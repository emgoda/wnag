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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Settings, Type, Palette, Box, Image, Link2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Eye, EyeOff, ChevronRight, ChevronDown,
  Code, FileText, MoreVertical, Copy, Trash2, Move, Edit3,
  ArrowUp, ArrowDown
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

  const [forceUpdate, setForceUpdate] = useState(0);

  const [domTree, setDomTree] = useState<DOMNode[]>([]);
  const [selectedNodeElement, setSelectedNodeElement] = useState<HTMLElement | null>(null);

  // 构建DOM树
  const buildDOMTree = (element: HTMLElement, depth = 0): DOMNode => {
    const children: DOMNode[] = [];

    // 只处理Element节点，跳过文本节点和注释节点
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        // 跳过script和style标签，但保留其他所有元素
        if (child.tagName.toLowerCase() !== 'script' && child.tagName.toLowerCase() !== 'style') {
          children.push(buildDOMTree(child, depth + 1));
        }
      }
    });

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      children,
      isExpanded: depth < 3 // 默认展开前三层，以便看到更多内容
    };
  };

  // 获取iframe中的DOM树
  const getDOMTreeFromIframe = () => {
    console.log('开始查找iframe...');

    // 列出所有可能的iframe
    const allIframes = document.querySelectorAll('iframe');
    console.log('页面中所有iframe:', allIframes.length, allIframes);

    // 查找编辑器中的iframe，尝试多种选择器
    let editorIframe = document.querySelector('[data-loc*="Editor.tsx"] iframe') as HTMLIFrameElement;

    if (!editorIframe) {
      // 如果特定选择器没找到，尝试通用选择器
      editorIframe = document.querySelector('iframe[title*="编辑"]') as HTMLIFrameElement;
      console.log('使用title选择器找到iframe:', !!editorIframe);
    }

    if (!editorIframe) {
      // 最后尝试找任何iframe
      editorIframe = document.querySelector('iframe') as HTMLIFrameElement;
      console.log('使用通用选择器找到iframe:', !!editorIframe);
    }

    if (!editorIframe) {
      console.log('未找到iframe元素');
      console.log('当前页面所有iframe的title属性:',
        Array.from(allIframes).map(iframe => iframe.title));
      return;
    }

    console.log('找到iframe:', editorIframe, '标题:', editorIframe.title);

    try {
      const doc = editorIframe.contentDocument || editorIframe.contentWindow?.document;

      if (!doc) {
        console.log('无法访问iframe文档');
        return;
      }

      const body = doc.body;
      const html = doc.documentElement;

      console.log('iframe状态:', {
        readyState: doc.readyState,
        bodyChildren: body?.children.length || 0,
        htmlChildren: html?.children.length || 0,
        bodyHTML: body?.innerHTML?.substring(0, 100) || 'empty'
      });

      if (body && body.children.length > 0) {
        // 如果body有子元素，构建完整的DOM树
        const tree = buildDOMTree(body);
        setDomTree([tree]);
        console.log('DOM树构建成功，节点数:', tree.children.length);
      } else if (html && html.children.length > 0) {
        // 尝试从html根元素开始构建
        const tree = buildDOMTree(html);
        setDomTree([tree]);
        console.log('从HTML根元素构建DOM树');
      } else {
        console.log('iframe内容为空，等待加载...');
        // 如果body为空，等待内容加载
        setTimeout(() => {
          getDOMTreeFromIframe();
        }, 1000);
      }
    } catch (error) {
      console.error('读取iframe内容时出错:', error);
    }
  };

  // 页面加载时和选中元素变化时更新DOM树
  useEffect(() => {
    console.log('PropertyPanel useEffect 触发');

    // 立即尝试获取DOM树
    getDOMTreeFromIframe();

    // 延迟再次获取DOM树，确保内容已加载
    const timer = setTimeout(() => {
      console.log('延迟获取DOM树...');
      getDOMTreeFromIframe();
    }, 500);

    // 查找iframe并监听
    const findAndListenToIframe = () => {
      let iframe = document.querySelector('[data-loc*="Editor.tsx"] iframe') as HTMLIFrameElement;

      if (!iframe) {
        iframe = document.querySelector('iframe[title*="编辑"]') as HTMLIFrameElement;
      }

      if (!iframe) {
        iframe = document.querySelector('iframe') as HTMLIFrameElement;
      }

      if (iframe) {
        console.log('找到iframe，设置监听器');

        const handleLoad = () => {
          console.log('iframe加载���成事件触发');
          setTimeout(() => {
            getDOMTreeFromIframe();
          }, 300);
        };

        const handleContentChange = () => {
          console.log('iframe内容变化');
          getDOMTreeFromIframe();
        };

        iframe.addEventListener('load', handleLoad);

        // 监听iframe内容文档的变化
        try {
          if (iframe.contentDocument) {
            iframe.contentDocument.addEventListener('DOMContentLoaded', handleContentChange);
          }
        } catch (e) {
          console.log('无法监听iframe内容文档:', e);
        }

        // 如果iframe已经加载完成，立即获取DOM树
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          console.log('iframe已完成加载，立即获取DOM树');
          handleLoad();
        }

        return () => {
          iframe.removeEventListener('load', handleLoad);
          try {
            if (iframe.contentDocument) {
              iframe.contentDocument.removeEventListener('DOMContentLoaded', handleContentChange);
            }
          } catch (e) {
            // 忽略清��错误
          }
        };
      } else {
        console.log('未找到iframe，1秒后重试...');
        setTimeout(findAndListenToIframe, 1000);
      }
    };

    const cleanup = findAndListenToIframe();

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, []);

  // 监听页面内容变化，实时更新DOM树
  useEffect(() => {
    const updateDOMTree = () => {
      console.log('定期更新DOM树');
      getDOMTreeFromIframe();
    };

    // 更频繁地检查DOM树变化
    const interval = setInterval(updateDOMTree, 2000);

    return () => clearInterval(interval);
  }, []);

  // 组件挂载时立即尝试加载DOM树
  useEffect(() => {
    console.log('PropertyPanel组件挂载，立即获取DOM树');
    // 多次尝试，确保能够获取到
    const attempts = [100, 500, 1000, 2000];
    attempts.forEach(delay => {
      setTimeout(() => {
        console.log(`尝试获取DOM树 (延迟${delay}ms)`);
        getDOMTreeFromIframe();
      }, delay);
    });
  }, []);

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

      // 获取文本内容，��先使用textContent，如果为空则尝试innerText
      const textContent = selectedElement.textContent?.trim() ||
                         selectedElement.innerText?.trim() ||
                         '';

      console.log('元素文本内容:', {
        textContent: selectedElement.textContent,
        innerText: selectedElement.innerText,
        innerHTML: selectedElement.innerHTML,
        final: textContent
      });

      setElementData({
        tagName: selectedElement.tagName.toLowerCase(),
        id: selectedElement.id || '',
        className: selectedElement.className || '',
        textContent: textContent,
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
    console.log('更新文本内容:', value);

    // 立即更新UI状态，确保用户能看到输入的文本
    setElementData(prev => {
      if (prev) {
        return { ...prev, textContent: value };
      }
      return prev;
    });

    // 触发强制重新渲染
    setForceUpdate(prev => prev + 1);

    if (!selectedElement) {
      console.log('没有选中的元素');
      return;
    }

    try {
      // 直接设置textContent，这是最可靠的方法
      selectedElement.textContent = value;

      console.log('已更新元素文本:', {
        element: selectedElement,
        newTextContent: selectedElement.textContent,
        inputValue: value
      });

      // 通知父组件内容已更改
      if (onElementUpdate) {
        onElementUpdate(selectedElement, 'textContent', value);
      }

      // 延迟更新页面内容，避免冲突
      setTimeout(() => {
        updateParentContent();
      }, 100);

    } catch (error) {
      console.error('更新文本内容时出错:', error);
    }
  };

  // 复制元素
  const handleDuplicateElement = () => {
    if (!selectedElement) return;

    try {
      const cloned = selectedElement.cloneNode(true) as HTMLElement;
      // 如果复制的元素有ID，需要移除或修改ID以避免重复
      if (cloned.id) {
        cloned.id = cloned.id + '_copy';
      }
      selectedElement.parentNode?.insertBefore(cloned, selectedElement.nextSibling);

      // 更新页面内容
      updateParentContent();

      // 重新获取DOM树
      setTimeout(() => {
        getDOMTreeFromIframe();
      }, 100);

      console.log('元素复制成功');
    } catch (error) {
      console.error('复制元素失败:', error);
    }
  };

  // 向上移动元素
  const handleMoveElementUp = () => {
    if (!selectedElement) return;

    const previousSibling = selectedElement.previousElementSibling;
    if (previousSibling) {
      selectedElement.parentNode?.insertBefore(selectedElement, previousSibling);
      updateParentContent();
      setTimeout(() => getDOMTreeFromIframe(), 100);
    }
  };

  // 向下移动元素
  const handleMoveElementDown = () => {
    if (!selectedElement) return;

    const nextSibling = selectedElement.nextElementSibling;
    if (nextSibling) {
      selectedElement.parentNode?.insertBefore(nextSibling, selectedElement);
      updateParentContent();
      setTimeout(() => getDOMTreeFromIframe(), 100);
    }
  };

  // 编辑元素HTML
  const handleEditElementHTML = () => {
    if (!selectedElement) return;

    const html = selectedElement.outerHTML;
    const newHTML = prompt('编辑元素HTML:\n\n注意：请确保HTML格式正确', html);

    if (newHTML && newHTML !== html) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHTML.trim();
        const newElement = tempDiv.firstElementChild;

        if (newElement) {
          selectedElement.parentNode?.replaceChild(newElement, selectedElement);
          updateParentContent();
          setTimeout(() => getDOMTreeFromIframe(), 100);
          console.log('HTML编辑成功');
        } else {
          alert('无效的HTML格式，请检查后重试');
        }
      } catch (error) {
        console.error('HTML编辑失败:', error);
        alert('HTML编辑失败，请检查格式是否正确');
      }
    }
  };

  // 选择父元素
  const handleSelectParent = () => {
    if (!selectedElement) return;

    const parent = selectedElement.parentElement;
    if (parent && parent !== document.body && parent !== document.documentElement) {
      // 清除当前选中状态
      selectedElement.classList.remove('element-selected');

      // ��择父元素
      parent.classList.add('element-selected');

      // 通知父组件
      if (onElementUpdate) {
        // 这里我们通过触发一个特殊的更新来选择父元素
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        parent.dispatchEvent(clickEvent);
      }
    }
  };

  // 删除元素
  const handleDeleteElement = () => {
    if (!selectedElement) return;

    if (confirm('确定要删除这个元素吗？此操作无法撤销。')) {
      selectedElement.remove();
      setElementData(null);
      updateParentContent();
      setTimeout(() => getDOMTreeFromIframe(), 100);
    }
  };

  // 更新父组件内容
  const updateParentContent = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe || !onElementUpdate || !selectedElement) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // 触发父组件的内容更新
    onElementUpdate(selectedElement, 'dom-update', doc.documentElement.outerHTML);
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

    // 清除之前的高亮
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;
      // 移除之前的高亮样式
      const previousHighlighted = doc.querySelectorAll('.dom-tree-selected');
      previousHighlighted.forEach(el => {
        el.classList.remove('dom-tree-selected');
      });

      // 添加高亮样式到当前选中的元素
      element.classList.add('dom-tree-selected');

      // 添加高亮样式（如果还没有的话）
      if (!doc.querySelector('#dom-tree-styles')) {
        const style = doc.createElement('style');
        style.id = 'dom-tree-styles';
        style.textContent = `
          .dom-tree-selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
          }
          .dom-tree-hover {
            outline: 1px dashed #94a3b8 !important;
            outline-offset: 1px !important;
          }
        `;
        doc.head.appendChild(style);
      }
    }

    // 模拟��击事件来触发父组件的选择
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(clickEvent);
  };

  // 添加悬停效果
  const handleNodeHover = (element: HTMLElement, isEnter: boolean) => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      if (isEnter) {
        element.classList.add('dom-tree-hover');
      } else {
        element.classList.remove('dom-tree-hover');
      }
    }
  };

  // 渲染DOM树节点
  const renderDOMNode = (node: DOMNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedElement === node.element;
    const paddingLeft = depth * 16;

    // 获取元素的文本内容预览（前20个字符）
    const textPreview = node.element.textContent?.trim().slice(0, 20);
    const hasText = textPreview && textPreview.length > 0;

    return (
      <div key={`${node.tagName}-${node.id || node.className || Math.random()}`} className="text-sm">
        <div
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded transition-colors ${
            isSelected ? 'bg-blue-100 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => handleNodeSelect(node.element)}
          onMouseEnter={() => handleNodeHover(node.element, true)}
          onMouseLeave={() => handleNodeHover(node.element, false)}
          title={`${node.tagName}${node.id ? `#${node.id}` : ''}${node.className ? `.${node.className}` : ''}`}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node);
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
            >
              {node.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          <span className="text-blue-600 font-mono text-xs">&lt;{node.tagName}&gt;</span>

          {node.id && (
            <span className="text-green-600 text-xs font-medium">#{node.id}</span>
          )}

          {node.className && (
            <span className="text-purple-600 text-xs">.{node.className.split(' ')[0]}</span>
          )}

          {hasText && (
            <span className="text-gray-500 text-xs italic ml-1 truncate max-w-20">
              "{textPreview}..."
            </span>
          )}

          {hasChildren && (
            <span className="text-gray-400 text-xs ml-auto">
              {node.children.length}
            </span>
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
                点击预览中的元素或下方DOM树进行编辑
              </p>
            </div>
          </div>

          {/* DOM树区域 */}
          <div className="border-t bg-gray-50">
            <div className="p-3 border-b bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  DOM 树
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('手动刷新DOM树（无选中状态）');
                    getDOMTreeFromIframe();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  刷新
                </Button>
              </div>
              {domTree.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  正���加���DOM结构... 点击"刷新"重试
                </p>
              )}
            </div>
            <ScrollArea className="h-64">
              <div className="p-2">
                {domTree.length > 0 ? (
                  domTree.map(node => renderDOMNode(node))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">DOM树为空</p>
                    <p className="text-xs text-gray-400">
                      请导入页面或点击"刷新"
                    </p>
                  </div>
                )}
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{elementData.tagName}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleDuplicateElement()}>
                  <Copy className="w-4 h-4 mr-2" />
                  复制元素
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMoveElementUp()}
                  disabled={!selectedElement?.previousElementSibling}
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  向上移动
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMoveElementDown()}
                  disabled={!selectedElement?.nextElementSibling}
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  向下移动
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEditElementHTML()}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑HTML
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSelectParent()}
                  disabled={(() => {
                    if (!selectedElement?.parentElement) return true;
                    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                    if (!iframe?.contentDocument) return true;
                    const doc = iframe.contentDocument;
                    return selectedElement.parentElement === doc.body ||
                           selectedElement.parentElement === doc.documentElement;
                  })()}
                >
                  <Move className="w-4 h-4 mr-2" />
                  选择父元素
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteElement()}
                  className="text-red-600 focus:text-red-600 data-[disabled]:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除元素
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                <div className="text-xs text-gray-500 mb-1">
                  当前值: "{elementData.textContent}" (长度: {elementData.textContent.length})
                </div>
                <Textarea
                  key={`textarea-${forceUpdate}`}
                  value={elementData.textContent || ''}
                  onChange={(e) => {
                    console.log('Textarea onChange:', e.target.value);
                    handleTextContentChange(e.target.value);
                  }}
                  placeholder="输入元素的文本内容..."
                  className="mt-1 min-h-[80px]"
                />
                {elementData.textContent && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">预览:</span>
                    <div className="mt-1 text-gray-800">{elementData.textContent}</div>
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('文本调试信息:', {
                        selectedElement,
                        textContent: selectedElement?.textContent,
                        innerText: selectedElement?.innerText,
                        innerHTML: selectedElement?.innerHTML,
                        elementData: elementData?.textContent
                      });
                    }}
                    className="text-xs h-7"
                  >
                    🔍 调试文本
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedElement) {
                        // 强制刷新元素数据
                        const textContent = selectedElement.textContent?.trim() ||
                                           selectedElement.innerText?.trim() || '';
                        setElementData(prev => prev ? { ...prev, textContent } : null);
                      }
                    }}
                    className="text-xs h-7"
                  >
                    🔄 刷新
                  </Button>
                </div>
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
                      placeholder="��片描述"
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
                      value={elementData.attributes.target || '_self'}
                      onValueChange={(value) => handleAttributeChange('target', value === '_self' ? '' : value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择打开方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_self">当前窗口</SelectItem>
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
                        value={elementData.styles['font-weight'] || 'normal'}
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
                    ���局样式
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
                    <Label className="text-xs">圆��</Label>
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
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                DOM 树
              </h4>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('调试信息:');
                    console.log('domTree.length:', domTree.length);
                    console.log('domTree:', domTree);
                    const allIframes = document.querySelectorAll('iframe');
                    console.log('所有iframe:', allIframes);
                    allIframes.forEach((iframe, index) => {
                      console.log(`iframe ${index}:`, {
                        title: iframe.title,
                        src: iframe.src,
                        contentDocument: iframe.contentDocument,
                        ready: iframe.contentDocument?.readyState
                      });
                    });
                  }}
                  className="h-6 px-2 text-xs"
                  title="查看调试信息"
                >
                  🔍
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('手动刷新DOM树');
                    getDOMTreeFromIframe();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  刷新
                </Button>
              </div>
            </div>
            {domTree.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                正在加载DOM结构... 点击"刷新"重试
              </p>
            )}
            {domTree.length > 0 && (
              <p className="text-xs text-green-600 mt-2">
                已加载 {domTree.length} 个根节点
              </p>
            )}
          </div>
          <ScrollArea className="h-64">
            <div className="p-2">
              {domTree.length > 0 ? (
                domTree.map(node => renderDOMNode(node))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs mb-2">DOM树为空</p>
                  <p className="text-xs text-gray-400 mb-3">
                    请确保已导入页面，然后点击"刷新"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('强制刷新DOM树');
                      // 立即尝试多次
                      for (let i = 0; i < 3; i++) {
                        setTimeout(() => getDOMTreeFromIframe(), i * 200);
                      }
                    }}
                    className="text-xs h-7"
                  >
                    强制刷新
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
