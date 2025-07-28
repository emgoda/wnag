import React, { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { id: 'text', type: 'text', label: '文本', icon: Type, defaultProps: { content: '请输入文本', style: {} } },
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
          placeholder="// 在这里编写JavaScript代码&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('页面加载完成');&#10;});"
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
    setElements(prev => 
      prev.map(el => el.id === updatedElement.id ? updatedElement : el)
    );
    setSelectedElement(updatedElement);
  }, []);

  const handleDeleteElement = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
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
    alert('项目已保存到本地存储');
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

      // 保存���本地存储（实际应用中会发送到后端）
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
      setCss(prev => prev + '\n' + extractedCSS);
    }

    // 解析JavaScript
    const scriptElements = doc.querySelectorAll('script');
    let extractedJS = '';
    scriptElements.forEach(script => {
      if (script.innerHTML) {
        extractedJS += script.innerHTML + '\n';
      }
    });
    if (extractedJS) {
      setJs(prev => prev + '\n' + extractedJS);
    }

    // 解析body中的元素
    const bodyElements = doc.body ? doc.body.children : doc.children;

    const parseElement = (element) => {
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
        style: computedStyle
      };

      // 根据HTML标签类型转换为编辑器元素
      switch (tagName) {
        case 'div':
        case 'section':
        case 'article':
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
          elementData.type = 'text';
          elementData.content = element.innerText || '';
          break;
        case 'button':
        case 'a':
          elementData.type = 'button';
          elementData.content = element.innerText || '';
          break;
        case 'img':
          elementData.type = 'image';
          elementData.src = element.src || '';
          elementData.alt = element.alt || '';
          break;
        default:
          // 其他元素转换为文本
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
      const parsedElements = parseHTMLToElements(importHtml);
      setElements(prev => [...prev, ...parsedElements]);
      setShowImportDialog(false);
      setImportHtml('');
      alert(`成功导入 ${parsedElements.length} 个元素`);
    } catch (error) {
      console.error('HTML解析失败:', error);
      alert('HTML解析失败，请检查代码格式');
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportHtml(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('请选择HTML文件');
    }
  };

  // 加载已发布的网站
  React.useEffect(() => {
    const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
    setPublishedSites(sites);
  }, []);

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
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生成的网页</title>
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
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="输入���站名称"
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
              导入HTML
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出HTML
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
      </div>
    </DndProvider>
  );
}
