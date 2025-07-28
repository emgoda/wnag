import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Type,
  Image,
  Square,
  MousePointer,
  Code,
  Eye,
  Save,
  Download,
  Trash2,
  Copy,
  Settings,
  Globe,
  Link,
  Upload,
  FileText
} from 'lucide-react';

// 定义拖拽项目类型
const ItemTypes = {
  COMPONENT: 'component',
  ELEMENT: 'element'
};

// 组件库
const componentLibrary = [
  { id: 'text', type: 'text', label: '文本', icon: Type, defaultProps: { content: '���输入文本', style: {} } },
  { id: 'button', type: 'button', label: '按钮', icon: MousePointer, defaultProps: { content: '点击按钮', style: {} } },
  { id: 'image', type: 'image', label: '图片', icon: Image, defaultProps: { src: 'https://via.placeholder.com/300x200', alt: '图片', style: {} } },
  { id: 'container', type: 'container', label: '容器', icon: Square, defaultProps: { style: { padding: '20px', border: '1px dashed #ccc' } } },
];

// 拖拽组件项
function DraggableComponent({ component }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { component },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const Icon = component.icon;

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move bg-white hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon size={24} className="text-gray-600" />
        <span className="text-sm font-medium">{component.label}</span>
      </div>
    </div>
  );
}

// 画布元素
function CanvasElement({ element, onSelect, onDelete, isSelected }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ELEMENT,
    item: { id: element.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  const renderElement = () => {
    const style = {
      ...element.style,
      position: 'relative',
      minHeight: element.type === 'container' ? '50px' : 'auto',
    };

    switch (element.type) {
      case 'text':
        return (
          <div style={style} className="text-element">
            {element.content || '文本内容'}
          </div>
        );
      case 'button':
        return (
          <button style={style} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {element.content || '按钮'}
          </button>
        );
      case 'image':
        return (
          <img 
            src={element.src || 'https://via.placeholder.com/300x200'} 
            alt={element.alt || '图片'} 
            style={style}
            className="max-w-full h-auto"
          />
        );
      case 'container':
        return (
          <div style={style} className="container-element">
            {element.children?.map(child => (
              <CanvasElement 
                key={child.id} 
                element={child} 
                onSelect={onSelect} 
                onDelete={onDelete}
                isSelected={false}
              />
            )) || <div className="text-gray-400 text-center py-4">拖拽组件到这里</div>}
          </div>
        );
      default:
        return <div style={style}>未知组件</div>;
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`canvas-element ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ position: 'relative' }}
    >
      {renderElement()}
      {isSelected && (
        <div className="absolute top-0 right-0 flex gap-1 bg-blue-500 rounded-bl px-2 py-1">
          <button
            onClick={handleDelete}
            className="text-white hover:text-red-200 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// 画布组件
function Canvas({ elements, onDrop, onSelectElement, selectedElement, onDeleteElement }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.ELEMENT],
    drop: (item, monitor) => {
      if (monitor.getItemType() === ItemTypes.COMPONENT) {
        onDrop(item.component);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex-1 bg-white border-2 border-dashed rounded-lg p-4 min-h-[600px] transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
      onClick={() => onSelectElement(null)}
    >
      <div className="space-y-4">
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            onSelect={onSelectElement}
            onDelete={onDeleteElement}
            isSelected={selectedElement?.id === element.id}
          />
        ))}
        {elements.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <Square size={48} className="mx-auto mb-4 opacity-50" />
            <p>拖拽左侧组件到这里开始设计</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 属性编辑器
function PropertyEditor({ selectedElement, onUpdateElement }) {
  if (!selectedElement) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Settings size={48} className="mx-auto mb-4 opacity-50" />
        <p>选择一个元素来编辑属性</p>
      </div>
    );
  }

  const handleContentChange = (e) => {
    onUpdateElement({
      ...selectedElement,
      content: e.target.value
    });
  };

  const handleStyleChange = (property, value) => {
    onUpdateElement({
      ...selectedElement,
      style: {
        ...selectedElement.style,
        [property]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">元素类型</h3>
        <Badge variant="outline">{selectedElement.type}</Badge>
      </div>

      {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
        <div>
          <label className="text-sm font-medium block mb-2">内容</label>
          <input
            type="text"
            value={selectedElement.content || ''}
            onChange={handleContentChange}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="输入内容"
          />
        </div>
      )}

      {selectedElement.type === 'image' && (
        <div>
          <label className="text-sm font-medium block mb-2">图片地址</label>
          <input
            type="text"
            value={selectedElement.src || ''}
            onChange={(e) => onUpdateElement({ ...selectedElement, src: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="输入图片URL"
          />
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium mb-2">样式设置</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">宽度</label>
              <input
                type="text"
                value={selectedElement.style?.width || ''}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                className="w-full px-2 py-1 border rounded text-xs"
                placeholder="auto"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">高度</label>
              <input
                type="text"
                value={selectedElement.style?.height || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                className="w-full px-2 py-1 border rounded text-xs"
                placeholder="auto"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">背景色</label>
              <input
                type="color"
                value={selectedElement.style?.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full h-8 border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">文字色</label>
              <input
                type="color"
                value={selectedElement.style?.color || '#000000'}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full h-8 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">内边距</label>
            <input
              type="text"
              value={selectedElement.style?.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder="0px"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">外边距</label>
            <input
              type="text"
              value={selectedElement.style?.margin || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              className="w-full px-2 py-1 border rounded text-xs"
              placeholder="0px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 代码编辑器
function CodeEditor({ css, js, onCssChange, onJsChange }) {
  return (
    <Tabs defaultValue="css" className="h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="js">JavaScript</TabsTrigger>
      </TabsList>
      <TabsContent value="css" className="mt-4 h-full">
        <textarea
          value={css}
          onChange={(e) => onCssChange(e.target.value)}
          className="w-full h-[400px] p-3 border rounded-md font-mono text-sm resize-none"
          placeholder="/* 在这里编写CSS样式 */&#10;.text-element {&#10;  font-size: 16px;&#10;  font-family: sans-serif;&#10;}"
        />
      </TabsContent>
      <TabsContent value="js" className="mt-4 h-full">
        <textarea
          value={js}
          onChange={(e) => onJsChange(e.target.value)}
          className="w-full h-[400px] p-3 border rounded-md font-mono text-sm resize-none"
          placeholder="// 在这里编写JavaScript代码&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('���面加载完成');&#10;});"
        />
      </TabsContent>
    </Tabs>
  );
}

export function WebEditor() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [elementIdCounter, setElementIdCounter] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSites, setPublishedSites] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importHtml, setImportHtml] = useState('');
  const [importMode, setImportMode] = useState('html'); // 'html', 'project', 'published'
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'mobile', 'tablet', 'desktop'

  const handleDrop = useCallback((component) => {
    const newElement = {
      id: `element_${elementIdCounter}`,
      type: component.type,
      ...component.defaultProps,
    };
    setElements(prev => [...prev, newElement]);
    setElementIdCounter(prev => prev + 1);
  }, [elementIdCounter]);

  const handleSelectElement = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  const handleUpdateElement = useCallback((updatedElement) => {
    const updateElementRecursively = (elements) => {
      return elements.map(el => {
        if (el.id === updatedElement.id) {
          return updatedElement;
        }
        if (el.children) {
          return {
            ...el,
            children: updateElementRecursively(el.children)
          };
        }
        return el;
      });
    };

    setElements(prev => updateElementRecursively(prev));
    setSelectedElement(updatedElement);
  }, []);

  const handleDeleteElement = useCallback((elementId) => {
    const deleteElementRecursively = (elements) => {
      return elements.reduce((acc, el) => {
        if (el.id === elementId) {
          return acc; // 跳过要删除的元素
        }
        if (el.children) {
          return [...acc, {
            ...el,
            children: deleteElementRecursively(el.children)
          }];
        }
        return [...acc, el];
      }, []);
    };

    setElements(prev => deleteElementRecursively(prev));
    setSelectedElement(null);
  }, []);

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleSave = () => {
    const projectData = {
      elements,
      css,
      js,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('webeditor_project', JSON.stringify(projectData));
    alert('项���已保存到本地存储');
  };

  const handleExport = () => {
    const html = generateHTML(elements, css, js);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webpage.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!siteName.trim()) {
      alert('请输入网站名称');
      return;
    }

    setIsPublishing(true);
    try {
      const html = generateHTML(elements, css, js);
      const siteId = `site_${Date.now()}`;
      const publishUrl = `${window.location.origin}/published/${siteId}`;

      // 模拟发布过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 保存到��地存储（实际应用中会发送到后端）
      const newSite = {
        id: siteId,
        name: siteName,
        url: publishUrl,
        html: html,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
      sites.push(newSite);
      localStorage.setItem('published_sites', JSON.stringify(sites));

      setPublishedSites(sites);

      // 添加到后台监控系统
      const monitoringData = {
        id: siteId,
        status: "submitted",
        statusText: "已发布",
        submissionType: "personal_info",
        websiteName: siteName,
        currentPage: "/",
        userName: "访客用户",
        userLocation: "未知",
        timestamp: new Date().toLocaleString(),
        riskLevel: "low",
        dataSize: `${Math.round(html.length / 1024)}Kb`,
        fieldsCount: elements.length,
        ipAddress: "127.0.0.1",
        isOffline: false,
        submitCount: 0,
        submitHistory: []
      };

      // 这里可以发送到监控系统
      console.log('网站已发布到监控系统:', monitoringData);

      alert(`网站发布成功！\n访问链接: ${publishUrl}`);
      setSiteName('');
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  // HTML导入功能
  const parseHTMLToElements = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const elements = [];
    let idCounter = elementIdCounter;

    // 解析CSS
    const styleElements = doc.querySelectorAll('style');
    let extractedCSS = '';
    styleElements.forEach(style => {
      extractedCSS += style.innerHTML + '\n';
    });
    if (extractedCSS) {
      setCss(prev => (prev + '\n' + extractedCSS).trim());
    }

    // 解析JavaScript
    const scriptElements = doc.querySelectorAll('script');
    let extractedJS = '';
    scriptElements.forEach(script => {
      if (script.innerHTML && !script.src) {
        extractedJS += script.innerHTML + '\n';
      }
    });
    if (extractedJS) {
      setJs(prev => (prev + '\n' + extractedJS).trim());
    }

    // 解析body中的元素
    const bodyElements = doc.body ? doc.body.children : doc.children;

    const parseElement = (element, isNested = false) => {
      const tagName = element.tagName.toLowerCase();
      const computedStyle = {};

      // 获取内联样式
      if (element.style.cssText) {
        const styleDeclarations = element.style.cssText.split(';');
        styleDeclarations.forEach(decl => {
          if (decl.trim()) {
            const [property, value] = decl.split(':');
            if (property && value) {
              computedStyle[property.trim()] = value.trim();
            }
          }
        });
      }

      let elementData = {
        id: `imported_${idCounter++}`,
        style: computedStyle,
        className: element.className || '',
        attributes: {}
      };

      // 保存重要属性
      if (element.id) elementData.attributes.htmlId = element.id;
      if (element.title) elementData.attributes.title = element.title;

      // 根据HTML标签��型转换为编辑器元素
      switch (tagName) {
        case 'div':
        case 'section':
        case 'article':
        case 'main':
        case 'header':
        case 'footer':
        case 'nav':
          elementData.type = 'container';
          elementData.content = element.innerText || '';
          break;
        case 'p':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        case 'span':
        case 'strong':
        case 'em':
        case 'small':
          elementData.type = 'text';
          elementData.content = element.innerText || '';

          // 设置默认标题样式
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            const headingSizes = { h1: '2em', h2: '1.5em', h3: '1.17em', h4: '1em', h5: '0.83em', h6: '0.67em' };
            if (!elementData.style.fontSize) {
              elementData.style.fontSize = headingSizes[tagName];
              elementData.style.fontWeight = 'bold';
            }
          }

          if (tagName === 'strong') elementData.style.fontWeight = 'bold';
          if (tagName === 'em') elementData.style.fontStyle = 'italic';
          if (tagName === 'small') elementData.style.fontSize = '0.8em';
          break;
        case 'button':
        case 'a':
          elementData.type = 'button';
          elementData.content = element.innerText || '';
          break;
        case 'img':
          elementData.type = 'image';
          elementData.src = element.src || element.getAttribute('data-src') || '';
          elementData.alt = element.alt || '';
          if (element.width) elementData.style.width = element.width + 'px';
          if (element.height) elementData.style.height = element.height + 'px';
          break;
        default:
          // 其他元素���换为文本
          elementData.type = 'text';
          elementData.content = element.innerText || tagName;
      }

      return elementData;
    };

    Array.from(bodyElements).forEach(element => {
      if (element.tagName && !['SCRIPT', 'STYLE'].includes(element.tagName)) {
        const parsed = parseElement(element);
        elements.push(parsed);
      }
    });

    setElementIdCounter(idCounter);
    return elements;
  };

  const handleImportHTML = () => {
    if (!importHtml.trim()) {
      alert('请输入HTML代码');
      return;
    }

    try {
      // 检测是否是本系统生成的网站
      const isSystemGenerated = importHtml.includes('生成的网页') ||
                               importHtml.includes('网页编辑器') ||
                               importHtml.includes('<!-- Generated by WebEditor -->');

      // 智能导入模式选择
      if (isSystemGenerated) {
        // 检查是否替换当前内容
        const confirmReplace = elements.length === 0 ||
          window.confirm('检测到这是本系统生成的网站，导入将替换当前所有内容，是否继续？');

        if (confirmReplace) {
          const parsedElements = parseHTMLToElements(importHtml);
          setElements(parsedElements); // 替换而不是添加
          setShowImportDialog(false);
          setImportHtml('');
          alert(`成功导入系统网站，共 ${parsedElements.length} 个元素`);
        }
      } else {
        // 外部HTML，添加到现有内容
        const parsedElements = parseHTMLToElements(importHtml);
        setElements(prev => [...prev, ...parsedElements]);
        setShowImportDialog(false);
        setImportHtml('');
        alert(`成功导入外部HTML，新增 ${parsedElements.length} 个元素`);
      }
    } catch (error) {
      console.error('HTML解析失败:', error);
      alert('HTML解析失败，请检查代码格式');
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;

      if (importMode === 'project') {
        // 尝试解析为项目文件 (JSON)
        try {
          const projectData = JSON.parse(content);
          handleImportProject(projectData);
        } catch (error) {
          alert('项目文件格式错误，请选择有效的项目文件');
        }
      } else {
        // HTML导入
        if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          setImportHtml(content);
        } else {
          alert('请选择HTML文件');
        }
      }
    };
    reader.readAsText(file);
  };

  // 导入完整项目
  const handleImportProject = (projectData) => {
    try {
      if (projectData.elements && Array.isArray(projectData.elements)) {
        // 确认是否覆盖当前项目
        const confirmOverwrite = elements.length === 0 ||
          window.confirm('导入项目将替换当前内容，是否继续？');

        if (confirmOverwrite) {
          setElements(projectData.elements);
          setCss(projectData.css || '');
          setJs(projectData.js || '');

          // 更新ID计数器
          const maxId = Math.max(
            ...projectData.elements.map(el => {
              const match = el.id.match(/\d+$/);
              return match ? parseInt(match[0]) : 0;
            }),
            elementIdCounter
          );
          setElementIdCounter(maxId + 1);

          setShowImportDialog(false);
          alert('项目导入成功！');
        }
      } else {
        alert('项目文件格式不正确');
      }
    } catch (error) {
      console.error('项目导入失败:', error);
      alert('项目导入失败，请检查文件格式');
    }
  };

  // 从已发布网站导入
  const handleImportFromPublished = (siteId) => {
    const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
    const site = sites.find(s => s.id === siteId);

    if (site) {
      const confirmImport = elements.length === 0 ||
        window.confirm('导入网站将替换当前内容，是否继续？');

      if (confirmImport) {
        // 解析HTML重新构建项目
        try {
          const parsedElements = parseHTMLToElements(site.html);
          setElements(parsedElements);
          setShowImportDialog(false);
          alert(`成功导入网站：${site.name}`);
        } catch (error) {
          console.error('网站导入失败:', error);
          alert('网站导入失败，请重试');
        }
      }
    }
  };

  // ���出完整项目
  const handleExportProject = () => {
    const projectData = {
      version: '1.0',
      name: siteName || '未命名项目',
      elements,
      css,
      js,
      timestamp: new Date().toISOString(),
      metadata: {
        elementsCount: elements.length,
        createdWith: 'WebEditor v1.0'
      }
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName || 'project'}.webproject`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 新建项目
  const handleNewProject = () => {
    const confirmNew = elements.length === 0 ||
      window.confirm('新建项目将清除当前所有内容，是否继续？');

    if (confirmNew) {
      setElements([]);
      setCss('');
      setJs('');
      setSiteName('');
      setSelectedElement(null);
      localStorage.removeItem('webeditor_last_project');
      alert('已创建新项目');
    }
  };

  // 加载已发布的网站和自动保存项目
  useEffect(() => {
    const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
    setPublishedSites(sites);

    // 直接加载演示项目数据
    if (elements.length === 0) {
      const demoProjectData = {
        "version": "1.0",
        "name": "个人作品集网站",
        "elements": [
          {
            "id": "element_1",
            "type": "container",
            "content": "",
            "style": {
              "backgroundColor": "#1a1a2e",
              "padding": "60px 20px",
              "textAlign": "center",
              "minHeight": "100vh",
              "background": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
            },
            "className": "hero-section",
            "attributes": {
              "htmlId": "hero"
            },
            "children": [
              {
                "id": "element_2",
                "type": "text",
                "content": "张明",
                "style": {
                  "fontSize": "4em",
                  "fontWeight": "bold",
                  "color": "#ffffff",
                  "marginBottom": "10px",
                  "textShadow": "2px 2px 4px rgba(0,0,0,0.5)"
                },
                "className": "hero-title",
                "attributes": {}
              },
              {
                "id": "element_3",
                "type": "text",
                "content": "全栈开发工程师",
                "style": {
                  "fontSize": "1.5em",
                  "color": "#64b5f6",
                  "marginBottom": "20px",
                  "fontWeight": "300"
                },
                "className": "hero-subtitle",
                "attributes": {}
              },
              {
                "id": "element_4",
                "type": "text",
                "content": "专注于创建现代化的Web应用程序，拥有丰富的前端和后端开发经验",
                "style": {
                  "fontSize": "1.1em",
                  "color": "#e0e0e0",
                  "maxWidth": "600px",
                  "margin": "0 auto 40px auto",
                  "lineHeight": "1.6"
                },
                "className": "hero-description",
                "attributes": {}
              },
              {
                "id": "element_5",
                "type": "button",
                "content": "查看我的作品",
                "style": {
                  "backgroundColor": "#2196f3",
                  "color": "white",
                  "padding": "15px 30px",
                  "fontSize": "1.1em",
                  "border": "none",
                  "borderRadius": "50px",
                  "cursor": "pointer",
                  "transition": "all 0.3s ease",
                  "boxShadow": "0 4px 15px rgba(33, 150, 243, 0.3)"
                },
                "className": "cta-button",
                "attributes": {}
              }
            ]
          },
          {
            "id": "element_6",
            "type": "container",
            "content": "",
            "style": {
              "backgroundColor": "#f8f9fa",
              "padding": "80px 20px",
              "textAlign": "center"
            },
            "className": "about-section",
            "attributes": {
              "htmlId": "about"
            },
            "children": [
              {
                "id": "element_7",
                "type": "text",
                "content": "关于我",
                "style": {
                  "fontSize": "2.5em",
                  "fontWeight": "bold",
                  "color": "#333",
                  "marginBottom": "30px"
                },
                "className": "section-title",
                "attributes": {}
              },
              {
                "id": "element_8",
                "type": "text",
                "content": "我是一名充满激情的全栈开发工程师，专注于使用现代技术栈构建高质量的Web应用程序。拥有5年以上的开发经验，熟练掌握React、Node.js、Python等技术。",
                "style": {
                  "fontSize": "1.1em",
                  "color": "#666",
                  "maxWidth": "800px",
                  "margin": "0 auto 40px auto",
                  "lineHeight": "1.8"
                },
                "className": "about-text",
                "attributes": {}
              },
              {
                "id": "element_9",
                "type": "container",
                "content": "",
                "style": {
                  "display": "flex",
                  "justifyContent": "center",
                  "gap": "40px",
                  "flexWrap": "wrap",
                  "marginTop": "50px"
                },
                "className": "skills-container",
                "attributes": {},
                "children": [
                  {
                    "id": "element_10",
                    "type": "container",
                    "content": "",
                    "style": {
                      "backgroundColor": "white",
                      "padding": "30px",
                      "borderRadius": "15px",
                      "boxShadow": "0 5px 15px rgba(0,0,0,0.1)",
                      "textAlign": "center",
                      "minWidth": "200px"
                    },
                    "className": "skill-card",
                    "attributes": {},
                    "children": [
                      {
                        "id": "element_11",
                        "type": "text",
                        "content": "前端开发",
                        "style": {
                          "fontSize": "1.3em",
                          "fontWeight": "bold",
                          "color": "#2196f3",
                          "marginBottom": "15px"
                        },
                        "className": "skill-title",
                        "attributes": {}
                      },
                      {
                        "id": "element_12",
                        "type": "text",
                        "content": "React, Vue.js, TypeScript, HTML5, CSS3",
                        "style": {
                          "color": "#666",
                          "fontSize": "0.95em",
                          "lineHeight": "1.5"
                        },
                        "className": "skill-description",
                        "attributes": {}
                      }
                    ]
                  },
                  {
                    "id": "element_13",
                    "type": "container",
                    "content": "",
                    "style": {
                      "backgroundColor": "white",
                      "padding": "30px",
                      "borderRadius": "15px",
                      "boxShadow": "0 5px 15px rgba(0,0,0,0.1)",
                      "textAlign": "center",
                      "minWidth": "200px"
                    },
                    "className": "skill-card",
                    "attributes": {},
                    "children": [
                      {
                        "id": "element_14",
                        "type": "text",
                        "content": "后端开发",
                        "style": {
                          "fontSize": "1.3em",
                          "fontWeight": "bold",
                          "color": "#4caf50",
                          "marginBottom": "15px"
                        },
                        "className": "skill-title",
                        "attributes": {}
                      },
                      {
                        "id": "element_15",
                        "type": "text",
                        "content": "Node.js, Python, Express, MongoDB, PostgreSQL",
                        "style": {
                          "color": "#666",
                          "fontSize": "0.95em",
                          "lineHeight": "1.5"
                        },
                        "className": "skill-description",
                        "attributes": {}
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        "css": `/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title, .hero-subtitle, .hero-description {
  animation: fadeInUp 1s ease-out;
}

.hero-subtitle {
  animation-delay: 0.2s;
}

.hero-description {
  animation-delay: 0.4s;
}

.cta-button {
  animation: fadeInUp 1s ease-out 0.6s both;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

/* 技能卡片悬停效果 */
.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5em;
  }

  .section-title {
    font-size: 2em;
  }

  .skills-container {
    flex-direction: column;
    align-items: center;
  }
}

/* 滚动���为 */
html {
  scroll-behavior: smooth;
}

/* 选择文本颜色 */
::selection {
  background-color: #2196f3;
  color: white;
}`,
        "js": `// 页面加载动画
document.addEventListener('DOMContentLoaded', function() {
  console.log('个人作品集网站加载完成');

  // 添加平滑滚动到CTA按钮
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  }

  // 技能卡片动画
  const skillCards = document.querySelectorAll('.skill-card');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out';
      }
    });
  }, observerOptions);

  skillCards.forEach(card => {
    observer.observe(card);
  });
});`
      };

      setElements(demoProjectData.elements);
      setCss(demoProjectData.css);
      setJs(demoProjectData.js);
      setSiteName(demoProjectData.name);
      setElementIdCounter(16);

      console.log('演示项目已加载:', demoProjectData.name);
    }
  }, []);

  // 自动保存��前项目
  useEffect(() => {
    if (elements.length > 0) {
      const autoSaveData = {
        name: siteName,
        elements,
        css,
        js,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('webeditor_last_project', JSON.stringify(autoSaveData));
    }
  }, [elements, css, js, siteName]);

  const generateHTML = (elements, css, js) => {
    const elementsHTML = elements.map(el => {
      const styleStr = Object.entries(el.style || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      switch (el.type) {
        case 'text':
          return `<div style="${styleStr}">${el.content || '文本内容'}</div>`;
        case 'button':
          return `<button style="${styleStr}">${el.content || '按钮'}</button>`;
        case 'image':
          return `<img src="${el.src}" alt="${el.alt}" style="${styleStr}" />`;
        case 'container':
          return `<div style="${styleStr}">容器内容</div>`;
        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<!-- Generated by WebEditor v1.0 -->
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="WebEditor">
    <title>${siteName || '生成的网页'}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    ${elementsHTML}
    <script>
        ${js}
    </script>
</body>
</html>`;
  };

  if (previewMode) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">预览模式</h2>
          <Button onClick={handlePreview} variant="outline">
            <Code className="w-4 h-4 mr-2" />
            返回编辑
          </Button>
        </div>
        <div className="flex-1 bg-gray-100 p-4">
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: generateHTML(elements, css, js) }}
          />
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">网页编辑器</h2>
            <Badge variant="outline">拖拽式编辑器</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNewProject} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              新建
            </Button>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="输入网站名称"
              className="px-3 py-1 border rounded text-sm w-40"
            />
            <Button onClick={handlePreview} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              预览
            </Button>
            <Button onClick={handleSave} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
            <Button onClick={() => setShowImportDialog(true)} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              高级导入
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出HTML
            </Button>
            <Button onClick={handleExportProject} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              导出项目
            </Button>
            <Button
              onClick={handlePublish}
              variant="default"
              size="sm"
              disabled={isPublishing || !siteName.trim()}
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  发布中...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  发布到后台
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 主要编辑区域 */}
        <div className="flex-1 flex">
          {/* 左侧：组件库和网站管理 */}
          <div className="w-64 bg-white border-r p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-4">组件库</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {componentLibrary.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
            </div>

            {/* 已发布网站管理 */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                已发布网站
              </h3>
              {publishedSites.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">暂无发布的网站</p>
              ) : (
                <div className="space-y-2">
                  {publishedSites.slice(-5).map((site) => (
                    <div key={site.id} className="p-2 border rounded text-xs">
                      <div className="font-medium truncate">{site.name}</div>
                      <div className="text-gray-500 mb-2">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(site.url, '_blank')}
                          className="flex-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                        >
                          <Link className="w-3 h-3" />
                          访问
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(site.url);
                            alert('链接已复制');
                          }}
                          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 中间：画布 */}
          <div className="flex-1 p-4">
            <Canvas
              elements={elements}
              onDrop={handleDrop}
              onSelectElement={handleSelectElement}
              selectedElement={selectedElement}
              onDeleteElement={handleDeleteElement}
            />
          </div>

          {/* 右侧：属性编辑器和代码编辑器 */}
          <div className="w-80 bg-white border-l">
            <Tabs defaultValue="properties" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">属性</TabsTrigger>
                <TabsTrigger value="code">代码</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="p-4">
                <PropertyEditor
                  selectedElement={selectedElement}
                  onUpdateElement={handleUpdateElement}
                />
              </TabsContent>
              <TabsContent value="code" className="p-4">
                <CodeEditor
                  css={css}
                  js={js}
                  onCssChange={setCss}
                  onJsChange={setJs}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 高级导入对话框 */}
        {showImportDialog && (
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent className="max-w-5xl max-h-[85vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  高级导入功能
                </DialogTitle>
              </DialogHeader>

              <Tabs value={importMode} onValueChange={setImportMode} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="html">HTML代码</TabsTrigger>
                  <TabsTrigger value="project">完整项目</TabsTrigger>
                  <TabsTrigger value="published">已发布网站</TabsTrigger>
                </TabsList>

                {/* HTML导入 */}
                <TabsContent value="html" className="space-y-4 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        选择HTML文件
                      </label>
                      <input
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileImport}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                    <div className="text-sm text-gray-500 px-4">或</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      直接粘贴HTML代码
                    </label>
                    <textarea
                      value={importHtml}
                      onChange={(e) => setImportHtml(e.target.value)}
                      className="w-full h-48 p-3 border rounded-md font-mono text-sm resize-none"
                      placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <title>My Page</title>&#10;</head>&#10;<body>&#10;  <h1>Hello World</h1>&#10;  <p>This is a paragraph.</p>&#10;</body>&#10;</html>"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">HTML��入说明：</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• 支持导入HTML、CSS和JavaScript代码</li>
                      <li>• 自动解析常见HTML标签并转换为可编辑组件</li>
                      <li>• 内联样式会被保留并应用到元素</li>
                      <li>• CSS和JS代码会被提取到对应编辑器</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportDialog(false);
                        setImportHtml('');
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleImportHTML}
                      disabled={!importHtml.trim()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      导入HTML
                    </Button>
                  </div>
                </TabsContent>

                {/* 项目导入 */}
                <TabsContent value="project" className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      选择项目文件 (.webproject)
                    </label>
                    <input
                      type="file"
                      accept=".webproject,.json"
                      onChange={handleFileImport}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-1">项目导入说明：</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• 导入完整的项目文件，包含所有���件、样式和脚本</li>
                      <li>• 支持导入通过"导出项目"功能生成的 .webproject 文件</li>
                      <li>• 会完整还原项目的所有设置和元��属性</li>
                      <li>• 导入会替换当前项目的所有内容</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportDialog(false);
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </TabsContent>

                {/* 已发布网站导入 */}
                <TabsContent value="published" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">选择要导入的已发布网站：</h3>
                    {publishedSites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暂无已发布的网站</p>
                        <p className="text-xs mt-1">先发布一些网站后再使用此功能</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                        {publishedSites.map((site) => (
                          <div key={site.id} className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{site.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  发布时间: {new Date(site.createdAt).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  状态: <span className="text-green-600">已发布</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(site.url, '_blank')}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  预览
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleImportFromPublished(site.id)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  导入
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-purple-800 mb-1">已发布网站导入说明：</h4>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• 导入之前发布的网站，重新编辑和修改</li>
                      <li>• 会解析网站HTML并重建为可编辑的组件</li>
                      <li>• 支持导入本系统生成的所有网站</li>
                      <li>• 导入会替换当前项目的所有内容</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportDialog(false);
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DndProvider>
  );
}
