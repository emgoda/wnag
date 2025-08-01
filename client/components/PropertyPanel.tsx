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
  const [localTextContent, setLocalTextContent] = useState(''); // 本��文本状态

  const [domTree, setDomTree] = useState<DOMNode[]>([]);
  const [selectedNodeElement, setSelectedNodeElement] = useState<HTMLElement | null>(null);

  // Template generation states
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>({
    inputShadow: false,
    inputThemeColor: false,
    buttonTransparent: false
  });

  // 右键菜单状态
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
  // 构建DOM树 - 只显示元素节点（Element），过滤文本节点、注释节点等
  const buildTree = (root: HTMLElement): DOMNode[] => {
    const res: DOMNode[] = [];
    root.childNodes.forEach((node) => {
      // 只处理元素节点 (nodeType === 1)，忽略文本节点(3)、注释节点(8)等
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        // 过滤掉script和style元素，只保留有意义的DOM元素
        const tagName = element.tagName.toLowerCase();
        if (tagName !== 'script' && tagName !== 'style') {
          res.push({
            element,
            tagName,
            id: element.id || undefined,
            className: (element.className && typeof element.className === 'string') ? element.className : undefined,
            children: buildTree(element), // 递归构建子元素树
            isExpanded: true // 默认展开所有节点
          });
        }
      }
    });
    return res;
  };

  // 兼容旧接口的单节点构建方法 - 只构建元素节点树
  const buildDOMTree = (element: HTMLElement, depth = 0): DOMNode => {
    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: (element.className && typeof element.className === 'string') ? element.className : undefined,
      children: buildTree(element), // 只包含子元素节点
      isExpanded: true
    };
  };

  // 获取iframe中的DOM树
  const getDOMTreeFromIframe = () => {
    console.log('开始查����iframe...');

    // 列出所有可能的iframe
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

    console.log('找到iframe:', editorIframe, '标题:', editorIframe.title);

    try {
      const doc = editorIframe.contentDocument || editorIframe.contentWindow?.document;

      if (!doc) {
        console.log('无法访问iframe文档');
        return;
      }

      const body = doc.body;
      const html = doc.documentElement;

      console.log('iframe详细��态:', {
        readyState: doc.readyState,
        bodyChildren: body?.children.length || 0,
        htmlChildren: html?.children.length || 0,
        bodyHTML: body?.innerHTML?.substring(0, 200) || 'empty',
        docTitle: doc.title,
        docURL: doc.URL,
        bodyTagName: body?.tagName,
        bodyHasContent: !!body?.innerHTML
      });

      // 检查是否有任何实际内容
      const hasRealContent = body?.innerHTML && body.innerHTML.trim().length > 0;

      // 尝试查找canvas-root容器，如果没有则使用body
      const canvasRoot = doc.querySelector('.canvas-root') as HTMLElement;
      const containerElement = canvasRoot || body;

      if (containerElement) {
        // 如果找到canvas-root，直接构建其子树；否��构建body树
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
          console.log('DOM树构建成功 - 标签:', tree.tagName, '子节点数:', tree.children.length);
        }

        // 强制展开body��点
        setTimeout(() => {
          setDomTree(prev => prev.map(node =>
            node.tagName === 'body'
              ? { ...node, isExpanded: true }
              : node
          ));
        }, 50);

        // 记录body为空的情况，但不无限重试
        if (body.children.length === 0) {
          console.log('body为空，但仍显示DOM��结构');
        }
      } else if (html && html.children.length > 0) {
        // 尝试从html根元素开始构建
        const tree = buildDOMTree(html);
        console.log('从HTML根元素构建DOM树，节点数:', tree.children.length);
        setDomTree([tree]);
      } else {
        console.log('iframe内容为空，body子元素数:', body?.children.length || 0);
        console.log('body innerHTML:', body?.innerHTML?.substring(0, 200) || 'empty');
        // 如���body为空，等待内容加��
        setTimeout(() => {
          getDOMTreeFromIframe();
        }, 1000);
      }
    } catch (error) {
      console.error('读取iframe内容时出错:', error);
    }
  };

  // 页面加载时和选中元素变化时更��DOM树
  useEffect(() => {
    console.log('PropertyPanel useEffect 触发');

    // 立即尝试获取DOM树
    getDOMTreeFromIframe();

    // 延���再次获取DOM树，确保内容已加载
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

        // 监听iframe内容文档的变化
        try {
          if (iframe.contentDocument) {
            iframe.contentDocument.addEventListener('DOMContentLoaded', handleContentChange);
          }
        } catch (e) {
          console.log('���法监听iframe内容文档:', e);
        }

        // 如果iframe已经加载完成，立即获取DOM树
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          console.log('iframe���完成加载，立即获取DOM树');
          handleLoad();
        }

        return () => {
          iframe.removeEventListener('load', handleLoad);
          try {
            if (iframe.contentDocument) {
              iframe.contentDocument.removeEventListener('DOMContentLoaded', handleContentChange);
            }
          } catch (e) {
            // 忽略清理错误
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

  // 监听页���内容变化，实时更新DOM树
  useEffect(() => {
    const updateDOMTree = () => {
      console.log('定期更新DOM树');
      getDOMTreeFromIframe();
    };

    // 监听自定义DOM树刷新事件
    const handleDOMTreeRefresh = () => {
      console.log('收到DOM树刷新事件');
      getDOMTreeFromIframe();
    };

    window.addEventListener('domTreeRefresh', handleDOMTreeRefresh);

    // 定期检查DOM树变化（每3秒检查一次）
    const interval = setInterval(updateDOMTree, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('domTreeRefresh', handleDOMTreeRefresh);
    };
  }, []);

  // 组件挂载时立即尝试加载DOM树
  useEffect(() => {
    console.log('PropertyPanel组件挂���，立即获取DOM树');
    // 多次尝试，确保能够获取到
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
      // 检查元素是否包含预��相关的内容或类名
      const elementHTML = selectedElement.outerHTML || '';
      const isPresetElement = elementHTML.includes('预设') ||
                              selectedElement.textContent?.includes('预设') ||
                              selectedElement.querySelector('[style*="���设"]') !== null;

      setShowTemplateGenerator(isPresetElement);
    } else {
      setShowTemplateGenerator(false);
    }
  }, [selectedElement]);

  // 更新元素数据
  useEffect(() => {
    if (selectedElement) {
      const computedStyles = window.getComputedStyle(selectedElement);
      const styles: { [key: string]: string } = {};
      
      // 获取常用样式���性
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

      // 获取文��内���，确保获������到正确的文本
      let textContent = '';

      // 尝试不同的方式获取文本内容
      if (selectedElement.textContent) {
        textContent = selectedElement.textContent.trim();
      } else if (selectedElement.innerText) {
        textContent = selectedElement.innerText.trim();
      } else if (selectedElement.innerHTML && !selectedElement.innerHTML.includes('<')) {
        textContent = selectedElement.innerHTML.trim();
      }

      console.log('获取元素文本内容:', {
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
      setLocalTextContent(textContent); // 同���本地文本状态
    } else {
      setElementData(null);
    }
  }, [selectedElement]);

  // 当选中元素变化时，同步本地文本状态
  useEffect(() => {
    if (elementData) {
      setLocalTextContent(elementData.textContent);
    } else {
      setLocalTextContent('');
    }
  }, [elementData]);

  // 当选中元素变化时，自动跳转到DOM树中对应的节点
  useEffect(() => {
    if (selectedElement && domTree.length > 0) {
      console.log('选中元素变化，自动跳转到DOM树节点:', selectedElement);
      autoExpandToElement(selectedElement);
    }
  }, [selectedElement, domTree]);

  // 更新元素属性
  const handleAttributeChange = (attribute: string, value: string) => {
    if (!selectedElement || !onElementUpdate) return;

    if (value) {
      selectedElement.setAttribute(attribute, value);
    } else {
      selectedElement.removeAttribute(attribute);
    }

    // 立���更新DOM中的对应元素
    const updateElementInDOM = () => {
      try {
        console.log('开始更新DOM，属性:', attribute, '值:', value);

        // 获取iframe文档
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;

        if (!iframeDoc) {
          console.log('无法获取iframe文档');
          return;
        }

        // 简���策略：直接更新最后一个相关元素（用户最新操作的）
        if (attribute === 'data-title') {
          const allLabels = iframeDoc.querySelectorAll('label');
          const lastLabel = allLabels[allLabels.length - 1];
          if (lastLabel) {
            lastLabel.textContent = value || '标题';
            lastLabel.setAttribute('data-title', value || '标���');
            console.log('已��新最后一个label为:', value);
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

    // ���时再��行一次确保更新成功
    setTimeout(updateElementInDOM, 100);

    onElementUpdate(selectedElement, attribute, value);

    // ��新本地状态
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

  // 更��文本内容
  const handleTextContentChange = (value: string) => {
    console.log('文本输入变化:', value);

    // 立即��新本地状态，确保输入响应
    setLocalTextContent(value);

    // 同时更����elementData状态
    setElementData(prev => prev ? { ...prev, textContent: value } : null);

    // 如果有选中的元素，尝试更新实际DOM
    if (selectedElement) {
      try {
        console.log('更新DOM元素文本:', selectedElement.tagName, value);
        selectedElement.textContent = value;

        // 通知父组件
        if (onElementUpdate) {
          onElementUpdate(selectedElement, 'textContent', value);
        }

      } catch (error) {
        console.error('DOM更新失败:', error);
      }
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

      // 更新页面���容
      updateParentContent();

      // 重新获取DOM树
      setTimeout(() => {
        getDOMTreeFromIframe();
      }, 100);

      console.log('元素复制���功');
    } catch (error) {
      console.error('复制元素失败:', error);
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

  // 编辑元素HTML
  const handleEditElementHTML = () => {
    if (!selectedElement) return;

    const html = selectedElement.outerHTML;
    const newHTML = prompt('编辑元素HTML:\n\n注意：请确��HTML格式正确', html);

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
        alert('HTML编��失败���请检查格式是否正确');
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

      // 选择父元素
      parent.classList.add('element-selected');

      // 通知父组件
      if (onElementUpdate) {
        // 这里我们通过触发一���特殊的更新来选择父元素
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

    selectedElement.remove();
    setElementData(null);
    updateParentContent();
    setTimeout(() => getDOMTreeFromIframe(), 100);
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

  // 处理模板生成
  const handleTemplateGeneration = () => {
    if (!selectedTemplate) {
      alert('请先选择一个模板');
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
            发现���限可能，创造美好未来
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

  // 生成功能卡片模板
  const generateFeatureCards = () => {
    const shadowStyle = templateSettings.inputShadow ? 'box-shadow: 0 4px 16px rgba(0,0,0,0.1);' : 'box-shadow: 0 2px 8px rgba(0,0,0,0.05);';

    return `
      <section style="padding: 50px 20px; max-width: 350px; margin: 0 auto; background: linear-gradient(145deg, #f8fafc, #ffffff); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);">
        <div style="max-width: 100%; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 26px; font-weight: 900; margin-bottom: 15px; color: #1f2937; background: linear-gradient(135deg, #1f2937, #374151); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px;">
            我们的特色
          </h2>
          <p style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 35px; font-weight: 500;">
            专业的服务，卓越��������验
          </p>
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 20px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">🚀</div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1f2937; letter-spacing: -0.3px;">快���部署</h3>
              <p style="color: #4b5563; line-height: 1.6; font-size: 13px; font-weight: 400;">一键��署，快速上线，让您的产品迅速到达用户</p>
            </div>
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">🛡️</div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1f2937; letter-spacing: -0.3px;">安全可靠</h3>
              <p style="color: #4b5563; line-height: 1.6; font-size: 13px; font-weight: 400;">企业级安全保����，全方位保�����的数����������</p>
            </div>
            <div style="background: linear-gradient(145deg, #ffffff, #f8fafc); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 20px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">⚡</div>
              <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1f2937; letter-spacing: -0.3px;">��性能</h3>
              <p style="color: #4b5563; line-height: 1.6; font-size: 13px; font-weight: 400;">��化的架构设计，提供极���的用户体验</p>
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
          联系我们
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
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">���箱</label>
            <input type="email" placeholder="请输入���的邮箱" style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 16px; font-size: 14px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(248, 250, 252, 0.6); backdrop-filter: blur(4px); box-sizing: border-box;" onfocus="this.style.borderColor='${themeColor}'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15)'; this.style.background='white'; this.style.transform='translateY(-1px)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='rgba(248, 250, 252, 0.6)'; this.style.transform='translateY(0)'">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">留言</label>
            <textarea placeholder="请输入您的留言..." style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 16px; font-size: 14px; min-height: 120px; resize: vertical; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(248, 250, 252, 0.6); backdrop-filter: blur(4px); box-sizing: border-box;" onfocus="this.style.borderColor='${themeColor}'; this.style.boxShadow='0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15)'; this.style.background='white'; this.style.transform='translateY(-1px)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; this.style.background='rgba(248, 250, 252, 0.6)'; this.style.transform='translateY(0)'"></textarea>
          </div>
          <button type="submit" style="width: 100%; background: linear-gradient(135deg, ${themeColor}, #1d4ed8); color: white; border: none; padding: 16px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); ${buttonOpacity} position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);" onmouseover="this.style.transform='translateY(-2px) scale(1.02)'; this.style.boxShadow='0 16px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'" onclick="alert('感谢您的留言！我们会尽���回复。');">
            发送留言
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
            选择适��的方����
          </h2>
          <p style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 30px;">
            灵活的定价，满足不同需求
          </p>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #e5e7eb; transition: all 0.3s; ${shadowStyle}" onmouseover="this.style.borderColor='${themeColor}'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'">
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">基础版</h3>
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
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 高级分析</li>
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
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 所有专业功能</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 无限存储空间</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 24/7 专属支持</li>
                <li style="margin-bottom: 8px; color: #4b5563; font-size: 13px;">✓ 定制集成</li>
              </ul>
              <button style="width: 100%; background: transparent; color: ${themeColor}; border: 2px solid ${themeColor}; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; ${buttonOpacity}" onmouseover="this.style.background='${themeColor}'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='${themeColor}'">
                选择企业版
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  // 生成客户评价模板
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
                "非常棒的产品��界面友好，功能强大，完全满足了我们的需求。客服响应也很及时。"
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
                "��队协作效率大大提升，数据分析功能特别实用���强烈推荐给其他企业！"
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
              <div style="color: #fbbf24; font-size: 18px; margin-bottom: 18px; filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));">⭐⭐⭐⭐⭐</div>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 18px; font-style: italic; font-size: 14px; font-weight: 400;">
                "部署��单，使用方便，性价比很高。技术支持团队专业且耐心，解���问题很及时。"
              </p>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);">��</div>
                <div>
                  <div style="font-weight: 700; color: #1f2937; font-size: 15px; letter-spacing: -0.2px;">���先生</div>
                  <div style="color: #6b7280; font-size: 12px; font-weight: 500; margin-top: 2px;">技术总监</div>
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

  // 自动展开到指定元素并滚动到该位置
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
      console.log('找到元素路径，自动展开:', elementPath.map(n => n.tagName));

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

      // 延时滚动到目标元素，确保DOM已更新
      setTimeout(() => {
        // 尝试通过元素内容查找对应的DOM树节点
        const allTreeNodes = document.querySelectorAll('.text-sm');
        for (const treeNode of allTreeNodes) {
          const nodeText = treeNode.textContent || '';
          if (nodeText.includes(`<${targetElement.tagName?.toLowerCase()}>`) &&
              (targetElement.id ? nodeText.includes(`#${targetElement.id}`) : true) &&
              (targetElement.className ? nodeText.includes(targetElement.className.split(' ')[0]) : true)) {
            treeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('已滚动到目标节点');
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
      // 确认删除操作
      if (!confirm(`确定要删除 <${elementToDelete.tagName.toLowerCase()}> 元素吗？`)) {
        return;
      }

      // 从iframe中删除元素
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        // 找到iframe中对应的元素并删除
        const iframeElement = iframe.contentDocument.querySelector(`[data-node-id="${elementToDelete.getAttribute('data-node-id')}"]`) || elementToDelete;
        if (iframeElement && iframeElement.parentNode) {
          iframeElement.parentNode.removeChild(iframeElement);
          console.log('已删除元素:', elementToDelete.tagName);

          // 如果删除的是当前选中的元素，清除选中状态
          if (selectedElement === elementToDelete) {
            setSelectedElement(null);
            setElementData(null);
          }

          // 刷新DOM树
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
      alert('删除元素失败，请重试');
    }
  };

  // 处理右键菜单
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

  // 选择DOM节点
  const handleNodeSelect = (element: HTMLElement) => {
    setSelectedNodeElement(element);

    // 清除之前的��亮
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

  // 添加���停效果
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
  const renderDOMNode = (node: DOMNode, depth = 0, index = 0) => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedElement === node.element;
    const paddingLeft = depth * 16;

    // 获��元素���文本内容预览（前20个字符）
    const textPreview = node.element.textContent?.trim().slice(0, 20);
    const hasText = textPreview && textPreview.length > 0;

    return (
      <div key={`${node.tagName}-d${depth}-i${index}-${node.id || ''}-${node.className?.replace(/\s+/g, '-') || 'no-class'}`} className="text-sm">
        <div
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded transition-all duration-200 ${
            isSelected ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm transform scale-[1.02]' : ''
          }`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => handleNodeSelect(node.element)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          onMouseEnter={() => handleNodeHover(node.element, true)}
          onMouseLeave={() => handleNodeHover(node.element, false)}
          title={`${node.tagName}${node.id ? `#${node.id}` : ''}\n右键删除元素`}
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

          {node.className && typeof node.className === 'string' && (
            <span className="text-purple-600 text-xs">.{node.className.split(' ')[0]}</span>
          )}

          {/* 显示元素组信息 */}
          {node.element.getAttribute('data-element-group') && (
            <span className="text-orange-600 text-xs bg-orange-100 px-1 rounded">
              组:{node.element.getAttribute('data-element-group')}
            </span>
          )}

          {/* 显示元素类型信息 */}
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
                    console.log('手动刷新DOM树（无���中状态）');
                    getDOMTreeFromIframe();
                  }}
                  className="h-6 px-2 text-xs"
                >
                  刷新
                </Button>
              </div>
              {domTree.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  ��在加载DOM结构... 点击"���新"重���
                </p>
              )}
            </div>
            <ScrollArea className="h-64">
              <div className="p-2">
                {domTree.length > 0 ? (
                  domTree.map((node, index) => renderDOMNode(node, 0, index))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">DOM树为空</p>
                    <p className="text-xs text-gray-400">
                      请导入��面或点击"刷新"
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
                  ��辑HTML
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

      {/* ������区域 */}
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
                  本地����: "{localTextContent}" (长度: {localTextContent.length})
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

                    // 立即更新elementData
                    setElementData(prev => prev ? { ...prev, textContent: newValue } : null);

                    // 更新DOM元素
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
                    setElementData(prev => prev ? { ...prev, textContent: newValue } : null);
                    if (selectedElement) {
                      selectedElement.textContent = newValue;
                    }
                  }}
                  placeholder="多行文���输入..."
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
                        <SelectItem value="_parent">父窗��</SelectItem>
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
                      <Label className="text-xs">内边��</Label>
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
                <Label className="text-sm font-medium">�����ID</Label>
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
                  {/* 标题和数据ID */}
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

                  {/* 提示 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">提示</Label>
                    <Input
                      value={elementData.attributes['placeholder'] || ''}
                      onChange={(e) => handleAttributeChange('placeholder', e.target.value)}
                      placeholder=""
                      className="h-8 text-xs bg-white border-gray-300"
                    />
                  </div>

                  {/* 输入格式 */}
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
                        <option value="text">���认</option>
                        <option value="numeric">数字</option>
                        <option value="tel">电话</option>
                        <option value="email">邮箱</option>
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
                模板生成��
              </h4>
            </div>
            <div className="p-4 space-y-4">
              {/* 选择模板 */}
              <div>
                <Label className="text-sm font-medium mb-2 block">选择模���</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- 请��择 --" />
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
                  <Label className="text-sm text-gray-700">输入框阴���</Label>
                  <Switch
                    checked={templateSettings.inputShadow}
                    onCheckedChange={(checked) =>
                      setTemplateSettings(prev => ({ ...prev, inputShadow: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">输入框跟随主题色</Label>
                  <Switch
                    checked={templateSettings.inputThemeColor}
                    onCheckedChange={(checked) =>
                      setTemplateSettings(prev => ({ ...prev, inputThemeColor: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-700">按钮点击���半透明</Label>
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
                    console.log('展开所有DOM节点');
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
                      console.log('��转到选中元素');
                      autoExpandToElement(selectedElement);
                    } else {
                      console.log('没有选中的元素');
                    }
                  }}
                  className="h-6 px-2 text-xs"
                  disabled={!selectedElement}
                  title="跳转到当前选中的元素"
                >
                  🎯
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
                  <p className="text-xs mb-2">DOM��为空</p>
                  <p className="text-xs text-gray-400 mb-3">
                    请确保已导入页面，然后点击"刷新"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('强��������DOM树');
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
