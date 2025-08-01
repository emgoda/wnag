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
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Settings, Type, Palette, Box, Image, Link2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Eye, EyeOff, ChevronRight, ChevronDown,
  Code, FileText, MoreVertical, Copy, Trash2, Move, Edit3,
  ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';

interface PropertyPanelProps {
  selectedElement?: HTMLElement | null;
  onElementUpdate?: (element: HTMLElement, property: string, value: string) => void;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
}

interface TemplateSettings {
  inputShadow: boolean;
  inputThemeColor: boolean;
  buttonTransparent: boolean;
}

interface DOMNode {
  element: HTMLElement;
  tagName: string;
  id?: string;
  className?: string;
  children: DOMNode[];
  isExpanded: boolean;
}

export default function PropertyPanel({ selectedElement, onElementUpdate, selectedNodeId, onNodeSelect }: PropertyPanelProps) {
  const [elementData, setElementData] = useState<{
    tagName: string;
    id: string;
    className: string;
    textContent: string;
    attributes: { [key: string]: string };
    styles: { [key: string]: string };
  } | null>(null);

  const [forceUpdate, setForceUpdate] = useState(0);
  const [localTextContent, setLocalTextContent] = useState(''); // 本������本状态

  const [domTree, setDomTree] = useState<DOMNode[]>([]);
  const [selectedNodeElement, setSelectedNodeElement] = useState<HTMLElement | null>(null);
  const [showAllElements, setShowAllElements] = useState(false); // 控制是否显示所有元素（包括不可操作的）
  const [selectionMode, setSelectionMode] = useState<'preview' | 'locked'>('preview'); // 选择���式：预览或锁定
  const [previewElement, setPreviewElement] = useState<HTMLElement | null>(null); // 预览中的元素

  // 安全访问iframe内容的辅助函数，处理跨域错误
  const safeAccessIframe = (callback: (doc: Document) => void): boolean => {
    try {
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          callback(doc);
          return true;
        } else {
          console.warn('无法访问iframe文档 - 可能还未加载');
          return false;
        }
      }
    } catch (error) {
      console.warn('跨域访问被阻止，跳过iframe操作:', error);
      return false;
    }
    return false;
  };



  // Template generation states
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    inputShadow: false,
    inputThemeColor: false,
    buttonTransparent: false
  });

  // 右键菜单��态
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    node: DOMNode | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    node: null
  });

  // 构建DOM树
  // 检查元素是否可操���
  const isElementOperable = (element: HTMLElement): boolean => {
    const tagName = element.tagName.toLowerCase();

    // 不可操�����系统元素
    const nonOperableSystemTags = [
      'script', 'style', 'link', 'meta', 'head', 'title', 'base', 'noscript'
    ];

    // 不可操作的UI框架元素（通过特定属性识别）
    const hasFrameworkAttributes =
      element.hasAttribute('data-loc') || // React/框架调试属性
      element.hasAttribute('aria-hidden') || // ARIA��藏��素
      element.hasAttribute('data-radix-collection-item') || // Radix UI内部元素
      element.hasAttribute('data-state') || // 框架状态元素
      element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1' || // 不可聚��元素
      element.getAttribute('role') === 'presentation' || // 纯展示元素
      element.getAttribute('role') === 'none'; // 无��义元素

    // 不可操作的CSS类名模式
    const nonOperableClassPatterns = [
      /^lucide/, // Lucide图标
      /toast/, // Toast通知组件
      /overlay/, // 遮罩层
      /backdrop/, // 背景层
      /portal/, // 传送门组件
      /popover/, // 弹出层
      /tooltip/, // 工具提示
      /dropdown/, // 下拉菜单内部
      /radix-/, // Radix UI组件
      /^sr-only$/, // 屏幕阅读器专用
    ];

    // 检查类名是否匹配不可操作模式
    const hasNonOperableClass = element.className &&
      nonOperableClassPatterns.some(pattern =>
        String(element.className).split(' ').some(cls => pattern.test(cls))
      );

    // 系统生成的内容元素
    const isSystemGenerated =
      element.getAttribute('aria-label')?.includes('Notifications') || // 通知系统
      element.querySelector('svg[class*="lucide"]') !== null; // 包含图标的���钮等

    // 如果���以上任何一��情况，则不可操作
    if (nonOperableSystemTags.includes(tagName) ||
        hasFrameworkAttributes ||
        hasNonOperableClass ||
        isSystemGenerated) {
      return false;
    }

    return true;
  };

  // 生成或获取元素的唯一ID
  const getElementNodeId = (element: HTMLElement): string => {
    // 如��元素已经有data-node-id，��接返回
    if (element.hasAttribute('data-node-id')) {
      return element.getAttribute('data-node-id')!;
    }

    // 生成新的唯一ID
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    element.setAttribute('data-node-id', nodeId);
    return nodeId;
  };

  // 构建DOM树 - 只显示元素节点（Element），过��文本节点、注释节点等，并根据设置过滤不可操作元素
  const buildTree = (root: HTMLElement): DOMNode[] => {
    const res: DOMNode[] = [];
    root.childNodes.forEach((node) => {
      // 只处���元素节点 (nodeType === 1)，忽略文��节点(3)、注释节点(8)等
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const operable = isElementOperable(element);

        // 为����素生成唯一ID
        getElementNodeId(element);

        // 根据showAllElements设置决定是否显示
        if (showAllElements || operable) {
          res.push({
            element,
            tagName: element.tagName.toLowerCase(),
            id: element.id || undefined,
            className: element.className ? String(element.className).trim() || undefined : undefined,
            children: buildTree(element), // 递归构建子元素树
            isExpanded: true // 默认��开所有节点
          });
        } else {
          // 对于不可操作的元素，仍然��查其子元素（只有在不显示所有元素时）
          const operableChildren = buildTree(element);
          res.push(...operableChildren);
        }
      }
    });
    return res;
  };

  // 兼容旧接����单节点构建��法 - 只构建元素节点树
  const buildDOMTree = (element: HTMLElement, depth = 0): DOMNode => {
    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className ? String(element.className).trim() || undefined : undefined,
      children: buildTree(element), // 只包含子元素节点
      isExpanded: true
    };
  };

  // 获取iframe中的DOM树
  const getDOMTreeFromIframe = () => {
    console.log('开始查����iframe...');

    // 列���所���可能的iframe
    const allIframes = document.querySelectorAll('iframe');
    console.log('页面中所有iframe:', allIframes.length, allIframes);

    // 直接查找第一个可用的iframe
    let editorIframe = document.querySelector('iframe') as HTMLIFrameElement;

    if (!editorIframe) {
      console.log('未找到iframe元素');
      console.log('当前页面所有iframe的title属��:',
        Array.from(allIframes).map(iframe => iframe.title));
      return;
    }

    console.log('���到iframe:', editorIframe, '���题:', editorIframe.title);

    try {
      const doc = editorIframe.contentDocument || editorIframe.contentWindow?.document;

      if (!doc) {
        console.log('无法访问iframe���档');
        return;
      }

      const body = doc.body;
      const html = doc.documentElement;

      console.log('iframe详细����:', {
        readyState: doc.readyState,
        bodyChildren: body?.children.length || 0,
        htmlChildren: html?.children.length || 0,
        bodyHTML: body?.innerHTML?.substring(0, 200) || 'empty',
        docTitle: doc.title,
        docURL: doc.URL,
        bodyTagName: body?.tagName,
        bodyHasContent: !!body?.innerHTML
      });

      // 检查是否有任何实际内��
      const hasRealContent = body?.innerHTML && body.innerHTML.trim().length > 0;

      // 尝试����canvas-root容器，如果没有则使用body
      const canvasRoot = doc.querySelector('.canvas-root') as HTMLElement;
      const containerElement = canvasRoot || body;

      if (containerElement) {
        // 如果找到canvas-root，直接构建其���树；否��构建body树
        if (canvasRoot) {
          console.log('找到canvas-root容器，构建子树');
          const tree = buildTree(canvasRoot);
          setDomTree(tree);
          console.log('DOM树构建成功，节点数:', tree.length);
        } else {
          console.log('使用body容器构建DOM树');
          const tree = buildDOMTree(body);
          tree.isExpanded = true;
          setDomTree([tree]);
          console.log('DOM树���建成功 - 标签:', tree.tagName, '子节点数:', tree.children.length);
        }

        // 强制展开body�������点
        setTimeout(() => {
          setDomTree(prev => prev.map(node =>
            node.tagName === 'body'
              ? { ...node, isExpanded: true }
              : node
          ));
        }, 50);

        // 记录body为空的情��，但不无限重试
        if (body.children.length === 0) {
          console.log('body为空，但仍显示DOM���结构');
        }
      } else if (html && html.children.length > 0) {
        // 尝试从html��元素开始��建
        const tree = buildDOMTree(html);
        console.log('从HTML根元素构建DOM树，节点数:', tree.children.length);
        setDomTree([tree]);
      } else {
        console.log('iframe内容��空，body子元素数:', body?.children.length || 0);
        console.log('body innerHTML:', body?.innerHTML?.substring(0, 200) || 'empty');
        // 如���body为空，等待内容加���
        setTimeout(() => {
          getDOMTreeFromIframe();
        }, 1000);
      }
    } catch (error) {
      console.error('读取iframe内容时出错:', error);
    }
  };

  // 页面加载时和选��元素变化时更����DOM树
  useEffect(() => {
    console.log('PropertyPanel useEffect 触发');

    // 立即尝试获取DOM树
    getDOMTreeFromIframe();

    // ������再次获取DOM树，确保内容已加载
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
          console.log('iframe加载完成�������触发');
          setTimeout(() => {
            getDOMTreeFromIframe();
          }, 300);
        };

        const handleContentChange = () => {
          console.log('iframe内���变化');
          getDOMTreeFromIframe();
        };

        iframe.addEventListener('load', handleLoad);

        // 暂时禁用iframe内容变化监听，避免编辑时DOM树频繁刷新
        // try {
        //   if (iframe.contentDocument) {
        //     iframe.contentDocument.addEventListener('DOMContentLoaded', handleContentChange);
        //   }
        // } catch (e) {
        //   console.log('无法监听iframe内容文档:', e);
        // }

        // 如果iframe已经加��完成，立即获取DOM树
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          console.log('iframe���完成加载，立��获取DOM树');
          handleLoad();
        }

        return () => {
          iframe.removeEventListener('load', handleLoad);
          // ��禁用内容变化监听器，无��清理
          // try {
          //   if (iframe.contentDocument) {
          //     iframe.contentDocument.removeEventListener('DOMContentLoaded', handleContentChange);
          //   }
          // } catch (e) {
          //   // 忽略清理错误
          // }
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

  // 监听页���内容变化，实时更新DOM树
  useEffect(() => {
    const updateDOMTree = () => {
      console.log('定期更新DOM树');
      getDOMTreeFromIframe();
    };

    // 监��自定义DOM���刷新事件
    const handleDOMTreeRefresh = () => {
      console.log('收到DOM树刷新事件');
      getDOMTreeFromIframe();
    };

    window.addEventListener('domTreeRefresh', handleDOMTreeRefresh);

    // 恢复但���长定期检查间隔，减少编辑��的干扰
    const interval = setInterval(updateDOMTree, 10000); // 改为10秒一次

    return () => {
      clearInterval(interval); // 恢复interval清理
      window.removeEventListener('domTreeRefresh', handleDOMTreeRefresh);
    };
  }, []);

  // 组件挂载时立即尝试加载DOM���
  useEffect(() => {
    console.log('PropertyPanel��件挂���，立即获取DOM树');
    // 多次尝���，确保能够获取到
    const attempts = [100, 500, 1000, 2000];
    attempts.forEach(delay => {
      setTimeout(() => {
        console.log(`尝试获取DOM树 (延迟${delay}ms)`);
        getDOMTreeFromIframe();
      }, delay);
    });
  }, []);

  // 检��是否为预设元素
  useEffect(() => {
    if (selectedElement) {
      // 检查元素是否包含预��相关的内容���类名
      const elementHTML = selectedElement.outerHTML || '';
      const isPresetElement = elementHTML.includes('预设') ||
                              selectedElement.textContent?.includes('预设') ||
                              selectedElement.querySelector('[style*="���设"]') !== null;

      setShowTemplateGenerator(isPresetElement);
    } else {
      setShowTemplateGenerator(false);
    }
  }, [selectedElement]);

  // ���新元素数据
  useEffect(() => {
    if (selectedElement) {
      const computedStyles = window.getComputedStyle(selectedElement);
      const styles: { [key: string]: string } = {};
      
      // 获取��用样式�������性
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

      // 获取文��������，确保获��������正确的文本
      let textContent = '';

      // 尝试不同的方式���取文本内容
      if (selectedElement.textContent) {
        textContent = selectedElement.textContent.trim();
      } else if (selectedElement.innerText) {
        textContent = selectedElement.innerText.trim();
      } else if (selectedElement.innerHTML && !selectedElement.innerHTML.includes('<')) {
        textContent = selectedElement.innerHTML.trim();
      }

      console.log('获取���素文本内容:', {
        element: selectedElement,
        tagName: selectedElement.tagName,
        textContent: selectedElement.textContent,
        innerText: selectedElement.innerText,
        innerHTML: selectedElement.innerHTML,
        final: textContent
      });

      const newElementData = {
        tagName: selectedElement.tagName.toLowerCase(),
        id: selectedElement.id || '',
        className: selectedElement.className || '',
        textContent: textContent,
        attributes,
        styles
      };

      setElementData(newElementData);
      setLocalTextContent(textContent); // 同���本地文本��态
    } else {
      setElementData(null);
    }
  }, [selectedElement]);

  // ����中元素变化时，同步本地文本��态
  useEffect(() => {
    if (elementData) {
      setLocalTextContent(elementData.textContent);
    } else {
      setLocalTextContent('');
    }
  }, [elementData]);

  // 当��中元素变化时，自动跳转到DOM树中对应的节点
  useEffect(() => {
    if (selectedElement && domTree.length > 0) {
      console.log('选中元素变化，自动跳转到DOM树节点:', selectedElement);

      // 当画布选择元素时，自动更新selectedNodeId
      const nodeId = selectedElement.getAttribute('data-node-id');
      if (nodeId && nodeId !== selectedNodeId && onNodeSelect) {
        console.log('���布选择了新元素，同步到selectedNodeId:', nodeId);
        onNodeSelect(nodeId);
      }
    }
  }, [selectedElement, domTree, selectedNodeId, onNodeSelect]);

  // 添加全局点击事���监听器来关闭右键菜单
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.show) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [contextMenu.show]);

  // 更新元素属性
  const handleAttributeChange = (attribute: string, value: string) => {
    if (!selectedElement || !onElementUpdate) return;

    if (value) {
      selectedElement.setAttribute(attribute, value);
    } else {
      selectedElement.removeAttribute(attribute);
    }

    // ��������新DOM中的对应元素
    const updateElementInDOM = () => {
      try {
        console.log('开始更新DOM，���性:', attribute, '值:', value);

        // 获取iframe文档
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;

        if (!iframeDoc) {
          console.log('无法获取iframe文档');
          return;
        }

        // 简������略：直接更新最后一���相关元素（用户最新操作的）
        if (attribute === 'data-title') {
          const allLabels = iframeDoc.querySelectorAll('label');
          const lastLabel = allLabels[allLabels.length - 1];
          if (lastLabel) {
            lastLabel.textContent = value || '标题';
            lastLabel.setAttribute('data-title', value || '标���');
            console.log('已��新最后一���label���:', value);
          } else {
            console.log('未找到label元素');
          }
        }

        if (attribute === 'placeholder') {
          const allInputs = iframeDoc.querySelectorAll('input[type="text"]');
          const lastInput = allInputs[allInputs.length - 1];
          if (lastInput) {
            lastInput.setAttribute('placeholder', value || '');
            console.log('已更新最后一个input placeholder为:', value);
          } else {
            console.log('未找到input元素');
          }
        }
      } catch (error) {
        console.error('更新DOM出错:', error);
      }
    };

    // 立即执行更新
    updateElementInDOM();

    // ����时再��行一次确保�����新成功
    setTimeout(updateElementInDOM, 100);

    onElementUpdate(selectedElement, attribute, value);

    // ��新本�����态
    setElementData(prev => prev ? {
      ...prev,
      attributes: { ...prev.attributes, [attribute]: value }
    } : null);
  };

  // ���新元素样��
  const handleStyleChange = (property: string, value: string) => {
    if (!selectedElement || !onElementUpdate) return;
    
    selectedElement.style.setProperty(property, value);
    onElementUpdate(selectedElement, property, value);
    
    // 更新本���状态
    setElementData(prev => prev ? {
      ...prev,
      styles: { ...prev.styles, [property]: value }
    } : null);
  };

  // 更���文本内容
  const handleTextContentChange = (value: string) => {
    console.log('文本输入变化:', value);

    // 立即更新本地状态，确保输��响����
    setLocalTextContent(value);

    // 同时更������elementData状态
    setElementData(prev => prev ? { ...prev, textContent: value } : null);

    // 如果有选中的元素���尝试更新实际DOM
    if (selectedElement) {
      try {
        console.log('更新DOM元素文本:', selectedElement.tagName, value);
        selectedElement.textContent = value;

        // ��知父组件
        if (onElementUpdate) {
          onElementUpdate(selectedElement, 'textContent', value);
        }

      } catch (error) {
        console.error('DOM更��失败:', error);
      }
    }
  };

  // 复制元素
  const handleDuplicateElement = () => {
    if (!selectedElement) return;

    try {
      const cloned = selectedElement.cloneNode(true) as HTMLElement;
      // 如果复制的元素有ID，需要移��或修改ID以避免重复
      if (cloned.id) {
        cloned.id = cloned.id + '_copy';
      }
      selectedElement.parentNode?.insertBefore(cloned, selectedElement.nextSibling);

      // 更新页面���容
      updateParentContent();

      // 重新获取DOM树
      setTimeout(() => {
        getDOMTreeFromIframe();
      }, 100);

      console.log('元素复制���功');
    } catch (error) {
      console.error('复制元��失���:', error);
    }
  };

  // 向上移动元���
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

  // ���辑元素HTML
  const handleEditElementHTML = () => {
    if (!selectedElement) return;

    const html = selectedElement.outerHTML;
    const newHTML = prompt('编辑元素HTML:\n\n��意：请确��HTML格式正确', html);

    if (newHTML && newHTML !== html) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHTML.trim();
        const newElement = tempDiv.firstElementChild;

        if (newElement) {
          selectedElement.parentNode?.replaceChild(newElement, selectedElement);
          updateParentContent();
          setTimeout(() => getDOMTreeFromIframe(), 100);
          console.log('HTML���辑成功');
        } else {
          alert('无效的HTML格式，请检查后重��');
        }
      } catch (error) {
        console.error('HTML编辑失败:', error);
        alert('HTML编��失败���请检查格式是否正��');
      }
    }
  };

  // 选择父��������
  const handleSelectParent = () => {
    if (!selectedElement) return;

    const parent = selectedElement.parentElement;
    if (parent && parent !== document.body && parent !== document.documentElement) {
      // 清除当前选���状态
      selectedElement.classList.remove('element-selected');

      // 选择父元素
      parent.classList.add('element-selected');

      // 通知父组件
      if (onElementUpdate) {
        // 这里我们通过触发一���特殊的更���来选���父元素
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        parent.dispatchEvent(clickEvent);
      }
    }
  };

  // 删除���素
  const handleDeleteElement = () => {
    if (!selectedElement) return;

    selectedElement.remove();
    setElementData(null);
    updateParentContent();
    setTimeout(() => getDOMTreeFromIframe(), 100);
  };

  // ����新父组件内容
  const updateParentContent = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe || !onElementUpdate || !selectedElement) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // ���发父组���的内容更���
    onElementUpdate(selectedElement, 'dom-update', doc.documentElement.outerHTML);
  };

  // 处理���板生成
  const handleTemplateGeneration = () => {
    if (!selectedTemplate) {
      alert('请先选择一个模��');
      return;
    }

    const addElementToPage = (window as any).addElementToPage;
    if (!addElementToPage) {
      alert('页面编辑器不可用');
      return;
    }

    let templateHTML = '';

    switch (selectedTemplate) {
      case 'hero-section':
        templateHTML = generateHeroSection();
        break;
      case 'feature-cards':
        templateHTML = generateFeatureCards();
        break;
      case 'contact-form':
        templateHTML = generateContactForm();
        break;
      case 'pricing-table':
        templateHTML = generatePricingTable();
        break;
      case 'testimonial':
        templateHTML = generateTestimonial();
        break;
      default:
        templateHTML = '<div>未知模板</div>';
    }

    // 添��到页面
    addElementToPage({
      tag: 'div',
      content: templateHTML,
      attributes: {
        style: 'margin: 20px auto;'
      }
    }, 'append');

    alert('模板生成成功！');
  };

  // 生成Hero区域模板
  const generateHeroSection = () => {
    const shadowStyle = templateSettings.inputShadow ? 'box-shadow: 0 4px 8px rgba(0,0,0,0.1);' : '';
    const themeColor = templateSettings.inputThemeColor ? '#3b82f6' : '#6b7280';
    const buttonOpacity = templateSettings.buttonTransparent ? 'opacity: 0.8;' : '';

    return `
      <section style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 24px; margin: 20px auto; max-width: 350px; position: relative; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);">
        <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);"></div>
        <div style="max-width: 100%; margin: 0 auto; position: relative; z-index: 1;">
          <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 15px; line-height: 1.2; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); letter-spacing: -0.5px;">
            欢迎来到我们的网站
          </h1>
          <p style="font-size: 16px; margin-bottom: 25px; opacity: 0.95; line-height: 1.6; font-weight: 400; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
            发现���限可能，创造美好未���
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button style="background: white; color: ${themeColor}; border: none; padding: 14px 24px; border-radius: 16px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); ${buttonOpacity} box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8);" onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              开始使用
            </button>
            <button style="background: rgba(255, 255, 255, 0.1); color: white; border: 2px solid rgba(255, 255, 255, 0.8); padding: 14px 24px; border-radius: 16px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); ${buttonOpacity} backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 16px 40px rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(255, 255, 255, 0.1)'">
              了解更多
            </button>
          </div>
        </div>
      </section>
    `;
  };

  // 生成��能卡片模板
  const generateFeatureCards = () => {
    const shadowStyle = templateSettings.inputShadow ? 'box-shadow: 0 4px 16px rgba(0,0,0,0.1);' : 'box-shadow: 0 2px 8px rgba(0,0,0,0.05);';

    return `
      <section style="padding: 50px 20px; max-width: 350px; margin: 0 auto; background: linear-gradient(145deg, #f8fafc, #ffffff); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);">
        <div style="max-width: 100%; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 26px; font-weight: 900; margin-bottom: 15px; color: #1f2937; background: linear-gradient(135deg, #1f2937, #374151); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;">
            我们的特色
          </h2>
          <p style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 35px; font-weight: 500;">
            专业的服务，���越���������验
          </p>
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 20px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">����</div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1f2937; letter-spacing: -0.3px;">������部署</h3>
              <p style="color: #4b5563; line-height: 1.6; font-size: 13px; font-weight: 400;">一�����署，快��上线，让您的产品迅速到达用户</p>
            </div>
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">🛡️</div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1f2937; letter-spacing: -0.3px;">安全可靠</h3>
              <p style="color: #4b5563; line-height: 1.6; font-size: 13px; font-weight: 400;">企业级安全保�����，全方位保�����的���������������</p>
            </div>
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 20px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">⚡</div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1f2937; letter-spacing: -0.3px;">��性能</h3>
              <p style="color: #4b5563; line-height: 1.6; font-size: 13px; font-weight: 400;">优化的架构设计，提供�����的用户体验</p>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  // ���成���系表单模板
  const generateContactForm = () => {
    const shadowStyle = templateSettings.inputShadow ? 'box-shadow: 0 4px 8px rgba(0,0,0,0.1);' : '';
    const themeColor = templateSettings.inputThemeColor ? '#3b82f6' : '#6b7280';
    const buttonOpacity = templateSettings.buttonTransparent ? 'opacity: 0.8;' : '';

    return `
      <section style="max-width: 350px; margin: 30px auto; padding: 32px; background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
        <h2 style="text-align: center; font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #1f2937; background: linear-gradient(135deg, #1f2937, #374151); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;">
          ���系我们
        </h2>
        <p style="text-align: center; color: #6b7280; margin-bottom: 30px; font-size: 14px; font-weight: 500;">
          有任何问题����们很乐意为您解答
        </p>
        <form style="space-y: 20px;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">姓名</label>
            <input type="text" placeholder="请输入您的姓名" style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 16px; font-size: 14px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(248, 250, 252, 0.6); backdrop-filter: blur(4px); box-sizing: border-box;" onfocus="this.style.borderColor='${themeColor}'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15)'; this.style.background='white'; this.style.transform='translateY(-1px)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='rgba(248, 250, 252, 0.6)'; this.style.transform='translateY(0)'">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">���������箱</label>
            <input type="email" placeholder="请输入�����的邮箱" style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 16px; font-size: 14px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(248, 250, 252, 0.6); backdrop-filter: blur(4px); box-sizing: border-box;" onfocus="this.style.borderColor='${themeColor}'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15)'; this.style.background='white'; this.style.transform='translateY(-1px)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='rgba(248, 250, 252, 0.6)'; this.style.transform='translateY(0)'">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">留言</label>
            <textarea placeholder="请输入��的留言..." style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 16px; font-size: 14px; min-height: 120px; resize: vertical; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(248, 250, 252, 0.6); backdrop-filter: blur(4px); box-sizing: border-box;" onfocus="this.style.borderColor='${themeColor}'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15)'; this.style.background='white'; this.style.transform='translateY(-1px)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='rgba(248, 250, 252, 0.6)'; this.style.transform='translateY(0)'"></textarea>
          </div>
          <button type="submit" style="width: 100%; background: linear-gradient(135deg, ${themeColor}, #1d4ed8); color: white; border: none; padding: 16px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); ${buttonOpacity} position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-2px) scale(1.02)'; this.style.boxShadow='0 16px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'" onclick="alert('感谢您的留言！我们会尽����回复。');">
            发送���言
          </button>
        </form>
      </section>
    `;
  };

  // 生成价格表���板
  const generatePricingTable = () => {
    const shadowStyle = templateSettings.inputShadow ? 'box-shadow: 0 4px 16px rgba(0,0,0,0.1);' : 'box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
    const themeColor = templateSettings.inputThemeColor ? '#3b82f6' : '#6b7280';
    const buttonOpacity = templateSettings.buttonTransparent ? 'opacity: 0.8;' : '';

    return `
      <section style="padding: 40px 15px; max-width: 350px; margin: 0 auto;">
        <div style="max-width: 100%; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">
            选择适��的方������
          </h2>
          <p style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 30px;">
            灵活的定价，满足不同需求
          </p>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #e5e7eb; transition: all 0.3s; ${shadowStyle}" onmouseover="this.style.borderColor='${themeColor}'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">����础版</h3>
              <div style="font-size: 32px; font-weight: bold; color: ${themeColor}; margin-bottom: 8px;">¥99</div>
              <div style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">每月</div>
              <ul style="text-align: left; margin-bottom: 20px; padding-left: 0; list-style: none;">
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 基础功能</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 5GB 存储空间</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 邮件支持</li>
              </ul>
              <button style="width: 100%; background: transparent; color: ${themeColor}; border: 2px solid ${themeColor}; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; ${buttonOpacity}" onmouseover="this.style.background='${themeColor}'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='${themeColor}'">
                选择基��版
              </button>
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid ${themeColor}; position: relative; transition: all 0.3s; ${shadowStyle}" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
              <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: ${themeColor}; color: white; padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 600;">推荐</div>
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">专业版</h3>
              <div style="font-size: 32px; font-weight: bold; color: ${themeColor}; margin-bottom: 8px;">����199</div>
              <div style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">每月</div>
              <ul style="text-align: left; margin-bottom: 20px; padding-left: 0; list-style: none;">
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 所有基础功能</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 50GB 存储空间</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 优先支持</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">��� 高级分析</li>
              </ul>
              <button style="width: 100%; background: ${themeColor}; color: white; border: none; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; ${buttonOpacity}" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                选择专业��
              </button>
            </div>
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #e5e7eb; transition: all 0.3s; ${shadowStyle}" onmouseover="this.style.borderColor='${themeColor}'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">企业版</h3>
              <div style="font-size: 32px; font-weight: bold; color: ${themeColor}; margin-bottom: 8px;">¥399</div>
              <div style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">每月</div>
              <ul style="text-align: left; margin-bottom: 20px; padding-left: 0; list-style: none;">
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 所有专业功��</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 无限存储空���</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">��� 24/7 专属支持</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 定制�����成</li>
              </ul>
              <button style="width: 100%; background: transparent; color: ${themeColor}; border: 2px solid ${themeColor}; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; ${buttonOpacity}" onmouseover="this.style.background='${themeColor}'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='${themeColor}'">
                选择企业�����
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  // 生成���户评价��板
  const generateTestimonial = () => {
    const shadowStyle = templateSettings.inputShadow ? 'box-shadow: 0 4px 16px rgba(0,0,0,0.1);' : 'box-shadow: 0 2px 8px rgba(0,0,0,0.05);';

    return `
      <section style="padding: 50px 20px; background: linear-gradient(145deg, #f8fafc, #ffffff); max-width: 350px; margin: 0 auto; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);">
        <div style="max-width: 100%; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 26px; font-weight: 900; margin-bottom: 15px; color: #1f2937; background: linear-gradient(135deg, #1f2937, #374151); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;">
            客户评价
          </h2>
          <p style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 35px; font-weight: 500;">
            ���听客户怎么说
          </p>
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="color: #fbbf24; font-size: 18px; margin-bottom: 18px; filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));">���⭐⭐⭐⭐</div>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 18px; font-style: italic; font-size: 14px; font-weight: 400;">
                "非常棒的产品！界面友好，功能强��，完全满足了我们的需求。客服响应也很及时。"
              </p>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">李</div>
                <div>
                  <div style="font-weight: 700; color: #1f2937; font-size: 15px; letter-spacing: -0.2px;">李先生</div>
                  <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-top: 2px;">产品经理</div>
                </div>
              </div>
            </div>
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="color: #fbbf24; font-size: 18px; margin-bottom: 18px; filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));">⭐⭐⭐⭐⭐</div>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 18px; font-style: italic; font-size: 14px; font-weight: 400;">
                "��队协作���率大�����升，数据分析功能特别实�������强烈推荐给其他企业！"
              </p>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">王</div>
                <div>
                  <div style="font-weight: 700; color: #1f2937; font-size: 15px; letter-spacing: -0.2px;">王女士</div>
                  <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-top: 2px;">运营总���</div>
                </div>
              </div>
            </div>
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="color: #fbbf24; font-size: 18px; margin-bottom: 18px; filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));">���⭐⭐⭐⭐</div>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 18px; font-style: italic; font-size: 14px; font-weight: 400;">
                "部署��单，使���方便���性价比很高。技术支持团队专业且耐心，解�����题很���时。"
              </p>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">��</div>
                <div>
                  <div style="font-weight: 700; color: #1f2937; font-size: 15px; letter-spacing: -0.2px;">���先生</div>
                  <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-top: 2px;">技���总监</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
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

  // 自动展开��指定元素并滚动到该���置
  const autoExpandToElement = (targetElement: HTMLElement) => {
    // 查找元素在DOM树中的路径
    const findElementPath = (nodes: DOMNode[], target: HTMLElement, path: DOMNode[] = []): DOMNode[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node];

        if (node.element === target) {
          return currentPath;
        }

        if (node.children.length > 0) {
          const childPath = findElementPath(node.children, target, currentPath);
          if (childPath) {
            return childPath;
          }
        }
      }
      return null;
    };

    const elementPath = findElementPath(domTree, targetElement);

    if (elementPath) {
      console.log('找到元素路径，自���展开:', elementPath.map(n => n.tagName));

      // 展开路径上的所有节点
      const expandPath = (nodes: DOMNode[]): DOMNode[] => {
        return nodes.map(node => {
          const shouldExpand = elementPath.some(pathNode => pathNode.element === node.element);
          return {
            ...node,
            isExpanded: shouldExpand ? true : node.isExpanded,
            children: node.children.length > 0 ? expandPath(node.children) : node.children
          };
        });
      };

      setDomTree(prev => expandPath(prev));

      // 延时滚动���目��元素，确保DOM已更新
      setTimeout(() => {
        // 尝试通��元素��容查找对应的DOM树�����
        const allTreeNodes = document.querySelectorAll('.text-sm');
        for (const treeNode of allTreeNodes) {
          const nodeText = treeNode.textContent || '';
          if (nodeText.includes(`<${targetElement.tagName?.toLowerCase()}>`) &&
              (targetElement.id ? nodeText.includes(`#${targetElement.id}`) : true) &&
              (targetElement.className ?
                nodeText.includes(String(targetElement.className).split(' ')[0]) : true)) {
            treeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('��滚动到目标节��');
            break;
          }
        }
      }, 200);
    } else {
      console.log('未在DOM树中找到目标元素');
    }
  };

  // 删除DOM元素
  const deleteElement = (elementToDelete: HTMLElement) => {
    try {
      // 从iframe中删除元素
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        // 找到iframe中对应的元素并删除
        let iframeElement;
        try {
          iframeElement = iframe.contentDocument.querySelector(`[data-node-id="${elementToDelete.getAttribute('data-node-id')}"]`) || elementToDelete;
        } catch (crossOriginError) {
          console.warn('跨域访问被��止，跳过删除操作:', crossOriginError);
          return;
        }
        if (iframeElement && iframeElement.parentNode) {
          iframeElement.parentNode.removeChild(iframeElement);
          console.log('已删��元素:', elementToDelete.tagName);

          // 如果删除的是当前选中的元素，清除选中状态
          if (selectedElement === elementToDelete) {
            setSelectedNodeElement(null);
            setElementData(null);
          }

          // ���新DOM树
          setTimeout(() => {
            getDOMTreeFromIframe();
          }, 100);

          // 触发页面更新
          if (onElementUpdate) {
            onElementUpdate(elementToDelete, 'delete', '');
          }
        }
      }
    } catch (error) {
      console.error('删除元素失败:', error);
      alert('删��元素失败，请重试');
    }
  };

  // ��理右键菜单
  const handleContextMenu = (e: React.MouseEvent, node: DOMNode) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, show: false }));
  };

  // 清除iframe中的预览样式
  const clearIframePreviewStyles = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;
      const previewElements = doc.querySelectorAll('.dom-tree-preview, [data-dom-tree-preview]');
      previewElements.forEach(el => {
        el.classList.remove('dom-tree-preview');
        el.removeAttribute('data-dom-tree-preview');
      });
    }
  };

  // 清除所有选��状态
  const clearSelection = () => {
    console.log('开始清��选中状态...');

    // 清除选择状态
    if (onNodeSelect) {
      onNodeSelect(null);
    }
    setElementData(null);

    // 清除iframe��的所有高亮和限制
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      const doc = iframe.contentDocument;

      // 移除所有可能的选中样式
      const highlighted = doc.querySelectorAll('.dom-tree-selected, .dom-tree-preview, .element-selected, .selected, [data-dom-tree-selected], [data-dom-tree-preview]');
      highlighted.forEach(el => {
        el.classList.remove('dom-tree-selected', 'dom-tree-preview', 'element-selected', 'selected');
        el.removeAttribute('data-dom-tree-selected');
        el.removeAttribute('data-dom-tree-preview');

        // 恢复����title
        const title = el.getAttribute('title');
        if (title && title.includes('🔒 已选中')) {
          el.removeAttribute('title');
        }

        // 清除所有��能阻止交互的样式
        el.style.removeProperty('pointer-events');
        el.style.removeProperty('user-select');
        el.style.removeProperty('position');
        el.style.removeProperty('z-index');

        // �������恢复交互能力
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'default';
      });

      // 移除所有可能的事件监听器影响
      const allElements = doc.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.removeProperty('pointer-events');
        if (el.style.pointerEvents === 'none') {
          el.style.pointerEvents = 'auto';
        }
      });

      console.log('已清除', highlighted.length, '个元素的选中状��');
    }

    // 通过onElementUpdate通知父组件清除选中
    if (onElementUpdate) {
      onElementUpdate(document.createElement('div'), 'clear-selection', '');
    }

    console.log('所有选中状态已清除，元素可自由交互');
  };

  // 选择DOM节点 - 纯���览模式，不锁定交互
  const handleNodeSelect = (element: HTMLElement) => {
    // 获取或生成元素的nodeId
    let nodeId = element.getAttribute('data-node-id');

    // 如果元素没有nodeId，为其生成��个
    if (!nodeId) {
      nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      element.setAttribute('data-node-id', nodeId);
      console.log('🔧 为元素生成nodeId:', element.tagName, nodeId);
    }

    if (onNodeSelect) {
      onNodeSelect(nodeId);
      console.log('✅ DOM树选择元素（预览模式）��nodeId:', nodeId);
    } else {
      console.warn('⚠�� DOM树元素缺��nodeId或缺少回调:', element);
    }
    // 注意：所有高亮显示逻辑现在都由Editor��件通过selectedNodeId受控处理
    // 这确保了元素只是被高亮预览，但不��被锁定无法交互
  };

  // 添�����停效果
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

  // 检测元素是否隐藏���不可见
  const isElementHidden = (element: HTMLElement): boolean => {
    try {
      // 首先检查iframe中的元素（因为DOM树���的元素��������来自iframe）
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentDocument) {
        // 尝试在iframe中找到对应的元素
        let targetElement = element;

        // 如果元素有data-node-id，优先用这个��找
        const nodeId = element.getAttribute('data-node-id');
        if (nodeId) {
          const iframeElement = iframe.contentDocument.querySelector(`[data-node-id="${nodeId}"]`);
          if (iframeElement) {
            targetElement = iframeElement as HTMLElement;
          }
        }

        // 使用iframe的window来获取计算样式
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && targetElement.ownerDocument === iframe.contentDocument) {
          const computedStyle = iframeWindow.getComputedStyle(targetElement);

          // 检查各种隐��条件
          if (
            computedStyle.display === 'none' ||
            computedStyle.visibility === 'hidden' ||
            computedStyle.opacity === '0' ||
            parseFloat(computedStyle.opacity) === 0
          ) {
            return true;
          }

          // ���查尺寸是否为0（����除某些正常的0尺寸元素）
          const rect = targetElement.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0 &&
              !['br', 'hr', 'meta', 'link', 'script', 'style'].includes(targetElement.tagName.toLowerCase())) {
            return true;
          }
        }
      }

      // 备用检查：使用当前document的样式
      const computedStyle = window.getComputedStyle(element);
      return (
        computedStyle.display === 'none' ||
        computedStyle.visibility === 'hidden' ||
        computedStyle.opacity === '0' ||
        parseFloat(computedStyle.opacity) === 0
      );

    } catch (error) {
      // ��果��测出错，默��不是隐藏的
      console.warn('隐藏检测出错:', error);
      return false;
    }
  };

  // 渲染DOM树节点
  const renderDOMNode = (node: DOMNode, depth = 0, index = 0) => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedElement === node.element;
    // 临时简化：减少隐藏检测，确保元素可见
    const isHidden = false; // isElementHidden(node.element);
    const isNonOperable = !isElementOperable(node.element);

    // 检查是否��当前选中的节点（��于nodeId）
    const nodeId = node.element.getAttribute('data-node-id');
    const isSelectedByNodeId = nodeId === selectedNodeId;
    const paddingLeft = depth * 16;

    // 获取元素的文本内容��览（前20个字符）
    const textPreview = node.element.textContent?.trim().slice(0, 20);
    const hasText = textPreview && textPreview.length > 0;

    return (
      <div key={`${node.tagName}-d${depth}-i${index}-${node.id || ''}-${(node.className && typeof node.className === 'string') ? node.className.replace(/\s+/g, '-') : 'no-class'}`} className="text-sm">
        <div
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer rounded transition-all duration-200 ${
            isSelectedByNodeId
              ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm transform scale-[1.02]'
              : isSelected
                ? 'bg-blue-50 border-l-2 border-blue-300'
                : isHidden
                  ? 'bg-orange-50 hover:bg-orange-100 border-l-2 border-orange-400 text-orange-700'
                  : isNonOperable
                    ? 'bg-red-50 hover:bg-red-100 border-l-2 border-red-300 text-red-600 opacity-75'
                    : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => {
            // 点击：选择元素
            handleNodeSelect(node.element);
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          onMouseEnter={() => handleNodeHover(node.element, true)}
          onMouseLeave={() => handleNodeHover(node.element, false)}
          title={`${node.tagName}${node.id ? `#${node.id}` : ''}${
            isNonOperable ? '\n🔒 不可操���元素（系���/框架元素）' :
            isHidden ? '\n👁️‍🗨️ 隐藏元素' :
            '\n可����作元素'
          }${
            false ? '\n���� 已锁定选择' :
            isSelectedByNodeId ? '\n✅ 当前选中' :
            ''
          }\n点击选择元素\n右键：删��元素`}
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

          <span className={`font-mono text-xs ${
            isHidden ? 'text-orange-600' :
            isNonOperable ? 'text-red-600' :
            'text-blue-600'
          }`}>
            &lt;{node.tagName}&gt;
            {isHidden && <span className="text-orange-500 ml-1" title="元素已隐藏">👁️‍🗨️</span>}
            {isNonOperable && <span className="text-red-500 ml-1" title="不可���作元素">🔒</span>}
          </span>

          {node.id && (
            <span className={`text-xs font-medium ${isHidden ? 'text-orange-600' : 'text-green-600'}`}>
              #{node.id}
            </span>
          )}

          {node.className && typeof node.className === 'string' && (
            <span className={`text-xs ${isHidden ? 'text-orange-600' : 'text-purple-600'}`}>
              .{node.className.split(' ')[0]}
            </span>
          )}

          {/* 显示元素组信息 */}
          {node.element.getAttribute('data-element-group') && (
            <span className="text-orange-600 text-xs bg-orange-100 px-1 rounded">
              组:{node.element.getAttribute('data-element-group')}
            </span>
          )}

          {/* �����元素类型信��� */}
          {node.element.getAttribute('data-element-type') && (
            <span className="text-indigo-600 text-xs bg-indigo-100 px-1 rounded">
              {node.element.getAttribute('data-element-type')}
            </span>
          )}

          {/* 显示data-title信息 */}
          {node.element.getAttribute('data-title') && (
            <span className="text-gray-600 text-xs bg-gray-100 px-1 rounded">
              {node.element.getAttribute('data-title')}
            </span>
          )}

          {hasText && (
            <span className="text-gray-500 text-xs italic ml-1 truncate max-w-20">
              "{textPreview}..."
            </span>
          )}

          {!hasChildren && node.tagName === 'body' && (
            <span className="text-gray-400 text-xs italic ml-1">
              (空容器)
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
            {node.children.map((child, index) => renderDOMNode(child, depth + 1, index))}
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
                点击预览中的元素或下方DOM�����进行编辑
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={showAllElements}
                      onCheckedChange={(checked) => {
                        setShowAllElements(checked);
                        // 切换显示模式后重新构建DOM树
                        setTimeout(() => getDOMTreeFromIframe(), 100);
                      }}
                      className="scale-75"
                    />
                    <span className="text-xs text-gray-600" title={showAllElements ? "显示所有元素（包括不可操作的）" : "只显示可操作元素"}>
                      {showAllElements ? "全部" : "可操作"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('刷新DOM树');
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
                <div className="text-xs mt-2 space-y-1">
                  <p className="text-green-600">
                    已加载 {domTree.length} 个根节点
                  </p>
                  <p className="text-blue-500">
                    第一个节点: {domTree[0]?.tagName} (子节点: {domTree[0]?.children?.length || 0})
                  </p>
                  {!showAllElements && (
                    <p className="text-gray-500">
                      ✅ 已过滤不可操作元素
                    </p>
                  )}
                  {showAllElements && (
                    <p className="text-yellow-600">
                      ⚠️ 显示所有元素（包括不可操作的）
                    </p>
                  )}

                </div>
              )}
            </div>
            <ScrollArea className="h-64">
              <div className="p-2">
                {domTree.length > 0 ? (
                  <div>
                    <div className="text-xs text-blue-600 mb-2">
                      调试：渲染 {domTree.length} 个根节点
                    </div>
                    {domTree.map((node, index) => {
                      console.log('��染节点:', node.tagName, 'children:', node.children.length);
                      return renderDOMNode(node, 0, index);
                    })}
                  </div>
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
            元素编��器
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
                  复制��素
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
                  ����HTML
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
                  ���择父元素
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteElement()}
                  className="text-red-600 focus:text-red-600 data-[disabled]:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除元���
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

      {/* ����������域 */}
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
                  本地内容: "{localTextContent}" (长度: {localTextContent.length})
                </div>
                <div className="text-xs text-blue-500 mb-1">
                  元素状态: "{elementData.textContent}" (长度: {elementData.textContent.length})
                </div>

                {/* 简单的input测试 */}
                <Input
                  value={localTextContent}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('🔵 Input onChange:', newValue);
                    setLocalTextContent(newValue);
                    // 只更新本地状态，不立即更新DOM
                    setElementData(prev => prev ? { ...prev, textContent: newValue } : null);
                  }}
                  onBlur={(e) => {
                    // 失焦��才更新DOM，避免频繁重建DOM树
                    const newValue = e.target.value;
                    console.log('🟢 Input失焦，更新DOM:', newValue);
                    if (selectedElement) {
                      selectedElement.textContent = newValue;
                      console.log('🟢 DOM更新完成:', selectedElement.textContent);
                    }
                  }}
                  placeholder="直接输入文本..."
                  className="mt-1"
                />

                {/* Textarea作为备用 */}
                <Textarea
                  value={localTextContent}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('🟡 Textarea onChange:', newValue);
                    setLocalTextContent(newValue);
                    // 只更新本地状态，不立即更新DOM
                    setElementData(prev => prev ? { ...prev, textContent: newValue } : null);
                  }}
                  onBlur={(e) => {
                    // 失焦时才更新DOM，避免频繁重建DOM树
                    const newValue = e.target.value;
                    console.log('🟡 Textarea失焦，更��DOM:', newValue);
                    if (selectedElement) {
                      selectedElement.textContent = newValue;
                    }
                  }}
                  placeholder="多行文本输入..."
                  className="mt-2 min-h-[60px]"
                />

              </div>

              {/* 特定��素的内��属性 */}
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
              {/* 显示方式 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    显示方式
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">显示方式</Label>
                    <Select
                      value={elementData.styles['display'] || 'block'}
                      onValueChange={(value) => handleStyleChange('display', value)}
                    >
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择显示方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="block">整行</SelectItem>
                        <SelectItem value="inline">行内</SelectItem>
                        <SelectItem value="inline-block">行内块</SelectItem>
                        <SelectItem value="flex">弹性</SelectItem>
                        <SelectItem value="none">隐藏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

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
                      <Label className="text-xs">字体��小</Label>
                      <Input
                        value={elementData.styles['font-size'] || ''}
                        onChange={(e) => handleStyleChange('font-size', e.target.value)}
                        placeholder="16px"
                        className="mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">字�����细</Label>
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

                  <div>
                    <Label className="text-xs">字体样式</Label>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={elementData.styles['font-weight'] === 'bold'}
                          onChange={(e) => handleStyleChange('font-weight', e.target.checked ? 'bold' : 'normal')}
                          className="rounded"
                        />
                        <span className="text-xs">粗体</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={elementData.styles['font-style'] === 'italic'}
                          onChange={(e) => handleStyleChange('font-style', e.target.checked ? 'italic' : 'normal')}
                          className="rounded"
                        />
                        <span className="text-xs">斜体</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={elementData.styles['text-decoration'] === 'underline'}
                          onChange={(e) => handleStyleChange('text-decoration', e.target.checked ? 'underline' : 'none')}
                          className="rounded"
                        />
                        <span className="text-xs">下划线</span>
                      </label>
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
                      <Label className="text-xs">内�������</Label>
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

              {/* 间距控制 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    间距设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 外边距 */}
                  <div>
                    <Label className="text-xs font-medium">外边距</Label>
                    <div className="grid grid-cols-3 gap-2 items-center mt-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['margin-top']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('margin-top', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>
                      <div className="text-center text-xs text-gray-500">外边距</div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['margin-right']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('margin-right', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['margin-left']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('margin-left', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>
                      <div></div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['margin-bottom']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('margin-bottom', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>
                    </div>
                  </div>

                  {/* 内边距 */}
                  <div>
                    <Label className="text-xs font-medium">内边距</Label>
                    <div className="grid grid-cols-3 gap-2 items-center mt-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['padding-top']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('padding-top', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>
                      <div className="text-center text-xs text-gray-500">内边距</div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['padding-right']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('padding-right', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['padding-left']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('padding-left', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>
                      <div></div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={elementData.styles['padding-bottom']?.replace('px', '') || ''}
                          onChange={(e) => handleStyleChange('padding-bottom', e.target.value + 'px')}
                          placeholder="0"
                          className="h-8 text-xs"
                        />
                        <span className="text-xs">px</span>
                      </div>
                    </div>
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
                <div className="mt-2 space-y-4">
                  {/* 标题���数据ID */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">标题</Label>
                      <Input
                        value={elementData.attributes['data-title'] || ''}
                        onChange={(e) => handleAttributeChange('data-title', e.target.value)}
                        placeholder=""
                        className="h-8 text-xs bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">数据ID</Label>
                      <Input
                        value={elementData.attributes['data-id'] || ''}
                        onChange={(e) => handleAttributeChange('data-id', e.target.value)}
                        placeholder=""
                        className="h-8 text-xs bg-white border-gray-300"
                      />
                    </div>
                  </div>

                  {/* 提�� */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">提示</Label>
                    <Input
                      value={elementData.attributes['placeholder'] || ''}
                      onChange={(e) => handleAttributeChange('placeholder', e.target.value)}
                      placeholder=""
                      className="h-8 text-xs bg-white border-gray-300"
                    />
                  </div>

                  {/* �����格式 */}
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Label className="text-xs text-gray-600">输入格式</Label>
                      <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">?</div>
                    </div>
                    <Input
                      value={elementData.attributes['pattern'] || ''}
                      onChange={(e) => handleAttributeChange('pattern', e.target.value)}
                      placeholder=""
                      className="h-8 text-xs bg-white border-gray-300"
                    />
                  </div>

                  {/* 可为空和键盘类型 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">可为空</Label>
                      <div className="flex items-center">
                        <div className="relative inline-block w-10 h-5">
                          <input
                            type="checkbox"
                            checked={elementData.attributes['required'] !== 'true'}
                            onChange={(e) => handleAttributeChange('required', e.target.checked ? 'false' : 'true')}
                            className="sr-only"
                            id="nullable-toggle"
                          />
                          <label
                            htmlFor="nullable-toggle"
                            className="block w-10 h-5 bg-gray-300 rounded-full cursor-pointer transition-colors duration-200"
                            style={{
                              backgroundColor: elementData.attributes['required'] !== 'true' ? '#3b82f6' : '#d1d5db'
                            }}
                          >
                            <div
                              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                              style={{
                                transform: elementData.attributes['required'] !== 'true' ? 'translateX(20px)' : 'translateX(0)'
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">��盘类型</Label>
                      <select
                        value={elementData.attributes['inputmode'] || 'text'}
                        onChange={(e) => handleAttributeChange('inputmode', e.target.value)}
                        className="w-full h-8 text-xs bg-white border border-gray-300 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">默认</option>
                        <option value="numeric">数字</option>
                        <option value="tel">电话</option>
                        <option value="email">���箱</option>
                        <option value="url">网址</option>
                      </select>
                    </div>
                  </div>

                  {/* 三系法 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">三系法</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={elementData.attributes['data-three-system'] === 'true'}
                        onChange={(e) => handleAttributeChange('data-three-system', e.target.checked ? 'true' : 'false')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        id="three-system"
                      />
                      <label htmlFor="three-system" className="text-xs text-gray-600">启用三系法</label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 模板生成器区域 */}
        {showTemplateGenerator && (
          <div className="border-t bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="p-4 border-b bg-white">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                模��生成��
              </h4>
            </div>
            <div className="p-4 space-y-4">
              {/* 选择模板 */}
              <div>
                <Label className="text-sm font-medium mb-2 block">选择模板</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- 请选择 --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero-section">Hero 区域</SelectItem>
                    <SelectItem value="feature-cards">功能卡片</SelectItem>
                    <SelectItem value="contact-form">联系表单</SelectItem>
                    <SelectItem value="pricing-table">价格表</SelectItem>
                    <SelectItem value="testimonial">客户评价</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 开始生成按钮 */}
              <Button
                onClick={handleTemplateGeneration}
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={!selectedTemplate}
              >
                开始生成
              </Button>

              {/* 模板��置选项 */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">输入框阴影</Label>
                  <Switch
                    checked={templateSettings.inputShadow}
                    onCheckedChange={(checked) =>
                      setTemplateSettings(prev => ({ ...prev, inputShadow: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">输��框跟随主题色</Label>
                  <Switch
                    checked={templateSettings.inputThemeColor}
                    onCheckedChange={(checked) =>
                      setTemplateSettings(prev => ({ ...prev, inputThemeColor: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">按钮点击时半透明</Label>
                  <Switch
                    checked={templateSettings.buttonTransparent}
                    onCheckedChange={(checked) =>
                      setTemplateSettings(prev => ({ ...prev, buttonTransparent: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOM树区域 */}
        <div className="border-t bg-gray-50">
          <div className="p-3 border-b bg-white">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                DOM 树
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={showAllElements}
                        onCheckedChange={(checked) => {
                          setShowAllElements(checked);
                          // 切换显示模式后重新构建DOM树
                          setTimeout(() => getDOMTreeFromIframe(), 100);
                        }}
                        className="scale-75"
                      />
                      <span className="text-xs text-gray-600" title={showAllElements ? "显示所有元��（包括不可操作的）" : "只显��可操作元���"}>
                        {showAllElements ? "全部" : "可操作"}
                      </span>
                    </div>
                </div>

                </div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('展开所有DOM节���');
                    const expandAllNodes = (nodes: DOMNode[]): DOMNode[] => {
                      return nodes.map(node => ({
                        ...node,
                        isExpanded: true,
                        children: expandAllNodes(node.children)
                      }));
                    };
                    setDomTree(prev => expandAllNodes(prev));
                  }}
                  className="h-6 px-2 text-xs"
                >
                  展开
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedElement) {
                      console.log('跳转到选中元���');
                      autoExpandToElement(selectedElement);
                    } else {
                      console.log('没有选中的元素');
                    }
                  }}
                  className="h-6 px-2 text-xs"
                  disabled={!selectedElement}
                  title="跳转到���前选中的元素"
                >
                  🎯
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('点击清除按钮');
                    clearSelection();
                  }}
                  className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600"
                  title="清除选中状态，恢复元素交互"
                >
                  🔓
                </Button>
                </div>
              </div>
            </div>
            {domTree.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                正在加载DOM结构... 点击"刷新"重���
              </p>
            )}
            {domTree.length > 0 && (
              <div className="text-xs mt-2 space-y-1">
                <p className="text-green-600">
                  ��加载 {domTree.length} 个������点
                </p>
                {!showAllElements && (
                  <p className="text-gray-500">
                    ✅ 已过滤不���操作元素
                  </p>
                )}
                {showAllElements && (
                  <p className="text-yellow-600">
                    ⚠️ 显示所有元��（包括不可操作的）
                  </p>
                )}
                <p className="text-green-500">
                  👁️ 预览模式：选中元素保持可交互
                </p>
              </div>
            )}
          </div>
          <ScrollArea className="h-64">
            <div className="p-2">
              {domTree.length > 0 ? (
                domTree.map(node => renderDOMNode(node))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs mb-2">DOM��为空</p>
                  <p className="text-xs text-gray-400 mb-3">
                    请确保已导入页面，然后点击"刷新"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('强�����������DOM树');
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

        {/* 右键菜�� */}
        {contextMenu.show && (
          <div
            className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
              onClick={() => {
                if (contextMenu.node) {
                  deleteElement(contextMenu.node.element);
                  closeContextMenu();
                }
              }}
            >
              🗑️ 删除元素
            </button>
            <button
              className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-600 text-sm flex items-center gap-2"
              onClick={() => {
                if (contextMenu.node) {
                  handleNodeSelect(contextMenu.node.element);
                  closeContextMenu();
                }
              }}
            >
              🎯 ��择��素
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
