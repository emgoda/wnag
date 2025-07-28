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
  FileText,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  Edit3
} from 'lucide-react';

// 定义拖拽项目类型
const ItemTypes = {
  COMPONENT: 'component',
  ELEMENT: 'element'
};

// 组件库
const componentLibrary = [
  { id: 'text', type: 'text', label: '文本', icon: Type, defaultProps: { content: '请��入文本', style: {} } },
  { id: 'button', type: 'button', label: '按钮', icon: MousePointer, defaultProps: { content: '点击按钮', style: {} } },
  { id: 'input', type: 'input', label: '输入框', icon: Edit3, defaultProps: { placeholder: '请输入内容', style: {} } },
  { id: 'image', type: 'image', label: '图片', icon: Image, defaultProps: { src: 'https://via.placeholder.com/300x200', alt: '图片', style: {} } },
  { id: 'container', type: 'container', label: '容器', icon: Square, defaultProps: { style: { padding: '20px', border: '1px dashed #ccc' } } },
];

// 设备尺寸配置
const deviceSizes = {
  mobile: {
    name: '手机',
    icon: Smartphone,
    width: 375,
    height: 667,
    className: 'device-mobile'
  },
  tablet: {
    name: '��板',
    icon: Tablet,
    width: 768,
    height: 1024,
    className: 'device-tablet'
  },
  desktop: {
    name: '电脑',
    icon: Monitor,
    width: 1200,
    height: 800,
    className: 'device-desktop'
  }
};

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

// 元素操作菜单组件
function ElementActionsMenu({ isOpen, onToggle, onDuplicate, onDelete, onCopyStyle, onSelectAllInstances, onSaveAsTemplate }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-0 right-0 bg-white rounded-lg shadow-lg border py-2 min-w-48 z-50"
    >
      <button
        onClick={onSelectAllInstances}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <span>🔍</span> 选择所有实例
      </button>
      <button
        onClick={onDuplicate}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <span>📋</span> 复制
      </button>
      <button
        onClick={onDelete}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
      >
        <span>🗑️</span> 删除
      </button>
      <div className="border-t my-1" />
      <button
        onClick={onSaveAsTemplate}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <span>💾</span> 保存为模板
      </button>
      <button
        onClick={onCopyStyle}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <span>🎨</span> 复制样式
      </button>
    </div>
  );
}

// 画布元素
function CanvasElement({ element, onSelect, onDelete, onDuplicate, onCopyStyle, onSelectAllInstances, onSaveAsTemplate, isSelected, selectedElementId, selectedInstances }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ELEMENT,
    item: { id: element.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element);
    // 如果点击的不是菜单按钮，关闭菜单
    if (!e.target.closest('[data-menu-button]')) {
      setShowActionsMenu(false);
    }
  };

  const handleToggleActionsMenu = (e) => {
    e.stopPropagation();
    setShowActionsMenu(!showActionsMenu);
  };

  const handleDelete = () => {
    onDelete(element.id);
    setShowActionsMenu(false);
  };

  const handleDuplicate = () => {
    onDuplicate(element);
    setShowActionsMenu(false);
  };

  const handleCopyStyle = () => {
    onCopyStyle(element);
    setShowActionsMenu(false);
  };

  const handleSelectAllInstances = () => {
    onSelectAllInstances(element.type);
    setShowActionsMenu(false);
  };

  const handleSaveAsTemplate = () => {
    onSaveAsTemplate(element);
    setShowActionsMenu(false);
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
            {element.content || '按��'}
          </button>
        );
      case 'input':
        return (
          <input
            type="text"
            placeholder={element.placeholder || '请输入内容'}
            value={element.value || ''}
            style={style}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            readOnly
          />
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
                onDuplicate={onDuplicate}
                onCopyStyle={onCopyStyle}
                onSelectAllInstances={onSelectAllInstances}
                onSaveAsTemplate={onSaveAsTemplate}
                selectedElementId={selectedElementId}
                isSelected={selectedElementId === child.id}
                selectedInstances={selectedInstances}
              />
            )) || <div className="text-gray-400 text-center py-4">拖拽组����这里</div>}
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
      className={`canvas-element relative cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50/20'
          : selectedInstances?.includes(element.id)
          ? 'ring-2 ring-yellow-400 bg-yellow-50/20'
          : 'hover:ring-1 hover:ring-blue-300'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ position: 'relative' }}
    >
      {renderElement()}
      {isSelected && (
        <>
          {/* 选择指示器 */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>

          {/* 选择边框 */}
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" style={{ borderStyle: 'dashed' }}></div>

          {/* 元素类型标签 */}
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {element.type}
          </div>

          {/* 右上角操��按钮 */}
          <button
            data-menu-button
            onClick={handleToggleActionsMenu}
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-10"
            title="操作菜单"
          >
            <span className="text-xs">⋯</span>
          </button>

          {/* 操作���单 */}
          <ElementActionsMenu
            isOpen={showActionsMenu}
            onToggle={handleToggleActionsMenu}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onCopyStyle={handleCopyStyle}
            onSelectAllInstances={handleSelectAllInstances}
            onSaveAsTemplate={handleSaveAsTemplate}
          />
        </>
      )}
    </div>
  );
}

// 浏览器风格画布组件
function BrowserCanvas({
  elements,
  onDrop,
  onSelectElement,
  selectedElement,
  onDeleteElement,
  onDuplicateElement,
  onCopyStyleElement,
  onSelectAllInstances,
  onSaveAsTemplate,
  selectedInstances,
  deviceMode,
  siteName,
  onDeviceChange,
  pages
}) {
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

  const currentDevice = deviceSizes[deviceMode];
  const canvasStyle = {
    width: deviceMode === 'desktop' ? '100%' : `${currentDevice.width}px`,
    height: deviceMode === 'desktop' ? 'auto' : `${currentDevice.height}px`,
    maxWidth: '100%',
    margin: deviceMode === 'desktop' ? '0' : '0 auto',
    transform: deviceMode === 'mobile' ? 'scale(0.75)' : deviceMode === 'tablet' ? 'scale(0.85)' : 'scale(1)',
    transformOrigin: 'top center',
    boxShadow: deviceMode !== 'desktop' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
    border: deviceMode !== 'desktop' ? '1px solid #e5e7eb' : 'none',
    borderRadius: deviceMode !== 'desktop' ? '8px' : '0',
    overflow: 'hidden'
  };

  return (
    <div className="flex-1 bg-gray-100 p-6">
      {/* 浏览器窗口容器 */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-w-full">
        {/* 浏��器顶部栏 */}
        <div className="bg-gray-50 border-b border-gray-200 p-3">
          {/* 窗口控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4 flex items-center bg-white rounded-md px-3 py-1 text-sm border">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">
                  preview.{siteName?.toLowerCase().replace(/\s+/g, '-') || 'website'}.com
                  {(() => {
                    const currentPage = pages.find(p => p.isActive);
                    return currentPage?.route !== '/' ? currentPage?.route : '';
                  })()}
                </span>
              </div>
            </div>

            {/* 设备切换按钮 */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border">
              {Object.entries(deviceSizes).filter(([key]) => key !== 'tablet').map(([key, device]) => {
                const Icon = device.icon;
                return (
                  <button
                    key={key}
                    onClick={() => onDeviceChange(key)}
                    className={`p-2 rounded-md transition-colors ${
                      deviceMode === key
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={device.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 浏览器内容区域 */}
        <div
          className="bg-white flex justify-center items-start"
          style={{
            minHeight: '600px',
            padding: deviceMode !== 'desktop' ? '20px' : '0',
            background: deviceMode !== 'desktop' ? '#f3f4f6' : 'white'
          }}
        >
          <div
            ref={drop}
            className={`transition-all duration-300 ${
              isOver ? 'bg-blue-50' : 'bg-white'
            } ${deviceMode === 'mobile' ? 'rounded-xl border-4 border-gray-800' : ''}`}
            style={canvasStyle}
            onClick={() => onSelectElement(null)}
          >
            <div className="space-y-4">
              {elements.map((element) => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  onSelect={onSelectElement}
                  onDelete={onDeleteElement}
                  onDuplicate={onDuplicateElement}
                  onCopyStyle={onCopyStyleElement}
                  onSelectAllInstances={onSelectAllInstances}
                  onSaveAsTemplate={onSaveAsTemplate}
                  selectedElementId={selectedElement?.id}
                  isSelected={selectedElement?.id === element.id}
                  selectedInstances={selectedInstances}
                />
              ))}
              {elements.length === 0 && (
                <div className="text-center text-gray-400 py-20">
                  {deviceMode === 'mobile' && <Smartphone size={48} className="mx-auto mb-4 opacity-50" />}
                  {deviceMode === 'tablet' && <Tablet size={48} className="mx-auto mb-4 opacity-50" />}
                  {deviceMode === 'desktop' && <Monitor size={48} className="mx-auto mb-4 opacity-50" />}
                  <p>拖拽左侧组件到这里���始设计</p>
                  <p className="text-sm mt-2">{currentDevice.name}视图 ({currentDevice.width}×{currentDevice.height})</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>元素: {elements.length}</span>
            <span>设备: {currentDevice.name}</span>
            <span>尺寸: {currentDevice.width} × {currentDevice.height}</span>
            <span>缩放: {deviceMode === 'mobile' ? '75%' : deviceMode === 'tablet' ? '85%' : '100%'}</span>
            {(() => {
              const currentPage = pages.find(p => p.isActive);
              return currentPage && (
                <span className="text-blue-600">
                  页面: {currentPage.name} ({currentPage.route})
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>实时预览</span>
            </div>
            {selectedElement && (
              <span className="text-blue-600">���选择: {selectedElement.type}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 属性编辑器
function PropertyEditor({ selectedElement, onUpdateElement, copiedStyle, onPasteStyle }) {
  if (!selectedElement) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Settings size={48} className="mx-auto mb-4 opacity-50" />
        <p>选择一个元素来编辑属��</p>
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
        <h3 className="text-sm font-medium mb-2">元素类��</h3>
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

      {selectedElement.type === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">占位符文本</label>
            <input
              type="text"
              value={selectedElement.placeholder || ''}
              onChange={(e) => onUpdateElement({ ...selectedElement, placeholder: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="请输入占位符文本"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">默认值</label>
            <input
              type="text"
              value={selectedElement.value || ''}
              onChange={(e) => onUpdateElement({ ...selectedElement, value: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="输入默认��"
            />
          </div>
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">样式设置</h3>
          {copiedStyle && (
            <button
              onClick={onPasteStyle}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              粘贴样式
            </button>
          )}
        </div>
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
          placeholder="/* 在这���编写CSS样式 */&#10;.text-element {&#10;  font-size: 16px;&#10;  font-family: sans-serif;&#10;}"
        />
      </TabsContent>
      <TabsContent value="js" className="mt-4 h-full">
        <textarea
          value={js}
          onChange={(e) => onJsChange(e.target.value)}
          className="w-full h-[400px] p-3 border rounded-md font-mono text-sm resize-none"
          placeholder="// 在这里编���JavaScript代码&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('���面加载完成');&#10;});"
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
  const [importUrl, setImportUrl] = useState('');
  const [importMode, setImportMode] = useState('html'); // 'html', 'project', 'published'
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'mobile', 'tablet', 'desktop'
  const [pages, setPages] = useState([
    { id: 'home', name: '首页', route: '/', isActive: true },
    { id: 'about', name: '关���我���', route: '/about', isActive: false },
    { id: 'contact', name: '联系方式', route: '/contact', isActive: false }
  ]);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageForm, setPageForm] = useState({ name: '', route: '', description: '' });
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedInstances, setSelectedInstances] = useState([]);

  // 网站项目管理
  const [currentProject, setCurrentProject] = useState({
    id: 'project_' + Date.now(),
    name: '未命名网站',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'editing' // 'editing', 'published', 'archived'
  });

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

  // 复制元素
  const handleDuplicateElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: `element_${elementIdCounter}`,
      style: { ...element.style }
    };
    setElements(prev => [...prev, newElement]);
    setElementIdCounter(prev => prev + 1);
    setSelectedElement(newElement);
  }, [elementIdCounter]);

  // 复制样式
  const handleCopyStyleElement = useCallback((element) => {
    setCopiedStyle(element.style);
    alert('���式已复制！选择��他元素后可以粘贴样式');
  }, []);

  // 选择所有相同类型的实例
  const handleSelectAllInstances = useCallback((elementType) => {
    const getAllElementsByType = (elements, type) => {
      let results = [];
      for (const el of elements) {
        if (el.type === type) {
          results.push(el);
        }
        if (el.children && el.children.length > 0) {
          results.push(...getAllElementsByType(el.children, type));
        }
      }
      return results;
    };

    const instances = getAllElementsByType(elements, elementType);
    const instanceCount = instances.length;

    if (instanceCount > 0) {
      // 临时高亮所有实例
      setSelectedInstances(instances.map(el => el.id));
      setTimeout(() => {
        setSelectedInstances([]);
      }, 3000); // 3秒后取消高亮

      alert(`找到 ${instanceCount} 个 ${elementType} 类型的元素，已临时高亮显示`);
    } else {
      alert(`没有找到 ${elementType} 类型的元素`);
    }
  }, [elements]);

  // 保存为模板
  const handleSaveAsTemplate = useCallback((element) => {
    const template = {
      id: `template_${Date.now()}`,
      name: `${element.type}_模板`,
      type: element.type,
      content: element.content,
      placeholder: element.placeholder,
      src: element.src,
      alt: element.alt,
      style: { ...element.style },
      createdAt: new Date().toISOString()
    };
    setSavedTemplates(prev => [...prev, template]);
    alert(`已保���为模板: ${template.name}`);
  }, []);

  // 粘贴样式到选中元素
  const handlePasteStyle = useCallback(() => {
    if (copiedStyle && selectedElement) {
      const updatedElement = {
        ...selectedElement,
        style: { ...copiedStyle }
      };
      handleUpdateElement(updatedElement);
      alert('样式已粘贴！');
    }
  }, [copiedStyle, selectedElement]);

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  // 网站项目管理函数
  const saveWebsiteProject = () => {
    const projectData = {
      ...currentProject,
      pages: pages,
      elements: elements,
      css: cssCode,
      js: jsCode,
      updatedAt: new Date().toISOString()
    };

    // 获取现有的网站项目列表
    const existingProjects = JSON.parse(localStorage.getItem('website_projects') || '[]');

    // 查找是否已存在该项目
    const projectIndex = existingProjects.findIndex(p => p.id === currentProject.id);

    if (projectIndex >= 0) {
      // 更新现有项目
      existingProjects[projectIndex] = projectData;
    } else {
      // 添加新项目
      existingProjects.push(projectData);
    }

    // 保存到localStorage
    localStorage.setItem('website_projects', JSON.stringify(existingProjects));

    // 触发���定义事件，通知其他页面数据更新
    window.dispatchEvent(new CustomEvent('websiteProjectsUpdated', { detail: existingProjects }));

    alert(`网站项目"${currentProject.name}"已保存！`);
  };

  const updateProjectInfo = (field, value) => {
    setCurrentProject(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  // URL导入功能
  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      alert('请输入有效的URL');
      return;
    }

    try {
      // 由于跨域限制，我们使用代理服务或提示用户手动操作
      const confirmManual = window.confirm(
        `即将从 ${importUrl} 导入网站\n\n由于浏览器安全限制，请手动执行以下步骤：\n\n1. 在新标签页中打开该URL\n2. 右键"查看网页源代码"\n3. 复制所有HTML代码\n4. 返回此页面粘贴到下方文本框\n\n点击"确定"在新标签页中打开该网站`
      );

      if (confirmManual) {
        window.open(importUrl, '_blank');
        // 清空URL输入框，准备接收用户粘贴的HTML
        setImportUrl('');
        alert('请从新打开的页面复制HTML源码，然后粘贴到下方的文本框中');
      }
    } catch (error) {
      console.error('URL导入失败:', error);
      alert('URL导入失败，请检查网址是否正确');
    }
  };

  const handleSave = () => {
    const projectData = {
      elements,
      css,
      js,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('webeditor_project', JSON.stringify(projectData));

    // 使用新的网站项目��理系统
    saveWebsiteProject();
    alert('项目已保����到本地存储');
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
      alert('请输入网站名���');
      return;
    }

    setIsPublishing(true);
    try {
      const html = generateHTML(elements, css, js);
      const siteId = `site_${Date.now()}`;
      const publishUrl = `${window.location.origin}/published/${siteId}`;

      // 模拟发布过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 保存到����地存储（实际应用中会发送到后端）
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

      // 添加到后台监���系��
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

      alert(`网站������布成功！\n访问链��: ${publishUrl}`);
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
    console.log('parseHTMLToElements 开始解析，HTML长度:', htmlString.length);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const elements = [];
    let idCounter = elementIdCounter;

    console.log('DOMParser 解析完成');
    console.log('body元素:', doc.body);
    console.log('body子元素数量:', doc.body ? doc.body.children.length : 0);

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

      // 获取������样式
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

      // 保存重要属性和事件
      if (element.id) elementData.attributes.htmlId = element.id;
      if (element.title) elementData.attributes.title = element.title;
      if (element.dataset) elementData.attributes.dataset = element.dataset;

      // 保存事件��听器（通过属性检测）
      const events = {};
      ['onclick', 'onchange', 'onsubmit', 'onload', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'].forEach(eventAttr => {
        if (element.getAttribute(eventAttr)) {
          events[eventAttr] = element.getAttribute(eventAttr);
        }
      });
      if (Object.keys(events).length > 0) {
        elementData.attributes.events = events;
      }

      // 保存表单属性
      ['name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked', 'selected'].forEach(attr => {
        if (element.hasAttribute(attr)) {
          elementData.attributes[attr] = element.getAttribute(attr);
        }
      });

      // 根据HTML标签类型转��为编辑器元素
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
        case 'input':
        case 'textarea':
        case 'select':
          elementData.type = 'input';
          elementData.inputType = element.type || 'text';
          elementData.placeholder = element.placeholder || '';
          elementData.value = element.value || '';

          // 特殊输入类型处理
          if (tagName === 'textarea') {
            elementData.inputType = 'textarea';
            elementData.content = element.value || element.textContent || '';
          } else if (tagName === 'select') {
            elementData.inputType = 'select';
            elementData.options = Array.from(element.options).map(opt => ({
              value: opt.value,
              text: opt.text,
              selected: opt.selected
            }));
          }
          break;
        case 'form':
          elementData.type = 'container';
          elementData.attributes.isForm = true;
          elementData.attributes.method = element.method || 'GET';
          elementData.attributes.action = element.action || '';
          elementData.content = '表单容器';
          break;
        case 'canvas':
          elementData.type = 'container';
          elementData.attributes.isCanvas = true;
          elementData.content = 'Canvas画布';
          if (element.width) elementData.style.width = element.width + 'px';
          if (element.height) elementData.style.height = element.height + 'px';
          break;
        case 'video':
        case 'audio':
          elementData.type = 'container';
          elementData.attributes.isMedia = true;
          elementData.attributes.mediaType = tagName;
          elementData.attributes.src = element.src || '';
          elementData.attributes.controls = element.hasAttribute('controls');
          elementData.content = `${tagName === 'video' ? '视频' : '音频'}播放器`;
          break;
        case 'iframe':
          elementData.type = 'container';
          elementData.attributes.isIframe = true;
          elementData.attributes.src = element.src || '';
          elementData.content = '嵌入式内容';
          if (element.width) elementData.style.width = element.width + 'px';
          if (element.height) elementData.style.height = element.height + 'px';
          break;
        default:
          // 其他元素������换��文本
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

    // 保存原始HTML以便保留交互功能
    const originalHtmlMeta = {
      originalHtml: htmlString,
      parsedAt: new Date().toISOString(),
      hasInteractivity: htmlString.includes('addEventListener') ||
                      htmlString.includes('onclick') ||
                      htmlString.includes('function') ||
                      /<(input|button|form|select|textarea)/.test(htmlString)
    };

    // 将元数据添加到第一个元素（如果存在）
    if (elements.length > 0) {
      elements[0].attributes = elements[0].attributes || {};
      elements[0].attributes.originalHtmlMeta = originalHtmlMeta;
    }

    console.log('解析完成，生成元素数量:', elements.length);
    console.log('检测到交互功能:', originalHtmlMeta.hasInteractivity);

    return elements;
  };

  const handleImportHTML = () => {
    if (!importHtml.trim()) {
      alert('请输入HTML���码');
      return;
    }

    try {
      // 检��是��是本系统生成的网站
      const isSystemGenerated = importHtml.includes('生��的网页') ||
                               importHtml.includes('网页编辑���') ||
                               importHtml.includes('<!-- Generated by WebEditor -->');

      // 智能导入模式选择
      if (isSystemGenerated) {
        // 检查是否替换��前内容
        const confirmReplace = elements.length === 0 ||
          window.confirm('检测到这是本系统生成的网站，导入将替���当前所有内容，是否继续？');

        if (confirmReplace) {
          const parsedElements = parseHTMLToElements(importHtml);
          setElements(parsedElements); // 替���而不是添加
          setShowImportDialog(false);
          setImportHtml('');
          alert(`成功导入系统网站，共 ${parsedElements.length} 个元����`);
        }
      } else {
        // 外部HTML，添加到现有内容
        const parsedElements = parseHTMLToElements(importHtml);
        console.log('解析完成，获得元素:', parsedElements);

        if (parsedElements.length === 0) {
          alert('未能从HTML中解析出可编辑的元素。\n\n可能的原因：\n1. HTML格式不正确\n2. 缺少有效的内容元素���div、p、h1等）\n3. 内容可能在iframe或script中\n\n请检查HTML代码格式，或查看浏览器控制台获取详细信息。');
          return;
        }

        setElements(prev => [...prev, ...parsedElements]);
        setShowImportDialog(false);
        setImportHtml('');
        alert(`成功导入外部HTML，��增 ${parsedElements.length} 个元素`);
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
        // ��认是否覆盖当前项目
        const confirmOverwrite = elements.length === 0 ||
          window.confirm('导入项目将替换当前内容��是否继续？');

        if (confirmOverwrite) {
          setElements(projectData.elements);
          setCss(projectData.css || '');
          setJs(projectData.js || '');

          // 更新ID计数器 (递归处理所有嵌套元素)
          const getAllElementIds = (elements) => {
            let ids = [];
            for (const el of elements) {
              ids.push(el.id);
              if (el.children && el.children.length > 0) {
                ids.push(...getAllElementIds(el.children));
              }
            }
            return ids;
          };

          const allIds = getAllElementIds(projectData.elements);
          const maxId = Math.max(
            ...allIds.map(id => {
              const match = id.match(/\d+$/);
              return match ? parseInt(match[0]) : 0;
            }),
            elementIdCounter,
            0
          );
          setElementIdCounter(maxId + 1);

          setShowImportDialog(false);
          alert('项��导入成功！');
        }
      } else {
        alert('项目文件格式不正确');
      }
    } catch (error) {
      console.error('项目导入失��:', error);
      alert('项目导���失败，请检查文件���式');
    }
  };

  // 从已发布网站导入
  const handleImportFromPublished = (siteId) => {
    const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
    const site = sites.find(s => s.id === siteId);

    if (site) {
      const confirmImport = elements.length === 0 ||
        window.confirm('导入网站将替换当前内容��是否继续？');

      if (confirmImport) {
        // 解析HTML重新构��项���
        try {
          const parsedElements = parseHTMLToElements(site.html);
          setElements(parsedElements);
          setShowImportDialog(false);
          alert(`成功��入网站：${site.name}`);
        } catch (error) {
          console.error('网站导入失败:', error);
          alert('网站导入失败，请重试');
        }
      }
    }
  };

  // 导出完���项目
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
      window.confirm('新建项目将清除当前所���内容，是否继续？');

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

  // 返���上一页功能
  const handleGoBack = () => {
    // 检查是��有编辑内容未保存
    if (elements.length > 0) {
      const confirmLeave = window.confirm('当前页面��未保存的内容，确定要离开����？');
      if (!confirmLeave) return;
    }

    // 智能返回：优先返回浏���器历史，否则返回���页
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  // 页面管理函数
  const handleNewPage = () => {
    const pageCount = pages.length + 1;
    const newPage = {
      id: `page_${Date.now()}`,
      name: `页面${pageCount}`,
      route: `/page${pageCount}`,
      description: '',
      isActive: false
    };
    setPages(prev => [...prev, newPage]);
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
    setPageForm({ name: page.name, route: page.route, description: page.description || '' });
    setShowPageDialog(true);
  };

  const handleSavePage = () => {
    if (!pageForm.name.trim() || !pageForm.route.trim()) {
      alert('请填写页面名�����路由���径');
      return;
    }

    // 验证路�������
    if (!pageForm.route.startsWith('/')) {
      alert('路由路径必须以 / 开头');
      return;
    }

    // 检查路由是否重复
    const existingPage = pages.find(p => p.route === pageForm.route && (!editingPage || p.id !== editingPage.id));
    if (existingPage) {
      alert('该路由路径已�����，请使用其��路径');
      return;
    }

    if (editingPage) {
      // 编辑现有页面
      setPages(prev => prev.map(p =>
        p.id === editingPage.id
          ? { ...p, name: pageForm.name, route: pageForm.route, description: pageForm.description }
          : p
      ));
    } else {
      // 新建页面
      const newPage = {
        id: `page_${Date.now()}`,
        name: pageForm.name,
        route: pageForm.route,
        description: pageForm.description,
        isActive: false
      };
      setPages(prev => [...prev, newPage]);
    }

    setShowPageDialog(false);
    setPageForm({ name: '', route: '', description: '' });
    setEditingPage(null);
  };

  const handleSwitchPage = (pageId) => {
    setPages(prev => prev.map(p => ({ ...p, isActive: p.id === pageId })));
    // 这里可以添加切换页面时的逻辑，比如保存当前页面内容，加载��页面内容
  };

  const handleDeletePage = (pageId) => {
    const page = pages.find(p => p.id === pageId);
    if (page && window.confirm(`确定要删除���面 "${page.name}" 吗？`)) {
      setPages(prev => prev.filter(p => p.id !== pageId));
    }
  };

  // 加载已发布的网站���自动保存项目
  useEffect(() => {
    const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
    setPublishedSites(sites);

    // 直接加载��示项目数�� (只加载一次)
    if (!demoDataLoaded && elements.length === 0) {
      const demoProjectData = {
        "version": "1.0",
        "name": "个人作品集网站",
        "elements": [
          {
            "id": "demo_1",
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
                "id": "demo_2",
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
                "id": "demo_3",
                "type": "text",
                "content": "���栈开发工程师",
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
                "id": "demo_4",
                "type": "text",
                "content": "��注于创���现代化的Web应用程序，拥有丰富的前端和后端开发��验",
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
                "id": "demo_5",
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
            "id": "demo_6",
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
                "id": "demo_7",
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
                "id": "demo_8",
                "type": "text",
                "content": "我是一名充���激情的全栈开发工程师，���注于使用现代技术栈��建高质量的Web应用程序。拥有5年以上的开发经验，熟练掌握React、Node.js、Python等技术。",
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
                "id": "demo_9",
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
                    "id": "demo_10",
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
                        "id": "demo_11",
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
                        "id": "demo_12",
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
                    "id": "demo_13",
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
                        "id": "demo_14",
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
                        "id": "demo_15",
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

/* 动���效果 */
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

/* 技能卡片悬��效果 */
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

/* 滚动����为 */
html {
  scroll-behavior: smooth;
}

/* ���择�����颜色 */
::selection {
  background-color: #2196f3;
  color: white;
}`,
        "js": `// ���面加载动���
document.addEventListener('DOMContentLoaded', function() {
  console.log('个人��品集网站加载完成');

  // 添�����滑滚动到CTA按钮
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

  // 技能卡片���画
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

      // Calculate proper elementIdCounter based on existing element IDs (recursive)
      const getAllElementIds = (elements) => {
        let ids = [];
        for (const el of elements) {
          ids.push(el.id);
          if (el.children && el.children.length > 0) {
            ids.push(...getAllElementIds(el.children));
          }
        }
        return ids;
      };

      // 演示数据使用demo_前缀，不影响element_的计数器
      // 所以elementIdCounter保持从1开始
      setElementIdCounter(1);
      setDemoDataLoaded(true);

      console.log('演�����项目已加载:', demoProjectData.name);
    }
  }, [demoDataLoaded, elements.length]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+V 或 Cmd+V 粘贴样式
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedStyle && selectedElement) {
        e.preventDefault();
        handlePasteStyle();
      }
      // Delete 键删除选中元素
      if (e.key === 'Delete' && selectedElement) {
        handleDeleteElement(selectedElement.id);
      }
      // Ctrl+D 或 Cmd+D 复制选中元素
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement) {
        e.preventDefault();
        handleDuplicateElement(selectedElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copiedStyle, selectedElement, handlePasteStyle, handleDeleteElement, handleDuplicateElement]);

  // 自动保存����项目
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
    <title>${siteName || '生成的��页'}</title>
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
            ��回编辑
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
            <div className="w-px h-6 bg-gray-300"></div>

            {/* ��部���备切换 */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {Object.entries(deviceSizes).filter(([key]) => key !== 'tablet').map(([key, device]) => {
                const Icon = device.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setDeviceMode(key)}
                    className={`px-3 py-1 rounded-md transition-colors text-sm flex items-center gap-1 ${
                      deviceMode === key
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                    title={device.name}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline"><p><br /></p></span>
                  </button>
                );
              })}
            </div>
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
                  发布到后���
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 主要编辑区域 */}
        <div className="flex-1 flex">
          {/* 左侧：页面管理和新增 */}
          <div className="w-64 bg-white border-r p-4 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                页面管理
              </h3>

              {/* 新建页面按钮 */}
              <button
                onClick={handleNewPage}
                className="w-full mb-3 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                新建页面
              </button>

              {/* ��速模板 */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">快速模板</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // 加���个人作品集模板
                      alert('正在加载个人作品集模板...');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
                  >
                    <div className="font-medium">个人作��集</div>
                    <div className="text-xs text-gray-500">展示技能和项目</div>
                  </button>
                  <button
                    onClick={() => {
                      alert('正在加载企业官网模板...');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
                  >
                    <div className="font-medium">企业官网</div>
                    <div className="text-xs text-gray-500">商业网���模板</div>
                  </button>
                  <button
                    onClick={() => {
                      alert('正在加载落地页模板...');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
                  >
                    <div className="font-medium">产品落地页</div>
                    <div className="text-xs text-gray-500">营销推广页面</div>
                  </button>
                </div>
              </div>

              {/* 页面列表 */}
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">页面列表</h4>
                <div className="space-y-1">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`px-3 py-2 border rounded-lg text-sm group transition-colors ${
                        page.isActive
                          ? 'bg-blue-50 border-blue-200'
                          : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => !page.isActive && handleSwitchPage(page.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`w-2 h-2 rounded-full ${
                            page.isActive ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                          <div className={`flex-1 min-w-0 truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                            page.isActive ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {page.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {page.isActive && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              ���前
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 页面编辑表单 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                {(() => {
                  const currentPage = pages.find(p => p.isActive);
                  return currentPage && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">页面设���</h4>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-red-600">
                          * 页面ID
                        </label>
                        <input
                          type="text"
                          value={currentPage.route}
                          onChange={(e) => {
                            const newRoute = e.target.value;
                            setPages(prev => prev.map(p =>
                              p.id === currentPage.id ? { ...p, route: newRoute } : p
                            ));
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="输入页面路由"
                        />
                        {!currentPage.route && (
                          <p className="text-xs text-red-500 mt-1">你尚未���置���面ID</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          页面备注
                        </label>
                        <textarea
                          value={currentPage.description || ''}
                          onChange={(e) => {
                            const newDescription = e.target.value;
                            setPages(prev => prev.map(p =>
                              p.id === currentPage.id ? { ...p, description: newDescription } : p
                            ));
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={1}
                          placeholder="输入页面备注信息"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // ���里可以添��首页设置逻辑
                            alert('设为首页功能');
                          }}
                          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                          </div>
                          设为首页
                        </button>

                        <button
                          onClick={() => {
                            alert('页面设置已保存');
                          }}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          保��更改
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* AI生成功能 */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Code className="w-4 h-4" />
                AI 生���
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    alert('正在使用AI生成页面内容...');
                  }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium"
                >
                  ✨ AI 生成页面
                </button>
                <button
                  onClick={() => {
                    alert('正在生成内容建议...');
                  }}
                  className="w-full px-3 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                >
                  💡 ��容建议
                </button>
              </div>
            </div>
          </div>

          {/* 中间���浏览��风格画布 */}
          <div className="flex-1">
            <BrowserCanvas
              elements={elements}
              onDrop={handleDrop}
              onSelectElement={handleSelectElement}
              selectedElement={selectedElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onCopyStyleElement={handleCopyStyleElement}
              onSelectAllInstances={handleSelectAllInstances}
              onSaveAsTemplate={handleSaveAsTemplate}
              selectedInstances={selectedInstances}
              deviceMode={deviceMode}
              siteName={siteName}
              onDeviceChange={setDeviceMode}
              pages={pages}
            />
          </div>

          {/* 右侧：组件库、属性编辑器和代码编辑器 */}
          <div className="w-80 bg-white border-l flex flex-col">
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="grid w-full grid-cols-3 m-2">
                <TabsTrigger value="components" className="text-xs">组件</TabsTrigger>
                <TabsTrigger value="properties" className="text-xs">属��</TabsTrigger>
                <TabsTrigger value="code" className="text-xs">代码</TabsTrigger>
              </TabsList>

              {/* 组件库 */}
              <TabsContent value="components" className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-3">组件库</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {componentLibrary.map((component) => (
                      <DraggableComponent key={component.id} component={component} />
                    ))}
                  </div>
                </div>

                {/* 保存的模板 */}
                {savedTemplates.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <span>📋</span> 保存的模板
                    </h3>
                    <div className="space-y-2">
                      {savedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            const newElement = {
                              id: `element_${elementIdCounter}`,
                              type: template.type,
                              content: template.content,
                              placeholder: template.placeholder,
                              src: template.src,
                              alt: template.alt,
                              style: { ...template.style }
                            };
                            setElements(prev => [...prev, newElement]);
                            setElementIdCounter(prev => prev + 1);
                          }}
                        >
                          <div className="text-sm font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已发布网站��理 */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    已发布网站
                  </h3>
                  {publishedSites.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">暂无发布的网站</p>
                  ) : (
                    <div className="space-y-2">
                      {publishedSites.slice(-3).map((site) => (
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
              </TabsContent>

              {/* 属性编辑器 */}
              <TabsContent value="properties" className="p-4 flex-1 overflow-y-auto">
                <PropertyEditor
                  selectedElement={selectedElement}
                  onUpdateElement={handleUpdateElement}
                  copiedStyle={copiedStyle}
                  onPasteStyle={handlePasteStyle}
                />
              </TabsContent>

              {/* 代码编辑器 */}
              <TabsContent value="code" className="p-4 flex-1 overflow-y-auto">
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

        {/* 页面配置对话框 */}
        {showPageDialog && (
          <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {editingPage ? '编辑��面' : '新建页面'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    页面名称 *
                  </label>
                  <input
                    type="text"
                    value={pageForm.name}
                    onChange={(e) => setPageForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：首页、关���我们"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    路由路径 *
                  </label>
                  <input
                    type="text"
                    value={pageForm.route}
                    onChange={(e) => setPageForm(prev => ({ ...prev, route: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：/、/about、/contact"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    路径必须以 / 开头，用于网站导航
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    页面描述
                  </label>
                  <textarea
                    value={pageForm.description}
                    onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="简要描述页面用途和内容..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">路由设置说明：</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 首页������ /</li>
                    <li>• 子页面使用 /page-name 格式</li>
                    <li>• 支持多层路径如 /products/detail</li>
                    <li>• 路径将用于生成网站导航</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPageDialog(false);
                      setPageForm({ name: '', route: '', description: '' });
                      setEditingPage(null);
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={handleSavePage}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingPage ? '保存更改' : '创建页面'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 高级���入对话框 */}
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
                  {/* URL导入 */}
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <label className="block text-sm font-medium mb-2 text-green-800">
                      🌐 从URL导入网站（保留完整交互功能）
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://de131b00778b4a3485b3090f3984e88f-b4541903cd084ece97a590cff.fly.dev/"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button
                        onClick={handleImportFromUrl}
                        disabled={!importUrl.trim()}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        导入
                      </Button>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      ✨ 推荐：直接输入网站URL，系统会自动指导您获取完整源码
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">或</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        选择HTML文���
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
                      <li>• 自动解���常见HTML��签并转换为可编辑组件</li>
                      <li>• 内联样式会被保留并应用到元素</li>
                      <li>• CSS和JS代码会被提��到对应编辑器</li>
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

                {/* 项����导入 */}
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
                      <li>• 会完整还原项目的所有设置��������属性</li>
                      <li>• 导入会替换当前项目的所有内��</li>
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

                {/* ���发布网站导入 */}
                <TabsContent value="published" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">选择要导入的已发布网��：</h3>
                    {publishedSites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暂无已发布的���站</p>
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
                      <li>• 导入之前发布��网站，重新编辑和修改</li>
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
