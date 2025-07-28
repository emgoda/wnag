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
  Settings
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
            <Button onClick={handlePreview} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              预览
            </Button>
            <Button onClick={handleSave} variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
            <Button onClick={handleExport} variant="default" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出HTML
            </Button>
          </div>
        </div>

        {/* 主要编辑区域 */}
        <div className="flex-1 flex">
          {/* 左侧：组件库 */}
          <div className="w-64 bg-white border-r p-4">
            <h3 className="text-sm font-semibold mb-4">组件库</h3>
            <div className="grid grid-cols-2 gap-2">
              {componentLibrary.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
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
