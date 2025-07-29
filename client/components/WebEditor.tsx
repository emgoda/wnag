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
  { id: 'form', type: 'form', label: '表单', icon: FileText, category: 'form', defaultProps: { method: 'POST', action: '', style: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' } } },
  { id: 'select', type: 'select', label: '下拉选择', icon: List, category: 'form', defaultProps: { options: ['选项1', '选项2', '选项3'], style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' } } },
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

// 图标组件
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
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽表单组件到这里</div>}
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
  deviceMode = 'desktop'
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

// 组件库面板
function ComponentLibrary() {
  const [activeCategory, setActiveCategory] = useState('basic');
  
  const categories = [
    { id: 'basic', label: '基础', icon: Type },
    { id: 'layout', label: '布局', icon: Layout },
    { id: 'form', label: '表单', icon: FileText },
    { id: 'media', label: '媒体', icon: Image },
    { id: 'icon', label: '图标', icon: Star }
  ];

  const filteredComponents = allComponents.filter(comp => comp.category === activeCategory);

  return (
    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          组件库
        </h3>
        
        {/* 分类选择 */}
        <div className="flex flex-wrap gap-1 mb-4">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {category.label}
              </button>
            );
          })}
        </div>
        
        {/* 组件列表 */}
        <div className="grid grid-cols-2 gap-2">
          {filteredComponents.map(component => (
            <DraggableComponent key={component.id} component={component} />
          ))}
        </div>
      </div>
      
      {/* 搜索框 */}
      <div className="mt-6 pt-4 border-t">
        <Label className="text-xs font-medium text-gray-600 mb-2 block">搜索组件</Label>
        <Input
          placeholder="搜索..."
          className="h-8 text-xs"
        />
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
                        <SelectItem value="tel">电话</SelectItem>
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
                  <Label className="text-xs text-gray-600">背景色</Label>
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

// 主编辑器组件
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
        css: '', // 可以后续添加CSS编辑功能
        js: ''   // 可以后续添加JS编辑功能
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
        // 同时保存到本地作为备份
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
      // 首先保存项目获取ID
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
  
  // 发布
  const handlePublish = () => {
    alert('发布功能开发中...');
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
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? '编辑' : '预览'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出HTML
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <Globe className="w-4 h-4 mr-2" />
              发布
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
              <span className="text-gray-600">元素:</span>
              <span className="font-mono font-medium">{elements.length}</span>
            </div>
          </div>
        </div>
        
        {/* 主要编辑区域 */}
        <div className="flex-1 flex">
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
        </div>
      </div>
      
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
