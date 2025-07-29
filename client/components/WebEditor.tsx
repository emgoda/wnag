import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Type, Image, Square, MousePointer, Code, Eye, Save, Download, Trash2, Copy,
  Settings, Globe, Link, Upload, FileText, Monitor, Tablet, Smartphone,
  ArrowLeft, Edit3, Layout, Grid, List, Plus, RotateCcw, Play, Pause,
  ChevronRight, Home, Mail, Phone, User, Calendar, Star, Heart, ShoppingCart,
  Menu, Search, Bell, MessageCircle, Video, Music, MapPin, Clock, Zap,
  Layers, Move, MoreHorizontal, Palette, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Link2, ExternalLink, Maximize, Minimize, Minus
} from 'lucide-react';

// 定义拖拽项目类型
const ItemTypes = {
  COMPONENT: 'component',
  ELEMENT: 'element'
};

// 基础组件库
const basicComponents = [
  { id: 'text', type: 'text', label: '文本', icon: Type, category: 'basic', defaultProps: { content: '文本内容', style: { fontSize: '16px', color: '#333' } } },
  { id: 'heading', type: 'heading', label: '标题', icon: Type, category: 'basic', defaultProps: { content: '页面标题', level: 'h1', style: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' } } },
  { id: 'button', type: 'button', label: '按钮', icon: MousePointer, category: 'basic', defaultProps: { content: '点击按钮', style: { backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none' } } },
  { id: 'input', type: 'input', label: '输入框', icon: Edit3, category: 'basic', defaultProps: { placeholder: '请输入内容', inputType: 'text', style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' } } },
  { id: 'textarea', type: 'textarea', label: '文本域', icon: Edit3, category: 'basic', defaultProps: { placeholder: '请输入多行文本', style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '300px', height: '80px', resize: 'vertical' } } },
  { id: 'image', type: 'image', label: '图片', icon: Image, category: 'basic', defaultProps: { src: 'https://via.placeholder.com/300x200', alt: '图片', style: { maxWidth: '100%', height: 'auto', borderRadius: '6px' } } },
  { id: 'link', type: 'link', label: '链接', icon: Link2, category: 'basic', defaultProps: { content: '链接文本', href: '#', style: { color: '#3b82f6', textDecoration: 'underline' } } },
  { id: 'divider', type: 'divider', label: '分割线', icon: Minus, category: 'basic', defaultProps: { style: { height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0', border: 'none' } } }
];

// 布局组件
const layoutComponents = [
  { id: 'container', type: 'container', label: '容器', icon: Square, category: 'layout', defaultProps: { style: { padding: '20px', border: '2px dashed #d1d5db', borderRadius: '6px', minHeight: '100px' } } },
  { id: 'row', type: 'row', label: '行布局', icon: Layout, category: 'layout', defaultProps: { style: { display: 'flex', gap: '16px', padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '6px' } } },
  { id: 'column', type: 'column', label: '列布局', icon: Layout, category: 'layout', defaultProps: { style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '6px' } } },
  { id: 'grid', type: 'grid', label: '网格', icon: Grid, category: 'layout', defaultProps: { columns: 2, style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '6px' } } },
  { id: 'card', type: 'card', label: '卡片', icon: Square, category: 'layout', defaultProps: { style: { padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' } } }
];

// 表单组件
const formComponents = [
  { id: 'form', type: 'form', label: '��单', icon: FileText, category: 'form', defaultProps: { method: 'POST', action: '', style: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' } } },
  { id: 'select', type: 'select', label: '下拉选择', icon: List, category: 'form', defaultProps: { options: ['选���1', '选项2', '选项3'], style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' } } },
  { id: 'checkbox', type: 'checkbox', label: '复选框', icon: Square, category: 'form', defaultProps: { label: '复选框选项', checked: false, style: { margin: '8px 0' } } },
  { id: 'radio', type: 'radio', label: '单选框', icon: Square, category: 'form', defaultProps: { name: 'radio-group', label: '单选框选项', style: { margin: '8px 0' } } },
  { id: 'file', type: 'file', label: '文件上传', icon: Upload, category: 'form', defaultProps: { accept: '*', style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' } } }
];

// 媒体组件
const mediaComponents = [
  { id: 'video', type: 'video', label: '视频', icon: Video, category: 'media', defaultProps: { src: '', controls: true, style: { width: '100%', maxWidth: '500px', borderRadius: '6px' } } },
  { id: 'audio', type: 'audio', label: '音频', icon: Music, category: 'media', defaultProps: { src: '', controls: true, style: { width: '100%', maxWidth: '400px' } } },
  { id: 'iframe', type: 'iframe', label: '嵌入页面', icon: ExternalLink, category: 'media', defaultProps: { src: '', style: { width: '100%', height: '300px', border: '1px solid #e5e7eb', borderRadius: '6px' } } }
];

// 图标组��
const iconComponents = [
  { id: 'icon-home', type: 'icon', label: '首页图标', icon: Home, category: 'icon', defaultProps: { iconType: 'home', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-user', type: 'icon', label: '用户图标', icon: User, category: 'icon', defaultProps: { iconType: 'user', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-mail', type: 'icon', label: '邮件图标', icon: Mail, category: 'icon', defaultProps: { iconType: 'mail', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-phone', type: 'icon', label: '电话图标', icon: Phone, category: 'icon', defaultProps: { iconType: 'phone', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-star', type: 'icon', label: '星星图标', icon: Star, category: 'icon', defaultProps: { iconType: 'star', style: { fontSize: '24px', color: '#fbbf24' } } },
  { id: 'icon-heart', type: 'icon', label: '心形图标', icon: Heart, category: 'icon', defaultProps: { iconType: 'heart', style: { fontSize: '24px', color: '#ef4444' } } }
];

// 所有组件
const allComponents = [
  ...basicComponents,
  ...layoutComponents,
  ...formComponents,
  ...mediaComponents,
  ...iconComponents
];

// 设备尺寸配置
const deviceSizes = {
  mobile: { name: '手机', icon: Smartphone, width: 375, height: 812 },
  tablet: { name: '平板', icon: Tablet, width: 768, height: 1024 },
  desktop: { name: '桌面', icon: Monitor, width: 1200, height: 800 }
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
      className={`p-3 border rounded-lg cursor-move bg-white hover:bg-gray-50 transition-colors group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon size={20} className="text-gray-600 group-hover:text-blue-600" />
        <span className="text-xs font-medium text-center">{component.label}</span>
      </div>
    </div>
  );
}

// 树形拖拽组件项
function DraggableTreeComponent({ component, isSelected = false, onDoubleClick }) {
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
      className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded cursor-move transition-colors group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
    >
      <div className={`w-4 h-4 rounded flex items-center justify-center ${
        isSelected ? 'bg-blue-500' : 'bg-gray-700 group-hover:bg-gray-600'
      }`}>
        <Icon className={`w-3 h-3 ${
          isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
        }`} />
      </div>
      <span className={`text-sm flex-1 ${
        isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
      }`}>
        {component.label}
      </span>
    </div>
  );
}

// 画布元素
function CanvasElement({ 
  element, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  isSelected, 
  children,
  path = []
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ELEMENT,
    item: { id: element.id, path },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.ELEMENT],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      
      if (item.component) {
        // 添加新组件到当前元素
        const newElement = {
          id: `element_${Date.now()}`,
          type: item.component.type,
          ...item.component.defaultProps,
        };
        
        if (element.type === 'container' || element.type === 'row' || element.type === 'column' || element.type === 'grid') {
          onUpdate({
            ...element,
            children: [...(element.children || []), newElement]
          });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element, path);
  };

  const renderElement = () => {
    const style = {
      ...element.style,
      position: 'relative',
      minHeight: ['container', 'row', 'column', 'grid', 'card'].includes(element.type) ? '50px' : 'auto',
    };

    const commonProps = {
      style,
      onClick: handleClick,
      className: `canvas-element ${isSelected ? 'selected' : ''} ${isOver ? 'drop-target' : ''}`,
    };

    switch (element.type) {
      case 'text':
        return <div {...commonProps}>{element.content || '文本内容'}</div>;
      
      case 'heading':
        const HeadingTag = element.level || 'h1';
        return <HeadingTag {...commonProps}>{element.content || '标题'}</HeadingTag>;
      
      case 'button':
        return (
          <button {...commonProps} type="button">
            {element.content || '按钮'}
          </button>
        );
      
      case 'input':
        return (
          <input
            {...commonProps}
            type={element.inputType || 'text'}
            placeholder={element.placeholder || '请输入内容'}
            defaultValue={element.value || ''}
            readOnly
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={element.placeholder || '请输入多行文本'}
            defaultValue={element.value || ''}
            readOnly
          />
        );
      
      case 'image':
        return (
          <img
            {...commonProps}
            src={element.src || 'https://via.placeholder.com/300x200'}
            alt={element.alt || '图片'}
          />
        );
      
      case 'link':
        return (
          <a {...commonProps} href={element.href || '#'}>
            {element.content || '链接文本'}
          </a>
        );
      
      case 'divider':
        return <hr {...commonProps} />;
      
      case 'container':
      case 'card':
        return (
          <div {...commonProps} ref={drop}>
            {element.children?.map((child, index) => (
              <CanvasElement
                key={child.id}
                element={child}
                onSelect={onSelect}
                onUpdate={(updatedChild) => {
                  const newChildren = [...(element.children || [])];
                  newChildren[index] = updatedChild;
                  onUpdate({ ...element, children: newChildren });
                }}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                isSelected={false}
                path={[...path, index]}
              />
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽组件到这里</div>}
          </div>
        );
      
      case 'row':
        return (
          <div {...commonProps} ref={drop}>
            {element.children?.map((child, index) => (
              <CanvasElement
                key={child.id}
                element={child}
                onSelect={onSelect}
                onUpdate={(updatedChild) => {
                  const newChildren = [...(element.children || [])];
                  newChildren[index] = updatedChild;
                  onUpdate({ ...element, children: newChildren });
                }}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                isSelected={false}
                path={[...path, index]}
              />
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽组件到这里</div>}
          </div>
        );
      
      case 'column':
        return (
          <div {...commonProps} ref={drop}>
            {element.children?.map((child, index) => (
              <CanvasElement
                key={child.id}
                element={child}
                onSelect={onSelect}
                onUpdate={(updatedChild) => {
                  const newChildren = [...(element.children || [])];
                  newChildren[index] = updatedChild;
                  onUpdate({ ...element, children: newChildren });
                }}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                isSelected={false}
                path={[...path, index]}
              />
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽组件到这里</div>}
          </div>
        );
      
      case 'grid':
        return (
          <div {...commonProps} ref={drop}>
            {element.children?.map((child, index) => (
              <CanvasElement
                key={child.id}
                element={child}
                onSelect={onSelect}
                onUpdate={(updatedChild) => {
                  const newChildren = [...(element.children || [])];
                  newChildren[index] = updatedChild;
                  onUpdate({ ...element, children: newChildren });
                }}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                isSelected={false}
                path={[...path, index]}
              />
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽组件到这里</div>}
          </div>
        );
      
      case 'form':
        return (
          <form {...commonProps} ref={drop}>
            {element.children?.map((child, index) => (
              <CanvasElement
                key={child.id}
                element={child}
                onSelect={onSelect}
                onUpdate={(updatedChild) => {
                  const newChildren = [...(element.children || [])];
                  newChildren[index] = updatedChild;
                  onUpdate({ ...element, children: newChildren });
                }}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                isSelected={false}
                path={[...path, index]}
              />
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽表单组件到这��</div>}
          </form>
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            {(element.options || ['选项1', '选项2']).map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label {...commonProps} className={`${commonProps.className} flex items-center gap-2 cursor-pointer`}>
            <input type="checkbox" defaultChecked={element.checked} readOnly />
            <span>{element.label || '复选框'}</span>
          </label>
        );
      
      case 'radio':
        return (
          <label {...commonProps} className={`${commonProps.className} flex items-center gap-2 cursor-pointer`}>
            <input type="radio" name={element.name} readOnly />
            <span>{element.label || '单选框'}</span>
          </label>
        );
      
      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            accept={element.accept || '*'}
            readOnly
          />
        );
      
      case 'video':
        return (
          <video {...commonProps} controls={element.controls} src={element.src}>
            您的浏览器不支持视频标签。
          </video>
        );
      
      case 'audio':
        return (
          <audio {...commonProps} controls={element.controls} src={element.src}>
            您的浏览器不支持音频标签。
          </audio>
        );
      
      case 'iframe':
        return (
          <iframe
            {...commonProps}
            src={element.src}
            frameBorder="0"
            title="嵌入内容"
          />
        );
      
      case 'icon':
        const iconMap = {
          home: Home,
          user: User,
          mail: Mail,
          phone: Phone,
          star: Star,
          heart: Heart,
        };
        const IconComponent = iconMap[element.iconType] || Home;
        return (
          <div {...commonProps}>
            <IconComponent size={24} />
          </div>
        );
      
      default:
        return <div {...commonProps}>未知组件类型: {element.type}</div>;
    }
  };

  return (
    <div
      ref={drag}
      className={`relative ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {renderElement()}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none">
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {element.type}
          </div>
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(element);
              }}
            >
              <Copy size={12} />
            </button>
            <button
              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 画布组件
function Canvas({
  elements,
  selectedElement,
  selectedPath,
  onAddElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  deviceMode = 'desktop',
  onDeviceChange
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.COMPONENT, ItemTypes.ELEMENT],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;

      if (item.component) {
        onAddElement(item.component);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const device = deviceSizes[deviceMode];
  const canvasStyle = {
    width: deviceMode === 'desktop' ? '100%' : `${device.width}px`,
    minHeight: deviceMode === 'desktop' ? '600px' : `${device.height}px`,
    maxWidth: '100%',
    margin: '0 auto',
    transform: deviceMode === 'mobile' ? 'scale(0.8)' : deviceMode === 'tablet' ? 'scale(0.9)' : 'scale(1)',
    transformOrigin: 'top center',
  };

  return (
    <div className="flex-1 bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        {/* 浏览器顶栏 */}
        <div className="bg-gray-50 border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4 flex items-center bg-white rounded px-3 py-1 text-sm border">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">preview.mywebsite.com</span>
              </div>
            </div>
            
            {/* 设备切换 */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border">
              {Object.entries(deviceSizes).map(([key, device]) => {
                const Icon = device.icon;
                return (
                  <button
                    key={key}
                    onClick={() => onDeviceChange && onDeviceChange(key)}
                    className={`p-2 rounded transition-colors ${
                      deviceMode === key ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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

        {/* 画布内容 */}
        <div 
          ref={drop}
          className={`bg-white p-6 ${isOver ? 'bg-blue-50' : ''}`}
          style={canvasStyle}
          onClick={() => onSelectElement(null, [])}
        >
          <div className="space-y-4 min-h-full">
            {elements.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <div className="text-lg mb-2">🎨 开始设计你的网页</div>
                <div className="text-sm">从左侧拖拽组件到这里开始创建</div>
              </div>
            )}
            
            {elements.map((element, index) => (
              <CanvasElement
                key={element.id}
                element={element}
                onSelect={onSelectElement}
                onUpdate={(updatedElement) => onUpdateElement(index, updatedElement)}
                onDelete={onDeleteElement}
                onDuplicate={onDuplicateElement}
                isSelected={selectedElement?.id === element.id}
                path={[index]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 页面管理组件
function PageManager({ pages, setPages, activePage }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddPage, setShowAddPage] = useState(false);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [selectedPageForSettings, setSelectedPageForSettings] = useState(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageRoute, setNewPageRoute] = useState('');

  // 添加新页面
  const handleAddPage = () => {
    if (!newPageName.trim() || !newPageRoute.trim()) {
      alert('请输入页面名称和路由');
      return;
    }

    // 检查路由是否已存在
    if (pages.some(p => p.route === newPageRoute)) {
      alert('该路由已存在');
      return;
    }

    const newPage = {
      id: `page_${Date.now()}`,
      name: newPageName.trim(),
      route: newPageRoute.trim(),
      isActive: false,
      title: newPageName.trim(),
      description: '',
      keywords: ''
    };

    setPages(prev => [...prev, newPage]);
    setNewPageName('');
    setNewPageRoute('');
    setShowAddPage(false);
  };

  // 删除页面
  const handleDeletePage = (pageId) => {
    if (pages.length <= 1) {
      alert('至少需要保留一个页面');
      return;
    }

    if (confirm('确定要删除此页面吗？')) {
      setPages(prev => {
        const filteredPages = prev.filter(p => p.id !== pageId);
        // 如果删除的是当前活跃页面，激活第一个页面
        const deletedPage = prev.find(p => p.id === pageId);
        if (deletedPage?.isActive && filteredPages.length > 0) {
          filteredPages[0].isActive = true;
        }
        return filteredPages;
      });
    }
  };

  // 切换页面
  const handleSwitchPage = (pageId) => {
    setPages(prev => prev.map(p => ({ ...p, isActive: p.id === pageId })));
  };

  // 打开页面设置
  const handleOpenPageSettings = (page) => {
    setSelectedPageForSettings({ ...page });
    setShowPageSettings(true);
  };

  // 保存页面设置
  const handleSavePageSettings = () => {
    if (!selectedPageForSettings.name.trim()) {
      alert('页面名称不能为空');
      return;
    }

    setPages(prev => prev.map(p =>
      p.id === selectedPageForSettings.id ? selectedPageForSettings : p
    ));
    setShowPageSettings(false);
    setSelectedPageForSettings(null);
  };

  return (
    <>
      <div className="p-2">
        {/* 页面管理标题栏 */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-3 h-3 flex items-center justify-center hover:bg-gray-700 rounded"
            >
              <ChevronRight
                className={`w-3 h-3 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">页面</span>
            <span className="text-xs text-gray-500">({pages.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddPage(true)}
              className="w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded text-xs"
              title="添加页面"
            >
              <Plus className="w-3 h-3 text-gray-400 hover:text-gray-200" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded text-xs"
              title={isExpanded ? "收起" : "展开"}
            >
              <MoreHorizontal className="w-3 h-3 text-gray-400 hover:text-gray-200" />
            </button>
          </div>
        </div>

        {/* 页面列表 */}
        {isExpanded && (
          <div className="ml-3 space-y-1">
            {pages.map(page => (
              <div
                key={page.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 group ${
                  page.isActive ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  page.isActive ? 'bg-white' : 'bg-gray-600'
                }`}></div>
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSwitchPage(page.id)}
                >
                  <div className={`text-sm ${
                    page.isActive ? 'text-white font-medium' : 'text-gray-300'
                  }`}>
                    {page.name}
                  </div>
                  <div className={`text-xs ${
                    page.isActive ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {page.route}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPageSettings(page);
                    }}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-700 rounded"
                    title="页面设置"
                  >
                    <Settings className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      className="w-4 h-4 flex items-center justify-center hover:bg-red-600 rounded"
                      title="删除页面"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-200" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加页面对话框 */}
      <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加新页面</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">页面名称</Label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="关于我们"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">页面路由</Label>
              <Input
                value={newPageRoute}
                onChange={(e) => setNewPageRoute(e.target.value)}
                placeholder="/about"
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                路由必须以 / 开头，如：/about
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddPage(false)}>
                取消
              </Button>
              <Button onClick={handleAddPage}>
                添加
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 页面设置对话框 */}
      <Dialog open={showPageSettings} onOpenChange={setShowPageSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>页面设置</DialogTitle>
          </DialogHeader>
          {selectedPageForSettings && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm">页面名称</Label>
                <Input
                  value={selectedPageForSettings.name}
                  onChange={(e) => setSelectedPageForSettings({
                    ...selectedPageForSettings,
                    name: e.target.value
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">页面路由</Label>
                <Input
                  value={selectedPageForSettings.route}
                  onChange={(e) => setSelectedPageForSettings({
                    ...selectedPageForSettings,
                    route: e.target.value
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">页面标题 (SEO)</Label>
                <Input
                  value={selectedPageForSettings.title || ''}
                  onChange={(e) => setSelectedPageForSettings({
                    ...selectedPageForSettings,
                    title: e.target.value
                  })}
                  placeholder="页面的HTML标题"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">页面描述 (SEO)</Label>
                <Textarea
                  value={selectedPageForSettings.description || ''}
                  onChange={(e) => setSelectedPageForSettings({
                    ...selectedPageForSettings,
                    description: e.target.value
                  })}
                  placeholder="页面描述，用于搜索引擎优化"
                  className="mt-1 h-20"
                />
              </div>
              <div>
                <Label className="text-sm">关键词 (SEO)</Label>
                <Input
                  value={selectedPageForSettings.keywords || ''}
                  onChange={(e) => setSelectedPageForSettings({
                    ...selectedPageForSettings,
                    keywords: e.target.value
                  })}
                  placeholder="关键词，用逗号分隔"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPageSettings(false)}>
                  取消
                </Button>
                <Button onClick={handleSavePageSettings}>
                  保存
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// 元素树状图组件
function ElementTreeView({ elements, selectedElement, onSelectElement }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // 默认展开第一层元素
    const firstLevelIds = new Set<string>();
    elements.forEach(element => {
      if (element.children && element.children.length > 0) {
        firstLevelIds.add(element.id);
      }
    });
    return firstLevelIds;
  });

  const toggleNode = (elementId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(elementId)) {
      newExpanded.delete(elementId);
    } else {
      newExpanded.add(elementId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (elements: any[]) => {
      elements.forEach(element => {
        if (element.children && element.children.length > 0) {
          allIds.add(element.id);
          collectIds(element.children);
        }
      });
    };
    collectIds(elements);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // 递归渲染所有元素及其子元素
  const renderElementNode = (element: any, level: number = 0, path: number[] = []) => {
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedNodes.has(element.id);
    const isSelected = selectedElement?.id === element.id;

    return (
      <div key={element.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer ${
            isSelected ? 'bg-blue-100 text-blue-800' : ''
          }`}
          style={{ paddingLeft: `${8 + level * 12}px` }}
          onClick={() => onSelectElement(element, path)}
        >
          {hasChildren ? (
            <button
              className="w-3 h-3 flex items-center justify-center hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(element.id);
              }}
            >
              <ChevronRight
                className={`w-2 h-2 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <div className="w-3 h-3 flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          )}

          <span className={`font-mono text-purple-600 ${isSelected ? 'font-semibold' : ''}`}>
            {element.type}
          </span>

          {element.className && (
            <span className="text-green-600 text-xs">
              .{element.className}
            </span>
          )}

          {element.htmlId && (
            <span className="text-blue-600 text-xs">
              #{element.htmlId}
            </span>
          )}

          {element.content && typeof element.content === 'string' && element.content.trim().length > 0 && (
            <span className="text-gray-500 ml-1 truncate max-w-24 text-xs">
              "{element.content.substring(0, 15)}{element.content.length > 15 ? '...' : ''}"
            </span>
          )}

          {element.src && (
            <span className="text-orange-600 text-xs ml-1">
              src={element.src.substring(element.src.lastIndexOf('/') + 1, element.src.lastIndexOf('/') + 8)}...
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {element.children.map((child: any, index: number) =>
              renderElementNode(child, level + 1, [...path, index])
            )}
          </div>
        )}
      </div>
    );
  };

  // 统计总元素数量（包括嵌套）
  const countTotalElements = (elements: any[]): number => {
    let count = 0;
    elements.forEach(element => {
      count++;
      if (element.children && element.children.length > 0) {
        count += countTotalElements(element.children);
      }
    });
    return count;
  };

  return (
    <div className="w-64 h-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 cursor-move">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">页面结构</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs"
            title="展开全部"
          >
            <Plus className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={collapseAll}
            className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded text-xs"
            title="收起全部"
          >
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 树状结构 */}
      <div className="flex-1 overflow-y-auto p-2">
        {elements.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-xs">
            暂无元素
          </div>
        ) : (
          <div className="space-y-0.5">
            {elements.map((element) => renderElementNode(element))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="border-t bg-gray-50 px-3 py-2 text-xs text-gray-600">
        共 {countTotalElements(elements)} 个元素
      </div>
    </div>
  );
}

// ���件库面���
function ComponentLibrary({ pages, setPages }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']));
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpandMenu, setShowExpandMenu] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    const allCategoryIds = new Set(categories.map(cat => cat.id));
    setExpandedCategories(allCategoryIds);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExpandMenu && !(event.target as Element).closest('.expand-menu-container')) {
        setShowExpandMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExpandMenu]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        if (event.key === 'E') {
          event.preventDefault();
          expandAll();
        } else if (event.key === 'C') {
          event.preventDefault();
          collapseAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const categories = [
    { id: 'basic', label: '基础组件', icon: Type },
    { id: 'layout', label: '布局容器', icon: Layout },
    { id: 'form', label: '表单控件', icon: FileText },
    { id: 'media', label: '媒体元素', icon: Image },
    { id: 'icon', label: '图标组件', icon: Star }
  ];

  const filteredComponents = searchTerm
    ? allComponents.filter(comp => comp.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : allComponents;

  return (
    <div className="w-64 bg-gray-900 text-white border-r border-gray-700 flex flex-col h-full">

      {/* 搜索框 */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded text-xs px-6 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 页面管理 */}
      <div className="border-b border-gray-700">
        <PageManager
          pages={pages}
          setPages={setPages}
          activePage={pages.find(p => p.isActive)}
        />
      </div>

      {/* 图层面板 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* 图层标题 */}
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">图层</span>
            </div>
            <div className="relative expand-menu-container">
              <button
                onClick={() => setShowExpandMenu(!showExpandMenu)}
                className="w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded text-xs"
                title="展开收起选项"
              >
                <MoreHorizontal className="w-3 h-3 text-gray-400 hover:text-gray-200" />
              </button>

              {/* 下拉菜单 */}
              {showExpandMenu && (
                <div className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 min-w-48">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        expandAll();
                        setShowExpandMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="w-3 h-3" />
                        展开全部
                      </div>
                      <span className="text-xs text-gray-500">Ctrl+Shift+E</span>
                    </button>
                    <button
                      onClick={() => {
                        collapseAll();
                        setShowExpandMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Minus className="w-3 h-3" />
                        收起全部
                      </div>
                      <span className="text-xs text-gray-500">Ctrl+Shift+C</span>
                    </button>
                    <hr className="border-gray-600 my-1" />
                    <button
                      onClick={() => {
                        // 切换当前状态（如果全部展开则收起，否则展开）
                        if (expandedCategories.size === categories.length) {
                          collapseAll();
                        } else {
                          expandAll();
                        }
                        setShowExpandMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3 h-3" />
                      切换状态
                    </button>
                    <hr className="border-gray-600 my-1" />
                    <div className="px-3 py-1.5 text-xs text-gray-500">
                      {expandedCategories.size}/{categories.length} 已展开
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 分类树结构 */}
          <div className="space-y-1">
            {categories.map(category => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.has(category.id);
              const categoryComponents = filteredComponents.filter(comp => comp.category === category.id);

              return (
                <div key={category.id}>
                  {/* 分类标题 */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded cursor-pointer group"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <button className="w-3 h-3 flex items-center justify-center">
                      <ChevronRight
                        className={`w-3 h-3 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    <div className="w-4 h-4 bg-gray-700 rounded flex items-center justify-center">
                      <Icon className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-300 flex-1">{category.label}</span>
                  </div>

                  {/* 展开的组件列表 */}
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5">
                      {categoryComponents.map(component => (
                        <DraggableTreeComponent key={component.id} component={component} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 属性编辑器
function PropertyEditor({ selectedElement, onUpdateElement }) {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l p-4 overflow-y-auto">
        <div className="text-center text-gray-400 py-8">
          <Settings size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">选择一个组件来编辑属性</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property, value) => {
    onUpdateElement({
      ...selectedElement,
      [property]: value
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
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            属性编辑器
          </h3>
          <Badge variant="outline" className="mb-4">{selectedElement.type}</Badge>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" className="text-xs">内容</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">样式</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">高级</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4 mt-4">
            {/* 文本内容 */}
            {(['text', 'heading', 'button', 'link'].includes(selectedElement.type)) && (
              <div>
                <Label className="text-xs">文本内容</Label>
                <Input
                  value={selectedElement.content || ''}
                  onChange={(e) => handlePropertyChange('content', e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            )}
            
            {/* 标题级别 */}
            {selectedElement.type === 'heading' && (
              <div>
                <Label className="text-xs">标题级别</Label>
                <Select
                  value={selectedElement.level || 'h1'}
                  onValueChange={(value) => handlePropertyChange('level', value)}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">H1</SelectItem>
                    <SelectItem value="h2">H2</SelectItem>
                    <SelectItem value="h3">H3</SelectItem>
                    <SelectItem value="h4">H4</SelectItem>
                    <SelectItem value="h5">H5</SelectItem>
                    <SelectItem value="h6">H6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* 输入框属性 */}
            {(['input', 'textarea'].includes(selectedElement.type)) && (
              <>
                <div>
                  <Label className="text-xs">占位符</Label>
                  <Input
                    value={selectedElement.placeholder || ''}
                    onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                {selectedElement.type === 'input' && (
                  <div>
                    <Label className="text-xs">输入类型</Label>
                    <Select
                      value={selectedElement.inputType || 'text'}
                      onValueChange={(value) => handlePropertyChange('inputType', value)}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">文本</SelectItem>
                        <SelectItem value="email">邮箱</SelectItem>
                        <SelectItem value="password">密码</SelectItem>
                        <SelectItem value="number">数字</SelectItem>
                        <SelectItem value="tel">����话</SelectItem>
                        <SelectItem value="url">网址</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            
            {/* 图片属性 */}
            {selectedElement.type === 'image' && (
              <>
                <div>
                  <Label className="text-xs">图片地址</Label>
                  <Input
                    value={selectedElement.src || ''}
                    onChange={(e) => handlePropertyChange('src', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-xs">替代文本</Label>
                  <Input
                    value={selectedElement.alt || ''}
                    onChange={(e) => handlePropertyChange('alt', e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </>
            )}
            
            {/* 链接属性 */}
            {selectedElement.type === 'link' && (
              <div>
                <Label className="text-xs">链接地址</Label>
                <Input
                  value={selectedElement.href || ''}
                  onChange={(e) => handlePropertyChange('href', e.target.value)}
                  className="mt-1 h-8 text-xs"
                  placeholder="https://..."
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4 mt-4">
            {/* 布局 */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">布局</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">宽度</Label>
                  <Input
                    value={selectedElement.style?.width || ''}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">高度</Label>
                  <Input
                    value={selectedElement.style?.height || ''}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="auto"
                  />
                </div>
              </div>
            </div>
            
            {/* 文字 */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">文字</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">字体大小</Label>
                  <Input
                    value={selectedElement.style?.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="16px"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">字体粗细</Label>
                  <Select
                    value={selectedElement.style?.fontWeight || 'normal'}
                    onValueChange={(value) => handleStyleChange('fontWeight', value)}
                  >
                    <SelectTrigger className="mt-1 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">正常</SelectItem>
                      <SelectItem value="bold">粗体</SelectItem>
                      <SelectItem value="lighter">细体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">文字颜色</Label>
                  <Input
                    type="color"
                    value={selectedElement.style?.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">文字对齐</Label>
                  <Select
                    value={selectedElement.style?.textAlign || 'left'}
                    onValueChange={(value) => handleStyleChange('textAlign', value)}
                  >
                    <SelectTrigger className="mt-1 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">左对齐</SelectItem>
                      <SelectItem value="center">居中</SelectItem>
                      <SelectItem value="right">右对齐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* 背景和边框 */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">背景和边框</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">���景色</Label>
                  <Input
                    type="color"
                    value={selectedElement.style?.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">圆角</Label>
                  <Input
                    value={selectedElement.style?.borderRadius || ''}
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
            
            {/* 间距 */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">间距</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">内边距</Label>
                  <Input
                    value={selectedElement.style?.padding || ''}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">外边距</Label>
                  <Input
                    value={selectedElement.style?.margin || ''}
                    onChange={(e) => handleStyleChange('margin', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs">CSS 类名</Label>
              <Input
                value={selectedElement.className || ''}
                onChange={(e) => handlePropertyChange('className', e.target.value)}
                className="mt-1 h-8 text-xs"
                placeholder="my-class"
              />
            </div>
            
            <div>
              <Label className="text-xs">元素 ID</Label>
              <Input
                value={selectedElement.htmlId || ''}
                onChange={(e) => handlePropertyChange('htmlId', e.target.value)}
                className="mt-1 h-8 text-xs"
                placeholder="my-id"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 主编���器组件
export function WebEditor() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [siteName, setSiteName] = useState('我的网站');
  const [pages, setPages] = useState([
    { id: 'home', name: '首页', route: '/', isActive: true }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showElementTree, setShowElementTree] = useState(true);
  
  // 添加元素到画布
  const handleAddElement = useCallback((component) => {
    const newElement = {
      id: `element_${Date.now()}`,
      type: component.type,
      ...component.defaultProps,
    };
    setElements(prev => [...prev, newElement]);
  }, []);
  
  // 选择元素
  const handleSelectElement = useCallback((element, path) => {
    setSelectedElement(element);
    setSelectedPath(path);
  }, []);
  
  // 更新元素
  const handleUpdateElement = useCallback((index, updatedElement) => {
    setElements(prev => {
      const newElements = [...prev];
      newElements[index] = updatedElement;
      return newElements;
    });
    
    if (selectedElement?.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
  }, [selectedElement]);
  
  // 删除元素
  const handleDeleteElement = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
      setSelectedPath([]);
    }
  }, [selectedElement]);
  
  // 复制元素
  const handleDuplicateElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: `element_${Date.now()}`,
    };
    setElements(prev => [...prev, newElement]);
  }, []);
  
  // 保存项目
  const handleSave = async () => {
    try {
      const projectData = {
        siteName,
        pages,
        elements,
        css: '', // ��以后续添加CSS编辑功能
        js: ''   // 可以后��添加JS编辑功能
      };

      const response = await fetch('/api/page/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (result.success) {
        // 同时保存到���地作为备份
        localStorage.setItem('web_builder_project', JSON.stringify(projectData));
        alert(`项目保存成功！项目ID: ${result.data.id}`);
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert(`保存失败: ${error.message}`);
      // 失败时仍然保存到本地
      const projectData = { siteName, pages, elements };
      localStorage.setItem('web_builder_project', JSON.stringify(projectData));
    }
  };
  
  // 导出 ZIP 包
  const handleExport = async () => {
    try {
      // 首先保存项目获��ID
      const projectData = {
        siteName,
        pages,
        elements,
        css: '',
        js: ''
      };

      const saveResponse = await fetch('/api/page/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const saveResult = await saveResponse.json();

      if (!saveResult.success) {
        throw new Error('保存项目失败，无法导出');
      }

      // 使用项目ID导出ZIP包
      const exportResponse = await fetch(`/api/page/export?id=${saveResult.data.id}`);

      if (!exportResponse.ok) {
        throw new Error('导出失败');
      }

      // 下载ZIP文件
      const blob = await exportResponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${siteName}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      alert('导出成功！已下载ZIP包');
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败: ${error.message}`);

      // 失败时使用本地导出
      const generateHTML = () => {
        const elementsHTML = elements.map(el => {
          return `<div style="${Object.entries(el.style || {}).map(([k, v]) => `${k}: ${v}`).join('; ')}">${el.content || el.type}</div>`;
        }).join('\n');

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
</head>
<body>
  ${elementsHTML}
</body>
</html>`;
      };

      const html = generateHTML();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${siteName}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  // 一键发布
  const handlePublish = async () => {
    if (!siteName.trim()) {
      alert('请输入���站名称');
      return;
    }

    try {
      // 首先保存项目
      const projectData = {
        siteName,
        pages,
        elements,
        css: '',
        js: ''
      };

      const saveResponse = await fetch('/api/page/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const saveResult = await saveResponse.json();

      if (!saveResult.success) {
        throw new Error('保存项目失败，无法发布');
      }

      // 发布项目
      const publishResponse = await fetch('/api/page/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: saveResult.data.id,
          deployConfig: {
            platform: 'auto', // 自动选择平台
            domain: siteName.toLowerCase().replace(/\s+/g, '-')
          }
        })
      });

      const publishResult = await publishResponse.json();

      if (publishResult.success) {
        alert(`🚀 发布成功！\n\n网站名称: ${publishResult.data.siteName}\n访问地址: ${publishResult.data.deployUrl}\n发布时间: ${new Date(publishResult.data.publishedAt).toLocaleString('zh-CN')}`);
      } else {
        throw new Error(publishResult.message || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert(`发布失败: ${error.message}\n\n请检查网络连接或联系管理员`);
    }
  };

  // 加载项目列表
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/page/list?limit=20');
      const result = await response.json();

      if (result.success) {
        setSavedProjects(result.data.pages);
      } else {
        console.error('加载项目列表失败:', result.message);
      }
    } catch (error) {
      console.error('加载项目列表�����:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载指定项目
  const loadProject = async (projectId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/page/${projectId}`);
      const result = await response.json();

      if (result.success) {
        const project = result.data;
        setSiteName(project.siteName);
        setElements(project.elements || []);
        setPages(project.pages || [{ id: 'home', name: '首页', route: '/', isActive: true }]);
        setShowProjectManager(false);
        alert(`项目 "${project.siteName}" 加载成功！`);
      } else {
        alert('加载项目失败: ' + result.message);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
      alert('加载项目失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 新建项目
  const newProject = () => {
    if (elements.length > 0 && !confirm('当前有未保存的内容，确定要新建项目吗？')) {
      return;
    }

    setSiteName('我的网站');
    setElements([]);
    setSelectedElement(null);
    setSelectedPath([]);
    setPages([{ id: 'home', name: '首页', route: '/', isActive: true }]);
    setShowProjectManager(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-40 h-8 text-sm"
              placeholder="网站名称"
            />
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {Object.entries(deviceSizes).map(([key, device]) => {
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
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={newProject}>
              <Plus className="w-4 h-4 mr-2" />
              ��建
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowProjectManager(true); loadProjects(); }}>
              <FileText className="w-4 h-4 mr-2" />
              项目
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? '编辑' : '预览'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowElementTree(!showElementTree)}>
              <Layers className="w-4 h-4 mr-2" />
              {showElementTree ? '隐藏' : '显示'}结构
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? '保存中...' : '保存'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              导出ZIP
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={isLoading || !siteName.trim()}>
              <Globe className="w-4 h-4 mr-2" />
              {isLoading ? '发布中...' : '发布'}
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
                <span className="text-gray-600">元素:</span>
                <span className="font-mono font-medium">{elements.length}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700">API已连接</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 主要编辑区域 */}
        <div className="flex-1 flex relative">
          {!showPreview && <ComponentLibrary />}

          <Canvas
            elements={elements}
            selectedElement={selectedElement}
            selectedPath={selectedPath}
            onAddElement={handleAddElement}
            onSelectElement={handleSelectElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            deviceMode={deviceMode}
            onDeviceChange={setDeviceMode}
          />

          {!showPreview && (
            <PropertyEditor
              selectedElement={selectedElement}
              onUpdateElement={(updatedElement) => {
                const index = elements.findIndex(el => el.id === updatedElement.id);
                if (index !== -1) {
                  handleUpdateElement(index, updatedElement);
                }
              }}
            />
          )}

          {/* 右下角元素树状图 */}
          {!showPreview && showElementTree && (
            <div className="absolute bottom-4 right-4 z-10">
              <ElementTreeView
                elements={elements}
                selectedElement={selectedElement}
                onSelectElement={handleSelectElement}
              />
            </div>
          )}
        </div>
      </div>

      {/* 项目管理对话框 */}
      <Dialog open={showProjectManager} onOpenChange={setShowProjectManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              项目管理
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={newProject} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  新建项目
                </Button>
                <Button onClick={loadProjects} variant="outline" size="sm" disabled={isLoading}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  刷新列表
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                共 {savedProjects.length} 个项目
              </div>
            </div>

            {/* 项目列表 */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : savedProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">暂无保存的项目</div>
                <Button onClick={newProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建第一个项目
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.siteName}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>元素: {project.elementsCount}</span>
                            <span>��面: {project.pagesCount}</span>
                          </div>
                        </div>
                        <Badge
                          variant={project.status === 'published' ? 'default' : 'secondary'}
                          className={project.status === 'published' ? 'bg-green-500' : ''}
                        >
                          {project.status === 'published' ? '已发布' : '草稿'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>创建时间: {new Date(project.createdAt).toLocaleString('zh-CN')}</div>
                        <div>更新时间: {new Date(project.updatedAt).toLocaleString('zh-CN')}</div>
                        {project.publishedAt && (
                          <div>发布时间: {new Date(project.publishedAt).toLocaleString('zh-CN')}</div>
                        )}
                        {project.deployUrl && (
                          <div className="flex items-center gap-2">
                            <span>访问地址:</span>
                            <a
                              href={project.deployUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              {project.deployUrl}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          onClick={() => loadProject(project.id)}
                          size="sm"
                          disabled={isLoading}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          编辑
                        </Button>
                        {project.deployUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(project.deployUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            访问
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .canvas-element {
          transition: all 0.2s ease;
        }
        
        .canvas-element:hover {
          outline: 1px dashed #3b82f6;
        }
        
        .canvas-element.selected {
          outline: 2px solid #3b82f6 !important;
        }
        
        .drop-target {
          background-color: #eff6ff;
          outline: 2px dashed #3b82f6;
        }
      `}</style>
    </DndProvider>
  );
}
