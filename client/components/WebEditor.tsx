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
  Bold, Italic, Underline, Link2, ExternalLink, Maximize, Minimize, Minus,
  Shield
} from 'lucide-react';
import AccountCheckFlow from './AccountCheckFlow';

// 定义拖拽项目类型
const ItemTypes = {
  COMPONENT: 'component',
  ELEMENT: 'element'
};

// 基础组件库
const basicComponents = [
  { id: 'text', type: 'text', label: '文��', icon: Type, category: 'basic', defaultProps: { content: '文本内���', style: { fontSize: '16px', color: '#333' } } },
  { id: 'heading', type: 'heading', label: '标题', icon: Type, category: 'basic', defaultProps: { content: '页面标题', level: 'h1', style: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' } } },
  { id: 'button', type: 'button', label: '按钮', icon: MousePointer, category: 'basic', defaultProps: { content: '点击按钮', style: { backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none' } } },
  { id: 'input', type: 'input', label: '输入框', icon: Edit3, category: 'basic', defaultProps: { placeholder: '请输入内容', inputType: 'text', style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' } } },
  { id: 'textarea', type: 'textarea', label: '文本域', icon: Edit3, category: 'basic', defaultProps: { placeholder: '请输入多行文本', style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '300px', height: '80px', resize: 'vertical' } } },
  { id: 'image', type: 'image', label: '图片', icon: Image, category: 'basic', defaultProps: { src: 'https://via.placeholder.com/300x200', alt: '图片', style: { maxWidth: '100%', height: 'auto', borderRadius: '6px' } } },
  { id: 'link', type: 'link', label: '链接', icon: Link2, category: 'basic', defaultProps: { content: '链接文本', href: '#', style: { color: '#3b82f6', textDecoration: 'underline' } } },
  { id: 'divider', type: 'divider', label: '分割���', icon: Minus, category: 'basic', defaultProps: { style: { height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0', border: 'none' } } }
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
  { id: 'form', type: 'form', label: '����', icon: FileText, category: 'form', defaultProps: { method: 'POST', action: '', style: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' } } },
  { id: 'select', type: 'select', label: '下拉选择', icon: List, category: 'form', defaultProps: { options: ['选���1', '选项2', '选项3'], style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '200px' } } },
  { id: 'checkbox', type: 'checkbox', label: '复选��', icon: Square, category: 'form', defaultProps: { label: '复����选项', checked: false, style: { margin: '8px 0' } } },
  { id: 'radio', type: 'radio', label: '单��框', icon: Square, category: 'form', defaultProps: { name: 'radio-group', label: '单选框选项', style: { margin: '8px 0' } } },
  { id: 'file', type: 'file', label: '文件上��', icon: Upload, category: 'form', defaultProps: { accept: '*', style: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' } } }
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
  { id: 'icon-user', type: 'icon', label: '���户���标', icon: User, category: 'icon', defaultProps: { iconType: 'user', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-mail', type: 'icon', label: '邮件图标', icon: Mail, category: 'icon', defaultProps: { iconType: 'mail', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-phone', type: 'icon', label: '电话图标', icon: Phone, category: 'icon', defaultProps: { iconType: 'phone', style: { fontSize: '24px', color: '#6b7280' } } },
  { id: 'icon-star', type: 'icon', label: '星��图标', icon: Star, category: 'icon', defaultProps: { iconType: 'star', style: { fontSize: '24px', color: '#fbbf24' } } },
  { id: 'icon-heart', type: 'icon', label: '心形图标', icon: Heart, category: 'icon', defaultProps: { iconType: 'heart', style: { fontSize: '24px', color: '#ef4444' } } }
];

// 自定义组件
const customComponents = [
  {
    id: 'account-check-flow',
    type: 'account-check-flow',
    label: '账户检查流程',
    icon: Shield,
    category: 'custom',
    defaultProps: {
      title: "账户异常处理中心",
      phoneLabel: "手机号",
      phonePlaceholder: "请输入手机号",
      startButton: "开始查询",
      warningText: "系统检测到该���号存在异常行为",
      warningItem1: "多次登录失败",
      warningItem2: "密码输入错误超过安全阈值",
      warningItem3: "存在可疑交易记��",
      continueButton: "继续解除异常",
      nameLabel: "姓名",
      idLabel: "身份证号",
      emailLabel: "邮箱",
      submitButton: "提��",
      successMessage: "提交成功",
      buttonColor: "bg-blue-600",
      warningColor: "text-red-600",
      submitColor: "bg-green-600",
      style: {
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }
    }
  }
];

// 所有组件
const allComponents = [
  ...basicComponents,
  ...layoutComponents,
  ...formComponents,
  ...mediaComponents,
  ...iconComponents,
  ...customComponents
];

// 设备尺寸��置
const deviceSizes = {
  mobile: { name: '手机', icon: Smartphone, width: 375, height: 812 },
  tablet: { name: '平板', icon: Tablet, width: 768, height: 1024 },
  desktop: { name: '桌面', icon: Monitor, width: 1200, height: 800 }
};

// ���拽组件项
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
            )) || <div className="text-gray-400 text-center py-8 text-sm">��拽组件到这���</div>}
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
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽����件到这里</div>}
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
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽组���到这里</div>}
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
            )) || <div className="text-gray-400 text-center py-8 text-sm">拖拽组件��这里</div>}
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
            title="���入内容"
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

      case 'account-check-flow':
        return (
          <div {...commonProps}>
            <AccountCheckFlow
              title={element.title}
              phoneLabel={element.phoneLabel}
              phonePlaceholder={element.phonePlaceholder}
              startButton={element.startButton}
              warningText={element.warningText}
              warningItem1={element.warningItem1}
              warningItem2={element.warningItem2}
              warningItem3={element.warningItem3}
              continueButton={element.continueButton}
              nameLabel={element.nameLabel}
              idLabel={element.idLabel}
              emailLabel={element.emailLabel}
              submitButton={element.submitButton}
              successMessage={element.successMessage}
              buttonColor={element.buttonColor}
              warningColor={element.warningColor}
              submitColor={element.submitColor}
            />
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
        {/* 浏览器顶��� */}
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
                <div className="text-lg mb-2">🎨 ��始设计你的网页</div>
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
function PageManager({ pages, setPages, activePage, onSwitchPage }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddPage, setShowAddPage] = useState(false);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showImportPage, setShowImportPage] = useState(false);
  const [showZipGuide, setShowZipGuide] = useState(false);
  const [selectedPageForSettings, setSelectedPageForSettings] = useState(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageRoute, setNewPageRoute] = useState('');
  const [importType, setImportType] = useState('json');
  const [importContent, setImportContent] = useState('');

  // 添加新页面
  const handleAddPage = () => {
    if (!newPageName.trim() || !newPageRoute.trim()) {
      alert('�����输入页面名称和路由');
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

    if (confirm('确定要删��此页面吗？')) {
      setPages(prev => {
        const filteredPages = prev.filter(p => p.id !== pageId);
        // 如果删除的是当前活跃页面，激���第一个页面
        const deletedPage = prev.find(p => p.id === pageId);
        if (deletedPage?.isActive && filteredPages.length > 0) {
          filteredPages[0].isActive = true;
        }
        return filteredPages;
      });
    }
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

  // 处理文件导入
  const handleFileImport = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 如果只有一个ZIP��件，显示ZIP指南
    if (files.length === 1 && files[0].name.endsWith('.zip')) {
      handleZipImport(files[0]);
      return;
    }

    let importedCount = 0;
    let failedFiles = [];
    let processedFiles = [];

    for (const file of files) {
      try {
        const content = await readFileAsText(file);

        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          if (file.name.includes('project')) {
            // 项目结构配置文件
            const data = JSON.parse(content);
            handleImportProjectStructure(JSON.stringify(data));
            processedFiles.push(`${file.name} (项目配置)`);
          } else {
            // 普通JSON配置
            const data = JSON.parse(content);
            handleImportFromJSON(data);
            processedFiles.push(`${file.name} (JSON页面)`);
            importedCount++;
          }
        } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
          // HTML文件导入 - 检测是否为SingleFile格式
          if (isSingleFileFormat(content)) {
            handleImportSingleFile(content);
            processedFiles.push(`${file.name} (SingleFile页面)`);
          } else {
            handleImportFromHTML(content, file.name);
            processedFiles.push(`${file.name} (HTML页面)`);
          }
          importedCount++;
        } else if (file.name.endsWith('.jsx') || file.name.endsWith('.tsx')) {
          // React组件文件
          handleImportReactComponent(content);
          processedFiles.push(`${file.name} (React组件)`);
          importedCount++;
        } else if (file.name.endsWith('.vue')) {
          // Vue组件文件
          handleImportVueComponent(content);
          processedFiles.push(`${file.name} (Vue组件)`);
          importedCount++;
        } else if (file.name.endsWith('.ts') && content.includes('@Component')) {
          // Angular组件文件
          handleImportAngularComponent(content);
          processedFiles.push(`${file.name} (Angular组件)`);
          importedCount++;
        } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
          // 原生JavaScript文件
          handleImportJavaScript(content);
          processedFiles.push(`${file.name} (JavaScript)`);
          importedCount++;
        } else {
          failedFiles.push(`${file.name} (不支持的格式)`);
        }
      } catch (error) {
        console.error(`处理文���� ${file.name} 时出错:`, error);
        failedFiles.push(`${file.name} (处理失败: ${error.message})`);
      }
    }

    // �������量导入结果
    let resultMessage = `批量文件导入完成！

����功处理 ${processedFiles.length} 个文件：
${processedFiles.map(file => `✅ ${file}`).join('\n')}

创建页面：${importedCount} 个`;

    if (failedFiles.length > 0) {
      resultMessage += `\n\n处�����败 ${failedFiles.length} 个文件���
${failedFiles.map(file => `❌ ${file}`).join('\n')}`;
    }

    alert(resultMessage);

    // 清空文件输入
    event.target.value = '';
  };

  // 读取文件为文本
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        console.log('文件读取完成:', {
          fileName: file.name,
          fileSize: file.size,
          contentLength: content.length,
          isHTML: content.includes('<html'),
          hasBase64Images: content.includes('data:image/')
        });
        resolve(content);
      };
      reader.onerror = () => reject(new Error('文件读取���败'));
      // 使用UTF-8编码读取，确保中文和特殊字符正确
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 从JSON导入页面
  const handleImportFromJSON = (data) => {
    try {
      if (data.pages && Array.isArray(data.pages)) {
        // 导入多个页����
        const newPages = data.pages.map(page => ({
          ...page,
          id: `page_${Date.now()}_${Math.random()}`,
          isActive: false
        }));
        setPages(prev => [...prev, ...newPages]);
        alert(`成功导入 ${newPages.length} 个页���`);
      } else if (data.name && data.route) {
        // ���入单个页面
        const newPage = {
          ...data,
          id: `page_${Date.now()}`,
          isActive: false
        };
        setPages(prev => [...prev, newPage]);
        alert('页面导入成功');
      } else {
        alert('JSON格式不正确，请���保包含页面数据');
      }
      setShowImportPage(false);
    } catch (error) {
      alert('导入失败：' + error.message);
    }
  };

  // 从HTML导入页面
  const handleImportFromHTML = (htmlContent, fileName) => {
    try {
      // 提取页面信息
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      const title = doc.querySelector('title')?.textContent || fileName.replace('.html', '');
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

      // 解析HTML结构转换为组件元素
      const elements = parseHTMLToElements(doc.body);

      const newPage = {
        id: `page_${Date.now()}`,
        name: title,
        route: `/${fileName.replace('.html', '').toLowerCase()}`,
        isActive: false,
        title: title,
        description: description,
        keywords: keywords,
        elements: elements
      };

      setPages(prev => [...prev, newPage]);
      alert('HTML页面导入成功');
      setShowImportPage(false);
    } catch (error) {
      alert('HTML解析失败：' + error.message);
    }
  };

  // 解析HTML元素为组件
  const parseHTMLToElements = (bodyElement) => {
    const elements = [];

    Array.from(bodyElement.children).forEach((child, index) => {
      const element = parseHTMLElement(child, index);
      if (element) elements.push(element);
    });

    return elements;
  };

  // 解析单个HTML元素
  const parseHTMLElement = (htmlElement, index) => {
    const tagName = htmlElement.tagName.toLowerCase();
    const id = `element_${Date.now()}_${index}`;

    // 获取样���
    const computedStyle = window.getComputedStyle ? window.getComputedStyle(htmlElement) : {};
    const style = {
      color: htmlElement.style.color || computedStyle.color,
      backgroundColor: htmlElement.style.backgroundColor || computedStyle.backgroundColor,
      fontSize: htmlElement.style.fontSize || computedStyle.fontSize,
      fontWeight: htmlElement.style.fontWeight || computedStyle.fontWeight,
      textAlign: htmlElement.style.textAlign || computedStyle.textAlign,
      padding: htmlElement.style.padding || computedStyle.padding,
      margin: htmlElement.style.margin || computedStyle.margin,
      width: htmlElement.style.width || computedStyle.width,
      height: htmlElement.style.height || computedStyle.height,
    };

    // 根据标签类型创建对应组件
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          id,
          type: 'heading',
          content: htmlElement.textContent,
          level: tagName,
          style
        };

      case 'p':
        return {
          id,
          type: 'text',
          content: htmlElement.textContent,
          style
        };

      case 'button':
        return {
          id,
          type: 'button',
          content: htmlElement.textContent,
          style
        };

      case 'img':
        return {
          id,
          type: 'image',
          src: htmlElement.src,
          alt: htmlElement.alt,
          style
        };

      case 'a':
        return {
          id,
          type: 'link',
          content: htmlElement.textContent,
          href: htmlElement.href,
          style
        };

      case 'input':
        return {
          id,
          type: 'input',
          inputType: htmlElement.type || 'text',
          placeholder: htmlElement.placeholder,
          style
        };

      case 'textarea':
        return {
          id,
          type: 'textarea',
          placeholder: htmlElement.placeholder,
          value: htmlElement.value,
          style
        };

      case 'div':
        const children = Array.from(htmlElement.children).map((child, i) =>
          parseHTMLElement(child, i)
        ).filter(Boolean);

        return {
          id,
          type: 'container',
          children,
          style
        };

      default:
        // 其他元素作为容器处理
        return {
          id,
          type: 'container',
          children: Array.from(htmlElement.children).map((child, i) =>
            parseHTMLElement(child, i)
          ).filter(Boolean),
          style
        };
    }
  };

  // 从文本内容导入
  const handleImportFromText = () => {
    if (!importContent.trim()) {
      alert('请输入��导入的内容');
      return;
    }

    try {
      if (importType === 'json') {
        const data = JSON.parse(importContent);
        handleImportFromJSON(data);
      } else if (importType === 'html') {
        handleImportFromHTML(importContent, 'imported.html');
      } else if (importType === 'spa') {
        handleImportSPA(importContent);
      } else if (importType === 'react') {
        handleImportReactComponent(importContent);
      } else if (importType === 'vue') {
        handleImportVueComponent(importContent);
      } else if (importType === 'angular') {
        handleImportAngularComponent(importContent);
      } else if (importType === 'js') {
        handleImportJavaScript(importContent);
      } else if (importType === 'project') {
        handleImportProjectStructure(importContent);
      } else if (importType === 'singlefile') {
        handleImportSingleFile(importContent);
      }
    } catch (error) {
      alert('导入失���：' + error.message);
    }
  };

  // 导入SPA配置
  const handleImportSPA = (content) => {
    try {
      const spaConfig = JSON.parse(content);

      if (spaConfig.routes && Array.isArray(spaConfig.routes)) {
        // SPA路由配置
        const newPages = spaConfig.routes.map((route, index) => ({
          id: `page_${Date.now()}_${index}`,
          name: route.name || route.path.replace('/', '') || 'Page',
          route: route.path,
          isActive: false,
          title: route.meta?.title || route.name,
          description: route.meta?.description || '',
          keywords: route.meta?.keywords || '',
          component: route.component,
          elements: route.elements || []
        }));

        setPages(prev => [...prev, ...newPages]);
        alert(`成功导入 ${newPages.length} 个SPA页面`);
      } else {
        alert('SPA配置格式不正确，请确保包含routes数组');
      }
      setShowImportPage(false);
    } catch (error) {
      alert('SPA导入失败：' + error.message);
    }
  };

  // 导入React组件
  const handleImportReactComponent = (content) => {
    try {
      // 解析React组件代码，提取组件信息
      const componentName = extractComponentName(content, 'react');
      const elements = parseReactComponent(content);

      const newPage = {
        id: `page_${Date.now()}`,
        name: componentName || 'React页面',
        route: `/${componentName?.toLowerCase() || 'react-page'}`,
        isActive: false,
        title: componentName || 'React页面',
        description: `从React组件导入的页面`,
        keywords: 'react, component',
        sourceCode: content,
        sourceType: 'react',
        elements: elements
      };

      setPages(prev => [...prev, newPage]);
      alert('React组件导入成功');
      setShowImportPage(false);

      // 自动切换到新导入的页��
      setTimeout(() => {
        onSwitchPage(newPage.id);
      }, 100);
    } catch (error) {
      alert('React组件导入失败：' + error.message);
    }
  };

  // 导入Vue组件
  const handleImportVueComponent = (content) => {
    try {
      const componentName = extractComponentName(content, 'vue');
      const elements = parseVueComponent(content);

      const newPage = {
        id: `page_${Date.now()}`,
        name: componentName || 'Vue页面',
        route: `/${componentName?.toLowerCase() || 'vue-page'}`,
        isActive: false,
        title: componentName || 'Vue页面',
        description: `从Vue组件导���的页面`,
        keywords: 'vue, component',
        sourceCode: content,
        sourceType: 'vue',
        elements: elements
      };

      setPages(prev => [...prev, newPage]);
      alert('Vue组件导入成功');
      setShowImportPage(false);

      // 自动切换到新导入的页面
      setTimeout(() => {
        onSwitchPage(newPage.id);
      }, 100);
    } catch (error) {
      alert('Vue组件导入失败：' + error.message);
    }
  };

  // 导入Angular组件
  const handleImportAngularComponent = (content) => {
    try {
      const componentName = extractComponentName(content, 'angular');
      const elements = parseAngularComponent(content);

      const newPage = {
        id: `page_${Date.now()}`,
        name: componentName || 'Angular页面',
        route: `/${componentName?.toLowerCase() || 'angular-page'}`,
        isActive: false,
        title: componentName || 'Angular页面',
        description: `从Angular组件导入的页面`,
        keywords: 'angular, component',
        sourceCode: content,
        sourceType: 'angular',
        elements: elements
      };

      setPages(prev => [...prev, newPage]);
      alert('Angular组件导入成功');
      setShowImportPage(false);

      // 自动切换到新导入的页面
      setTimeout(() => {
        onSwitchPage(newPage.id);
      }, 100);
    } catch (error) {
      alert('Angular组件导入失败：' + error.message);
    }
  };

  // 导入原生JavaScript
  const handleImportJavaScript = (content) => {
    try {
      const elements = parseJavaScriptCode(content);

      const newPage = {
        id: `page_${Date.now()}`,
        name: 'JavaScript页面',
        route: '/js-page',
        isActive: false,
        title: 'JavaScript页面',
        description: '从原生JavaScript代码导入的���面',
        keywords: 'javascript, vanilla js',
        sourceCode: content,
        sourceType: 'javascript',
        elements: elements
      };

      setPages(prev => [...prev, newPage]);
      alert('JavaScript代码导入成功');
      setShowImportPage(false);

      // 自动切换到��导入的页面
      setTimeout(() => {
        onSwitchPage(newPage.id);
      }, 100);
    } catch (error) {
      alert('JavaScript代码导入失败：' + error.message);
    }
  };

  // 提取组件名称
  const extractComponentName = (content, type) => {
    try {
      if (type === 'react') {
        // 匹配 function ComponentName 或 const ComponentName
        const match = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
        return match ? match[1] : null;
      } else if (type === 'vue') {
        // 匹配 name: 'ComponentName'
        const match = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
        return match ? match[1] : null;
      } else if (type === 'angular') {
        // 匹配 export class ComponentName
        const match = content.match(/export\s+class\s+([A-Z][a-zA-Z0-9]*)/);
        return match ? match[1] : null;
      }
    } catch (error) {
      console.error('提取组件名称失败:', error);
    }
    return null;
  };

  // 解析React组件
  const parseReactComponent = (content) => {
    // 简化解析：提取JSX中的基本元素
    const elements = [];

    // 查找JSX中��HTML标签
    const jsxContent = content.match(/return\s*\(([\s\S]*?)\);/)?.[1] || content.match(/<[\s\S]*>/)?.[0] || '';

    // 解��常见标��
    const tagMatches = jsxContent.match(/<(\w+)[^>]*>(.*?)<\/\1>/g) || [];

    tagMatches.forEach((tag, index) => {
      const tagType = tag.match(/<(\w+)/)?.[1];
      const content = tag.match(/>(.*?)</)?.[1]?.replace(/{[^}]*}/g, '').trim();

      if (tagType && content) {
        const element = createElementFromTag(tagType, content, `react_${index}`);
        if (element) elements.push(element);
      }
    });

    return elements.length > 0 ? elements : [
      {
        id: `element_${Date.now()}`,
        type: 'text',
        content: 'React组件已导���，请手动编辑内容',
        style: { fontSize: '16px', color: '#333' }
      }
    ];
  };

  // 解析Vue组件
  const parseVueComponent = (content) => {
    const elements = [];

    // 提取template部分
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      const templateContent = templateMatch[1];
      const tagMatches = templateContent.match(/<(\w+)[^>]*>(.*?)<\/\1>/g) || [];

      tagMatches.forEach((tag, index) => {
        const tagType = tag.match(/<(\w+)/)?.[1];
        const content = tag.match(/>(.*?)</)?.[1]?.replace(/{{[^}]*}}/g, '').trim();

        if (tagType && content) {
          const element = createElementFromTag(tagType, content, `vue_${index}`);
          if (element) elements.push(element);
        }
      });
    }

    return elements.length > 0 ? elements : [
      {
        id: `element_${Date.now()}`,
        type: 'text',
        content: 'Vue组件已导入，请手动编辑内容',
        style: { fontSize: '16px', color: '#333' }
      }
    ];
  };

  // 解析Angular组件
  const parseAngularComponent = (content) => {
    const elements = [];

    // 提取template部分
    const templateMatch = content.match(/template:\s*`([\s\S]*?)`/) || content.match(/templateUrl:\s*['"`]([^'"`]+)['"`]/);
    if (templateMatch) {
      const templateContent = templateMatch[1];
      const tagMatches = templateContent.match(/<(\w+)[^>]*>(.*?)<\/\1>/g) || [];

      tagMatches.forEach((tag, index) => {
        const tagType = tag.match(/<(\w+)/)?.[1];
        const content = tag.match(/>(.*?)</)?.[1]?.replace(/{{[^}]*}}/g, '').trim();

        if (tagType && content) {
          const element = createElementFromTag(tagType, content, `angular_${index}`);
          if (element) elements.push(element);
        }
      });
    }

    return elements.length > 0 ? elements : [
      {
        id: `element_${Date.now()}`,
        type: 'text',
        content: 'Angular组件已导���，���手���编���内容',
        style: { fontSize: '16px', color: '#333' }
      }
    ];
  };

  // 解析JavaScript代码
  const parseJavaScriptCode = (content) => {
    const elements = [];

    // 查找createElement调用
    const createElementMatches = content.match(/createElement\(['"`](\w+)['"`][^)]*\)/g) || [];

    createElementMatches.forEach((match, index) => {
      const tagType = match.match(/createElement\(['"`](\w+)['"`]/)?.[1];
      if (tagType) {
        const element = createElementFromTag(tagType, '内容', `js_${index}`);
        if (element) elements.push(element);
      }
    });

    // 查找innerHTML设置
    const innerHTMLMatches = content.match(/innerHTML\s*=\s*['"`](.*?)['"`]/g) || [];

    innerHTMLMatches.forEach((match, index) => {
      const htmlContent = match.match(/innerHTML\s*=\s*['"`](.*?)['"`]/)?.[1];
      if (htmlContent) {
        // 解析HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
        const parsedElements = parseHTMLToElements(doc.body.firstChild);
        elements.push(...parsedElements);
      }
    });

    return elements.length > 0 ? elements : [
      {
        id: `element_${Date.now()}`,
        type: 'text',
        content: 'JavaScript代���已导入，请手动��辑内容',
        style: { fontSize: '16px', color: '#333' }
      }
    ];
  };

  // 导入SingleFile格式
  const handleImportSingleFile = (content) => {
    try {
      // 解析SingleFile HTML内容
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      // 提取页面基本信息
      const title = doc.querySelector('title')?.textContent || 'SingleFile导入页面';
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

      // 提取并处理内嵌的CSS样式
      const styles = Array.from(doc.querySelectorAll('style')).map(style => style.textContent).join('\n');

      // 提取body内容，但排除script标签
      const bodyClone = doc.body.cloneNode(true);

      // 移除所有script标签
      bodyClone.querySelectorAll('script').forEach(script => script.remove());

      // 移除SingleFile特有的注释和元数据
      bodyClone.querySelectorAll('[data-single-file]').forEach(el => el.remove());

      // 处理图片资源 - 确保data URL被正确保留
      const images = bodyClone.querySelectorAll('img');
      let imageCount = 0;
      let base64ImageCount = 0;

      console.log('SingleFile中找到的图片元素数量:', images.length);

      images.forEach((img, index) => {
        const src = img.src || img.getAttribute('src') || img.getAttribute('data-src');
        console.log(`图片 ${index + 1}:`, {
          src: src ? src.substring(0, 100) + '...' : '无',
          isDataUrl: src?.startsWith('data:image/'),
          srcLength: src?.length
        });

        if (src) {
          imageCount++;
          if (src.startsWith('data:image/')) {
            base64ImageCount++;
            // 为data URL图片添加标识，便于后续处理
            img.setAttribute('data-base64-image', 'true');
            console.log(`找到base64图片 ${base64ImageCount}，大小:`, src.length);
          }
        }
      });

      console.log(`图片处理完成: 总数${imageCount}, Base64图片${base64ImageCount}`);

      // 解析HTML结构转换为组件元素
      const elements = parseSingleFileToElements(bodyClone, styles);

      const newPage = {
        id: `page_${Date.now()}`,
        name: title,
        route: `/${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        isActive: false,
        title: title,
        description: description,
        keywords: keywords,
        sourceType: 'singlefile',
        originalStyles: styles,
        elements: elements,
        imageCount: imageCount // 记录导入的图片数量
      };

      setPages(prev => [...prev, newPage]);

      // 详细的导入结果提示
      let message = 'SingleFile页面导入成功！';
      if (imageCount > 0) {
        message += `\n图片导入情况：`;
        message += `\n- 总图片数量: ${imageCount}`;
        message += `\n- Base64内嵌图片: ${base64ImageCount}`;
        if (base64ImageCount > 0) {
          message += `\n✅ Base64图��已成功导入`;
        }
        if (imageCount > base64ImageCount) {
          message += `\n⚠️ ${imageCount - base64ImageCount} 张外部链接图片可能需要检查`;
        }
      } else {
        message += `\n页面中未检测到图片元素`;
      }

      alert(message);
      setShowImportPage(false);

      // 自动切换到新导入的页面
      setTimeout(() => {
        handleSwitchPage(newPage.id);
      }, 100);

    } catch (error) {
      console.error('SingleFile导入错误:', error);
      alert('SingleFile导入失败：' + error.message);
    }
  };

  // 解析SingleFile内容为组件元素
  const parseSingleFileToElements = (bodyElement, styles) => {
    const elements = [];

    console.log('=== ��始解析SingleFile为元素 ===');
    console.log('bodyElement:', bodyElement);
    console.log('bodyElement子元素数量:', bodyElement.children.length);

    // 首先添加样式信息作为说明
    if (styles.trim()) {
      elements.push({
        id: `element_${Date.now()}_styles`,
        type: 'text',
        content: '⚠️ 原始页面包含复杂CSS样式，可能需要手动调整以适应编辑器',
        style: {
          fontSize: '14px',
          color: '#d97706',
          backgroundColor: '#fef3c7',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #f59e0b',
          marginBottom: '16px'
        }
      });
    }

    // 处理主要内容
    const mainContent = extractMainContent(bodyElement);
    console.log('主要内容区域:', mainContent);
    console.log('主要内容子元素数量:', mainContent.children.length);

    // 递归查找所有img元素
    const allImages = mainContent.querySelectorAll('img');
    console.log('在主要内容中找到的所有img元素数量:', allImages.length);
    allImages.forEach((img, i) => {
      console.log(`img ${i + 1}:`, {
        tagName: img.tagName,
        src: img.src ? img.src.substring(0, 100) + '...' : '无',
        getAttribute_src: img.getAttribute('src') ? img.getAttribute('src').substring(0, 100) + '...' : '无'
      });
    });

    Array.from(mainContent.children).forEach((child, index) => {
      console.log(`处理子元素 ${index + 1}:`, child.tagName, child.className);
      const element = parseSingleFileElement(child, index, styles);
      if (element) {
        console.log(`成功创建元素:`, element.type, element.id);
        elements.push(element);
      } else {
        console.log(`元素解析失败或返回null`);
      }
    });

    // 如果没有解析到任何内容，添加默认内容
    if (elements.length <= 1) {
      elements.push({
        id: `element_${Date.now()}_default`,
        type: 'text',
        content: '页面内容已导入，但可能需要手动调整。原始页���结构较复杂，建议在属性编辑器中进一步编辑。',
        style: { fontSize: '16px', color: '#6b7280', textAlign: 'center', padding: '20px' }
      });
    }

    return elements;
  };

  // 提取主要内容区域
  const extractMainContent = (bodyElement) => {
    // 尝试找到主要内容区域
    const mainSelectors = ['main', '[role="main"]', '.main', '#main', '.content', '#content', '.container'];

    for (const selector of mainSelectors) {
      const mainElement = bodyElement.querySelector(selector);
      if (mainElement && mainElement.children.length > 0) {
        return mainElement;
      }
    }

    // 如果没找到，返回body本身
    return bodyElement;
  };

  // 解析SingleFile中的单个元素
  const parseSingleFileElement = (htmlElement, index, styles) => {
    const tagName = htmlElement.tagName.toLowerCase();
    const id = `element_${Date.now()}_${index}`;

    console.log(`--- 解析元素 ${index}: ${tagName} ---`);
    if (tagName === 'img') {
      console.log('🖼️ 发现图片元素!', {
        src: htmlElement.src,
        getAttribute_src: htmlElement.getAttribute('src'),
        alt: htmlElement.alt
      });
    }

    // 获取元素的内联样式和计算样式
    const inlineStyle = htmlElement.style;
    const computedStyles = extractRelevantStyles(htmlElement, styles);

    // 合并样式
    const style = {
      ...computedStyles,
      // 内联样式优先级更高
      ...(inlineStyle.cssText ? parseInlineStyle(inlineStyle.cssText) : {})
    };

    // 根据标签类型创���对应组件
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          id,
          type: 'heading',
          content: htmlElement.textContent || '标题',
          level: tagName,
          style: { ...style, fontWeight: 'bold' }
        };

      case 'p':
        return {
          id,
          type: 'text',
          content: htmlElement.textContent || '段落文本',
          style: { ...style, lineHeight: '1.6' }
        };

      case 'button':
        return {
          id,
          type: 'button',
          content: htmlElement.textContent || '按钮',
          style: { ...style, cursor: 'pointer' }
        };

      case 'img':
        // 处理SingleFile中的base64编码图���
        let imageSrc = htmlElement.src || htmlElement.getAttribute('src') || htmlElement.getAttribute('data-src');

        // 调试信息
        console.log('处理图片元素:', {
          tagName: htmlElement.tagName,
          src: htmlElement.src,
          srcAttribute: htmlElement.getAttribute('src'),
          dataSrc: htmlElement.getAttribute('data-src'),
          hasDataUrl: imageSrc?.startsWith('data:image/'),
          srcLength: imageSrc?.length
        });

        // 如果没有找到有效的src，检查其他可能的属性
        if (!imageSrc) {
          const possibleSrcAttrs = ['data-original-src', 'data-lazy-src', 'data-srcset'];
          for (const attr of possibleSrcAttrs) {
            const attrValue = htmlElement.getAttribute(attr);
            if (attrValue && (attrValue.startsWith('data:image/') || attrValue.startsWith('http'))) {
              imageSrc = attrValue;
              break;
            }
          }
        }

        // 检查是否是data URL（base64编码的图片）
        if (imageSrc && imageSrc.startsWith('data:image/')) {
          // 保持原始的data URL
          console.log('找到base64图片，长度:', imageSrc.length);
        } else if (imageSrc && imageSrc.startsWith('blob:')) {
          // 对于blob URL，尝试获取原始src属性
          const originalSrc = htmlElement.getAttribute('data-original-src') ||
                            htmlElement.getAttribute('data-src') ||
                            imageSrc;
          imageSrc = originalSrc;
        } else if (!imageSrc || (!imageSrc.startsWith('http') && !imageSrc.startsWith('/') && !imageSrc.startsWith('data:'))) {
          // 对于无效src，使用占位符
          imageSrc = 'https://via.placeholder.com/300x200?text=图片导入失败';
          console.log('图片src无效，使用占位符');
        }

        return {
          id,
          type: 'image',
          src: imageSrc,
          alt: htmlElement.alt || htmlElement.getAttribute('alt') || '图片',
          style: { ...style, maxWidth: '100%', height: 'auto' }
        };

      case 'a':
        return {
          id,
          type: 'link',
          content: htmlElement.textContent || '链接',
          href: htmlElement.href || '#',
          style: { ...style, textDecoration: 'underline' }
        };

      case 'div':
      case 'section':
      case 'article':
      case 'header':
      case 'footer':
      case 'aside':
        const children = Array.from(htmlElement.children).map((child, i) =>
          parseSingleFileElement(child, i, styles)
        ).filter(Boolean);

        if (children.length > 0) {
          return {
            id,
            type: 'container',
            children,
            style: { ...style, padding: '16px', minHeight: '50px' }
          };
        } else if (htmlElement.textContent.trim()) {
          // 如果div只包含文本，创建文本组件
          return {
            id,
            type: 'text',
            content: htmlElement.textContent.trim(),
            style: style
          };
        }
        break;

      default:
        // 对于其他元素，如果包含文本内容，创建文本组件
        if (htmlElement.textContent && htmlElement.textContent.trim()) {
          return {
            id,
            type: 'text',
            content: htmlElement.textContent.trim(),
            style: style
          };
        }
        break;
    }

    return null;
  };

  // 从CSS样式中提取与元素相关的样式
  const extractRelevantStyles = (element, styles) => {
    const extractedStyles = {};

    // 基本样式映射
    const styleMap = {
      color: 'color',
      'background-color': 'backgroundColor',
      'background-image': 'backgroundImage',
      'background-size': 'backgroundSize',
      'background-position': 'backgroundPosition',
      'background-repeat': 'backgroundRepeat',
      'font-size': 'fontSize',
      'font-weight': 'fontWeight',
      'text-align': 'textAlign',
      padding: 'padding',
      margin: 'margin',
      width: 'width',
      height: 'height',
      'border-radius': 'borderRadius'
    };

    // 尝试从类名和ID提取样式
    const className = element.className;
    const elementId = element.id;

    if (className || elementId) {
      // 简化的CSS解析，匹配基本样式
      const cssRules = styles.match(/[^{}]+\{[^}]*\}/g) || [];

      for (const rule of cssRules) {
        const [selector, declarations] = rule.split('{');
        const cleanSelector = selector.trim();

        // 检查选择器���否匹配当前元素
        if (
          (className && typeof className === 'string' && cleanSelector.includes(`.${className.trim().split(' ')[0]}`)) ||
          (elementId && cleanSelector.includes(`#${elementId}`)) ||
          cleanSelector.includes(element.tagName.toLowerCase())
        ) {
          // 解析CSS声明
          const declPairs = declarations.replace('}', '').split(';');
          for (const decl of declPairs) {
            const [prop, value] = decl.split(':');
            if (prop && value && styleMap[prop.trim()]) {
              extractedStyles[styleMap[prop.trim()]] = value.trim();
            }
          }
        }
      }
    }

    return extractedStyles;
  };

  // 解析内联样式
  const parseInlineStyle = (cssText) => {
    const styles = {};

    // 特殊处理包含data URL的��景图片
    let processedCss = cssText;
    const backgroundImageMatches = cssText.match(/background-image:\s*url\(data:image\/[^)]+\)/gi);

    if (backgroundImageMatches) {
      backgroundImageMatches.forEach(match => {
        // 提取完整的data URL
        const urlMatch = match.match(/url\((data:image\/[^)]+)\)/i);
        if (urlMatch) {
          const camelProp = 'backgroundImage';
          styles[camelProp] = `url(${urlMatch[1]})`;
          // 从CSS文本中移除这个声明，避免在后续处理中被错误分割
          processedCss = processedCss.replace(match, '');
        }
      });
    }

    // 处理其他样式声明
    const declarations = processedCss.split(';');

    for (const decl of declarations) {
      if (!decl.trim()) continue;

      const colonIndex = decl.indexOf(':');
      if (colonIndex === -1) continue;

      const prop = decl.substring(0, colonIndex).trim();
      const value = decl.substring(colonIndex + 1).trim();

      if (prop && value && !prop.includes('background-image')) {
        const camelProp = prop.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        styles[camelProp] = value;
      }
    }

    return styles;
  };

  // 检测是否为SingleFile格式
  const isSingleFileFormat = (content) => {
    try {
      console.log('开始检测SingleFile格式，内容长度:', content.length);
      // SingleFile的特征：
      // 1. 包含data:image/格式的base64图片
      // 2. 包含大量内嵌CSS���式
      // 3. 可能包含SingleFile特有的注释或属性

      const hasBase64Images = /data:image\/[^;]+;base64,/.test(content);
      const hasInlineStyles = /<style[^>]*>[\s\S]*?<\/style>/.test(content) && content.includes('style').length > 10;
      const hasSingleFileMarkers = /single-file|data-single-file|archive\.org/.test(content);
      const hasLargeInlineCSS = content.includes('<style>') && content.length > 100000; // 大于100KB通常表示有大量内嵌资源

      // 如果满足多个条件，很可能是SingleFile格式
      const indicators = [hasBase64Images, hasInlineStyles, hasSingleFileMarkers, hasLargeInlineCSS];
      return indicators.filter(Boolean).length >= 2;

    } catch (error) {
      return false;
    }
  };

  // 导入项目结构
  const handleImportProjectStructure = (content) => {
    try {
      const projectConfig = JSON.parse(content);

      if (!projectConfig.structure) {
        alert('项目结构配置格式不正确，请确保包含structure字段');
        return;
      }

      const newPages = [];

      // 处理 client/pages/ 目录���的页面
      if (projectConfig.structure['client/pages/']) {
        projectConfig.structure['client/pages/'].forEach((pageConfig, index) => {
          const newPage = {
            id: `page_${Date.now()}_${index}`,
            name: pageConfig.name || pageConfig.file.replace('.tsx', '').replace('.jsx', ''),
            route: pageConfig.route || `/${pageConfig.name?.toLowerCase() || 'page'}`,
            isActive: false,
            title: pageConfig.title || pageConfig.name,
            description: pageConfig.description || `${pageConfig.name}页面`,
            keywords: pageConfig.keywords || pageConfig.name?.toLowerCase(),
            sourceFile: `client/pages/${pageConfig.file}`,
            projectStructure: true,
            elements: generateDefaultPageElements(pageConfig.name)
          };
          newPages.push(newPage);
        });
      }

      // 处理 client/components/ ���录下的组件作为页面
      if (projectConfig.structure['client/components/']) {
        projectConfig.structure['client/components/'].forEach((componentConfig, index) => {
          if (componentConfig.createPage) {
            const newPage = {
              id: `page_${Date.now()}_comp_${index}`,
              name: `${componentConfig.name}组件页面`,
              route: `/${componentConfig.name?.toLowerCase() || 'component'}`,
              isActive: false,
              title: `${componentConfig.name}组件`,
              description: `${componentConfig.name}组件展示页面`,
              keywords: 'component, ' + componentConfig.name?.toLowerCase(),
              sourceFile: `client/components/${componentConfig.file}`,
              projectStructure: true,
              elements: generateComponentPageElements(componentConfig.name)
            };
            newPages.push(newPage);
          }
        });
      }

      // 如果配置了路由，优先使用路由配置
      if (projectConfig.routes && Array.isArray(projectConfig.routes)) {
        projectConfig.routes.forEach((route, index) => {
          const existingPage = newPages.find(p => p.route === route.path);
          if (existingPage) {
            // 更新现有页面的路由信息
            existingPage.component = route.component;
            existingPage.meta = route.meta;
          } else {
            // 创建新页面
            const newPage = {
              id: `page_${Date.now()}_route_${index}`,
              name: route.component || route.path.replace('/', '') || 'Page',
              route: route.path,
              isActive: false,
              title: route.meta?.title || route.component,
              description: route.meta?.description || '',
              keywords: route.meta?.keywords || '',
              component: route.component,
              projectStructure: true,
              elements: generateDefaultPageElements(route.component)
            };
            newPages.push(newPage);
          }
        });
      }

      if (newPages.length === 0) {
        alert('未找到可导入的页面配置');
        return;
      }

      setPages(prev => [...prev, ...newPages]);
      alert(`成功导入项目结构，创建了 ${newPages.length} 个页面`);
      setShowImportPage(false);

    } catch (error) {
      alert('项目结构导入失败：' + error.message);
    }
  };

  // 生成默认页面元素
  const generateDefaultPageElements = (pageName) => {
    return [
      {
        id: `element_${Date.now()}_title`,
        type: 'heading',
        content: pageName || '页面标题',
        level: 'h1',
        style: { fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }
      },
      {
        id: `element_${Date.now()}_desc`,
        type: 'text',
        content: `欢迎来���${pageName || '页面'}，这里是页面内容。`,
        style: { fontSize: '16px', color: '#333', lineHeight: '1.6' }
      },
      {
        id: `element_${Date.now()}_container`,
        type: 'container',
        children: [],
        style: {
          padding: '40px',
          marginTop: '20px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          minHeight: '200px',
          textAlign: 'center',
          backgroundColor: '#f9fafb'
        }
      }
    ];
  };

  // 生成组件页面元素
  const generateComponentPageElements = (componentName) => {
    return [
      {
        id: `element_${Date.now()}_comp_title`,
        type: 'heading',
        content: `${componentName} 组件`,
        level: 'h1',
        style: { fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a' }
      },
      {
        id: `element_${Date.now()}_comp_desc`,
        type: 'text',
        content: `这是 ${componentName} 组件���展示页面。`,
        style: { fontSize: '16px', color: '#666', marginBottom: '20px' }
      },
      {
        id: `element_${Date.now()}_comp_demo`,
        type: 'container',
        children: [
          {
            id: `element_${Date.now()}_demo_btn`,
            type: 'button',
            content: `${componentName} 示例`,
            style: {
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }
          }
        ],
        style: {
          padding: '30px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
      }
    ];
  };

  // 处理ZIP文件导入
  const handleZipImport = async (file) => {
    // 显示ZIP导入指南对话框
    setShowZipGuide(true);
  };



  // 从标签创建元素
  const createElementFromTag = (tagType, content, idPrefix) => {
    const id = `element_${Date.now()}_${idPrefix}`;

    switch (tagType.toLowerCase()) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          id,
          type: 'heading',
          content: content,
          level: tagType.toLowerCase(),
          style: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }
        };
      case 'p':
        return {
          id,
          type: 'text',
          content: content,
          style: { fontSize: '16px', color: '#333' }
        };
      case 'button':
        return {
          id,
          type: 'button',
          content: content,
          style: { backgroundColor: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none' }
        };
      case 'div':
        return {
          id,
          type: 'container',
          children: [],
          style: { padding: '20px', border: '2px dashed #d1d5db', borderRadius: '6px', minHeight: '100px' }
        };
      default:
        return null;
    }
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
              onClick={() => setShowImportPage(true)}
              className="w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded text-xs"
              title="导入页面"
            >
              <Upload className="w-3 h-3 text-gray-400 hover:text-gray-200" />
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

        {/* 页面����表 */}
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
                  onClick={() => onSwitchPage(page.id)}
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
                    title="页面设���"
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
                      title="删除页��"
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
              <Label className="text-sm">页面��称</Label>
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
            <DialogTitle>页面设��</DialogTitle>
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
                  placeholder="���面的HTML����题"
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
                  placeholder="页面描述，��于搜索引擎优���"
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
                  placeholder="关键���，用逗号分隔"
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

      {/* 导入页面对话框 */}
      <Dialog open={showImportPage} onOpenChange={setShowImportPage}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              导入页面
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 导入方式选择 */}
            <div>
              <Label className="text-sm font-medium">导入方式</Label>
              <Tabs defaultValue="file" className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">文件导入</TabsTrigger>
                  <TabsTrigger value="text">文本导入</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm">���择文件</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        accept=".json,.html,.jsx,.tsx,.vue,.js,.ts,.zip"
                        onChange={handleFileImport}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      支持格���：JSON、HTML、JSX/TSX、Vue、JS/TS、ZIP�����包
                      <br />
                      💡 可以选择多个文件同时���入（按住Ctrl/Cmd键选择）
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">支持的文件格式：</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <strong>JSON文件</strong>：页面配置数据</li>
                      <li>• <strong>HTML文件</strong>����态HTML��面，自动解析为组件</li>
                      <li>• <strong>JSX/TSX文件</strong>：React组件源代码</li>
                      <li>• <strong>Vue文件</strong>：Vue单文件组件</li>
                      <li>• <strong>JS/TS文件</strong>：JavaScript/TypeScript源代码</li>
                      <li>• <strong>ZIP文件</strong>：包含多个页面的压缩包</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm">导入类型</Label>
                    <Select value={importType} onValueChange={setImportType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON页面配置</SelectItem>
                        <SelectItem value="html">HTML页面代码</SelectItem>
                        <SelectItem value="spa">SPA路由配置</SelectItem>
                        <SelectItem value="react">React组件代码</SelectItem>
                        <SelectItem value="vue">Vue组件代码</SelectItem>
                        <SelectItem value="angular">Angular组件代码</SelectItem>
                        <SelectItem value="js">原生JS/CSS代码</SelectItem>
                        <SelectItem value="project">项目结构配置</SelectItem>
                        <SelectItem value="singlefile">SingleFile格式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">
                      {importType === 'json' && 'JSON配��内��'}
                      {importType === 'html' && 'HTML页面代码'}
                      {importType === 'spa' && 'SPA路由配置'}
                      {importType === 'react' && 'React组件代码'}
                      {importType === 'vue' && 'Vue组件代码'}
                      {importType === 'angular' && 'Angular组件代码'}
                      {importType === 'js' && '原生JS/CSS代码'}
                      {importType === 'project' && '项目结构配置'}
                      {importType === 'singlefile' && 'SingleFile格式'}
                    </Label>
                    <Textarea
                      value={importContent}
                      onChange={(e) => setImportContent(e.target.value)}
                      placeholder={
                        importType === 'json'
                          ? '{"name": "页面名称", "route": "/path", "elements": [...]}'
                          : importType === 'html'
                          ? '<!DOCTYPE html><html>...</html>'
                          : importType === 'spa'
                          ? '{"routes": [{"path": "/", "name": "首页", "component": "Home"}]}'
                          : importType === 'react'
                          ? 'function MyComponent() { return <div>Hello World</div>; }'
                          : importType === 'vue'
                          ? '<template><div>{{ message }}</div></template><script>export default { data() { return { message: "Hello" }; } }</script>'
                          : importType === 'angular'
                          ? '@Component({ selector: "app-my", template: "<div>Hello</div>" }) export class MyComponent {}'
                          : importType === 'project'
                          ? '{"structure": {"client/pages/": [{"name": "Home", "file": "Home.tsx"}], "client/components/": [{"name": "Header", "file": "Header.tsx"}]}}'
                          : importType === 'singlefile'
                          ? '<!DOCTYPE html><html>...<head>包��内嵌CSS样式</head><body>完整页面内容</body></html>'
                          : 'const element = document.createElement("div"); element.innerHTML = "Hello World";'
                      }
                      className="mt-2 h-40 font-mono text-xs"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      {importType === 'json' && 'JSON格式示例：'}
                      {importType === 'html' && 'HTML格式说明：'}
                      {importType === 'spa' && 'SPA配置示例：'}
                      {importType === 'react' && 'React组件示��：'}
                      {importType === 'vue' && 'Vue组件示例：'}
                      {importType === 'angular' && 'Angular组件示例：'}
                      {importType === 'js' && '原生JS/CSS示例：'}
                      {importType === 'project' && '项目结构���例：'}
                      {importType === 'singlefile' && 'SingleFile格式说明：'}
                    </h4>
                    {importType === 'json' && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`{
  "name": "关于我们",
  "route": "/about",
  "title": "关于我们 - 网���名称",
  "description": "页面描述",
  "elements": [
    {
      "type": "heading",
      "content": "关于我们",
      "level": "h1"
    }
  ]
}`}
                      </pre>
                    )}
                    {importType === 'html' && (
                      <div className="text-xs text-gray-600">
                        <p>支持标准HTML标签，会自动��换为对����组���：</p>
                        <ul className="mt-2 space-y-1">
                          <li>• h1-h6 → 标题组件</li>
                          <li>• p → 文本组件</li>
                          <li>• button → 按钮组件</li>
                          <li>• img → 图片组件</li>
                          <li>• a → 链接组件</li>
                          <li>• input, textarea → 表��组件</li>
                          <li>• div → 容器组件</li>
                        </ul>
                      </div>
                    )}
                    {importType === 'spa' && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`{
  "routes": [
    {
      "path": "/",
      "name": "��页",
      "component": "Home",
      "meta": {
        "title": "首页",
        "description": "网站首页"
      }
    },
    {
      "path": "/about",
      "name": "关于",
      "component": "About"
    }
  ]
}`}
                      </pre>
                    )}
                    {importType === 'react' && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Welcome to React</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default HomePage;`}
                      </pre>
                    )}
                    {importType === 'vue' && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Click me</button>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      title: 'Welcome to Vue',
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>`}
                      </pre>
                    )}
                    {importType === 'angular' && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: \`
    <div class="container">
      <h1>{{ title }}</h1>
      <p>Count: {{ count }}</p>
      <button (click)="increment()">Click me</button>
    </div>
  \`,
  styles: [\`
    .container { padding: 20px; }
  \`]
})
export class HomeComponent {
  title = 'Welcome to Angular';
  count = 0;

  increment() {
    this.count++;
  }
}`}
                      </pre>
                    )}
                    {importType === 'js' && (
                      <div className="text-xs text-gray-600">
                        <p className="mb-2">支持原��JavaScript和CSS代码，会���动解析为页面元素：</p>
                        <pre className="whitespace-pre-wrap">
{`// JavaScript代码示例
const container = document.createElement('div');
container.className = 'container';
container.innerHTML = \`
  <h1>Welcome</h1>
  <p id="counter">Count: 0</p>
  <button onclick="increment()">Click me</button>
\`;

let count = 0;
function increment() {
  count++;
  document.getElementById('counter').textContent = \`Count: \${count}\`;
}

/* CSS样式 */
.container {
  padding: 20px;
  text-align: center;
}

.container button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}`}
                        </pre>
                      </div>
                    )}
                    {importType === 'project' && (
                      <div className="text-xs text-gray-600">
                        <p className="mb-2">支持导入完整的项目结��配���，自动创建多个页面：</p>
                        <pre className="whitespace-pre-wrap">
{`{
  "projectName": "我的React��目",
  "structure": {
    "client/pages/": [
      {
        "name": "Home",
        "file": "Home.tsx",
        "route": "/",
        "title": "首页"
      },
      {
        "name": "About",
        "file": "About.tsx",
        "route": "/about",
        "title": "关于我们"
      }
    ],
    "client/components/": [
      {
        "name": "Header",
        "file": "Header.tsx",
        "type": "component"
      },
      {
        "name": "Footer",
        "file": "Footer.tsx",
        "type": "component"
      }
    ],
    "client/components/ui/": [
      {
        "name": "Button",
        "file": "button.tsx",
        "type": "ui-component"
      }
    ]
  },
  "routes": [
    {
      "path": "/",
      "component": "Home"
    },
    {
      "path": "/about",
      "component": "About"
    }
  ]
}`}
                        </pre>
                        <p className="mt-2 text-xs">
                          • 自动��据client/pages/目录创建页面<br/>
                          • 支持client/components/和client/components/ui/组件导入<br/>
                          • 自动配置路由映射<br/>
                          • 保持标准的React项目结构
                        </p>
                      </div>
                    )}
                    {importType === 'singlefile' && (
                      <div className="text-xs text-gray-600">
                        <p className="mb-2">SingleFile是将完整网页保存为单个HTML文件的格式，包含所有资源：</p>
                        <div className="bg-gray-100 p-3 rounded mb-3">
                          <h5 className="font-medium mb-2">SingleFile特点：</h5>
                          <ul className="space-y-1">
                            <li>• 所有CSS样式内嵌在&lt;style&gt;标签中</li>
                            <li>• 所有JavaScript代码内嵌在&lt;script&gt;标签中</li>
                            <li>• 图片等资源转为base64格式内嵌</li>
                            <li>• 完整的、自包含的HTML文件</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-3 rounded mb-3">
                          <h5 className="font-medium text-blue-900 mb-2">如何获取SingleFile：</h5>
                          <ol className="text-blue-800 space-y-1">
                            <li>1. 安装SingleFile浏览器扩展</li>
                            <li>2. 在任意网页上点击扩展图标</li>
                            <li>3. 选择"保存页面"</li>
                            <li>4. 下载生成的.html文件</li>
                            <li>5. 将该文件内容粘贴到此���导入</li>
                          </ol>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <h5 className="font-medium text-green-900 mb-2">导入效果：</h5>
                          <ul className="text-green-800 space-y-1">
                            <li>• 自动解析页面结构和样式</li>
                            <li>• 提取文本内容为可编辑组件</li>
                            <li>• 保留图片和媒体资源</li>
                            <li>• 转换为可视化编辑格式</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowImportPage(false)}>
                      取消
                    </Button>
                    <Button onClick={handleImportFromText}>
                      导入
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ZIP导入指南对话框 */}
      <Dialog open={showZipGuide} onOpenChange={setShowZipGuide}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              ZIP文件导入指南
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">��</span>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">ZIP文件导���方案</h3>
                  <p className="text-blue-800 text-sm">
                    由于浏览器安全限制，我们提供了更好的ZIP文件处理方案：
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">推荐方案：</h4>

              <div className="grid gap-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">手动解压ZIP文件</h5>
                      <p className="text-sm text-gray-600">
                        在您的计算机上解��ZIP文件，然后选择单个文件进行导入
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">批量导入多个文件</h5>
                      <p className="text-sm text-gray-600">
                        选择多个文件同时上传（按��Ctrl/Cmd键选择多个文件）
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">使用文本导入</h5>
                      <p className="text-sm text-gray-600">
                        复制文件内容，使用"文本导入"功能粘贴代码
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">支持的文件类型：</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>JSON配置文件</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>HTML页面文件</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>SingleFile格式 (.html)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  <span>React组件 (.jsx/.tsx)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Vue组件 (.vue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Angular组件 (.ts)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>JavaScript (.js/.ts)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowZipGuide(false);
                  setShowImportPage(true);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                使用文件导入
              </Button>
              <Button onClick={() => setShowZipGuide(false)}>
                我知道��
              </Button>
            </div>
          </div>
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

  // 递归渲染所有元素及���子元素
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

  // 统计总元素数量（��括嵌套）
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
            暂无元��
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
function ComponentLibrary({ pages, setPages, onSwitchPage }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']));
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomComponent, setShowAddCustomComponent] = useState(false);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentCode, setNewComponentCode] = useState('');

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

  // 处理添��自定义组件
  const handleAddCustomComponent = () => {
    if (!newComponentName.trim()) {
      alert('请输入��件名称');
      return;
    }

    if (!newComponentCode.trim()) {
      alert('请输入组件代码');
      return;
    }

    try {
      // 这里可以添加代��验证逻辑
      // 暂时简��处理，创建一个基础的自定义组件
      const newComponent = {
        id: `custom-${Date.now()}`,
        type: `custom-${newComponentName.toLowerCase().replace(/\s+/g, '-')}`,
        label: newComponentName,
        icon: Shield,
        category: 'custom',
        defaultProps: {
          content: newComponentName,
          customCode: newComponentCode,
          style: {
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }
        }
      };

      // 这里应该动态添加到组件库中
      // 暂时显示成功消息
      alert(`自定义组件 "${newComponentName}" 创建成功！\n\n注��：当前���本暂时不支持运行时动态添加组件，此功能需要重新编译。`);

      setNewComponentName('');
      setNewComponentCode('');
      setShowAddCustomComponent(false);
    } catch (error) {
      alert('组件代码格式错误：' + error.message);
    }
  };

  const categories = [
    { id: 'basic', label: '基础组件', icon: Type },
    { id: 'layout', label: '布局容器', icon: Layout },
    { id: 'form', label: '表单控件', icon: FileText },
    { id: 'media', label: '媒体元素', icon: Image },
    { id: 'icon', label: '图标���件', icon: Star },
    { id: 'custom', label: '自定义组件', icon: Shield }
  ];

  const filteredComponents = searchTerm
    ? allComponents.filter(comp => comp.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : allComponents;

  return (
    <>
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
          onSwitchPage={onSwitchPage}
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAddCustomComponent(true)}
                className="w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded text-xs"
                title="添加自定义组件"
              >
                <Plus className="w-3 h-3 text-gray-400 hover:text-gray-200" />
              </button>
              <button
                onClick={() => {
                  // 一键切换��如果全部展开则��起，否则展开
                  if (expandedCategories.size === categories.length) {
                    collapseAll();
                  } else {
                    expandAll();
                  }
                }}
                className="w-5 h-5 flex items-center justify-center hover:bg-gray-700 rounded text-xs"
                title={expandedCategories.size === categories.length ? "收起��部" : "展开全部"}
              >
                {expandedCategories.size === categories.length ? (
                  <Minus className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                ) : (
                  <Plus className="w-3 h-3 text-gray-400 hover:text-gray-200" />
                )}
              </button>
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

      {/* 添加自定��组件对话框 */}
      <Dialog open={showAddCustomComponent} onOpenChange={setShowAddCustomComponent}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              添加自定义组件
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">⚠️</span>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-900 mb-2">开发者功能</h3>
                  <p className="text-yellow-800 text-sm">
                    此功能用于添加自定义React组件。需要重新编译才能在画布中使用。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">组件名称</Label>
                <Input
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  placeholder="例如：我的按钮组件"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">React组件代码</Label>
                <Textarea
                  value={newComponentCode}
                  onChange={(e) => setNewComponentCode(e.target.value)}
                  placeholder={"例如：\nimport React from 'react';\n\nexport default function MyCustomComponent({ text = \"Hello\" }) {\n  return (\n    <div className=\"p-4 bg-blue-100 rounded\">\n      <h3>{text}</h3>\n      <p>这是我的自定义组件</p>\n    </div>\n  );\n}"}
                  className="mt-2 h-60 font-mono text-xs"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">开发指南：</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 使用标准的React函数组件格式</li>
                  <li>• 组件应该导出为默认导出 (export default)</li>
                  <li>• 可以使用props来接收参数</li>
                  <li>• 建议使用Tailwind CSS进行样式设计</li>
                  <li>• 避免使用外部依赖库</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">后续步骤：</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. 点��"创建组件"保存代码</li>
                  <li>2. 将生成的组件文件添加到项目中</li>
                  <li>3. 在WebEditor.tsx中注册新组件</li>
                  <li>4. 重新编译项目即可使用</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddCustomComponent(false)}>
                  取消
                </Button>
                <Button onClick={handleAddCustomComponent}>
                  <Shield className="w-4 h-4 mr-2" />
                  创建组件
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 属��编辑器
function PropertyEditor({ selectedElement, onUpdateElement }) {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l p-4 overflow-y-auto">
        <div className="text-center text-gray-400 py-8">
          <Settings size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">选择一个组��来编辑属性</p>
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
            属性编���器
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
            
            {/* ����框属性 */}
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
                  <Label className="text-xs">图���地址</Label>
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
            
            {/* 链接���性 */}
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

            {/* 自定义组件：账户检查流程 */}
            {selectedElement.type === 'account-check-flow' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <Label className="text-xs font-medium text-blue-600">页面标题和基本文�����</Label>
                </div>

                <div>
                  <Label className="text-xs">主标题</Label>
                  <Input
                    value={selectedElement.title || ''}
                    onChange={(e) => handlePropertyChange('title', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="账户异常处理中心"
                  />
                </div>

                <div className="border-b pb-2 mt-4">
                  <Label className="text-xs font-medium text-green-600">第一步：手机号输入</Label>
                </div>

                <div>
                  <Label className="text-xs">手机号标签</Label>
                  <Input
                    value={selectedElement.phoneLabel || ''}
                    onChange={(e) => handlePropertyChange('phoneLabel', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="手机号"
                  />
                </div>

                <div>
                  <Label className="text-xs">手机号占位符</Label>
                  <Input
                    value={selectedElement.phonePlaceholder || ''}
                    onChange={(e) => handlePropertyChange('phonePlaceholder', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="请输入手机��"
                  />
                </div>

                <div>
                  <Label className="text-xs">��始按钮文本</Label>
                  <Input
                    value={selectedElement.startButton || ''}
                    onChange={(e) => handlePropertyChange('startButton', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="开始查询"
                  />
                </div>

                <div className="border-b pb-2 mt-4">
                  <Label className="text-xs font-medium text-red-600">第二步：异常警告</Label>
                </div>

                <div>
                  <Label className="text-xs">警告主文本</Label>
                  <Input
                    value={selectedElement.warningText || ''}
                    onChange={(e) => handlePropertyChange('warningText', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="系统检测到该账号存在异常行为"
                  />
                </div>

                <div>
                  <Label className="text-xs">异常项目1</Label>
                  <Input
                    value={selectedElement.warningItem1 || ''}
                    onChange={(e) => handlePropertyChange('warningItem1', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="多次登录失败"
                  />
                </div>

                <div>
                  <Label className="text-xs">异常项目2</Label>
                  <Input
                    value={selectedElement.warningItem2 || ''}
                    onChange={(e) => handlePropertyChange('warningItem2', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="密码输入错误超过安全阈值"
                  />
                </div>

                <div>
                  <Label className="text-xs">异常项目3</Label>
                  <Input
                    value={selectedElement.warningItem3 || ''}
                    onChange={(e) => handlePropertyChange('warningItem3', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="存在可疑交易记录"
                  />
                </div>

                <div>
                  <Label className="text-xs">继续按钮文本</Label>
                  <Input
                    value={selectedElement.continueButton || ''}
                    onChange={(e) => handlePropertyChange('continueButton', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="继续解除异常"
                  />
                </div>

                <div className="border-b pb-2 mt-4">
                  <Label className="text-xs font-medium text-purple-600">第三步：身份验证</Label>
                </div>

                <div>
                  <Label className="text-xs">姓名标签</Label>
                  <Input
                    value={selectedElement.nameLabel || ''}
                    onChange={(e) => handlePropertyChange('nameLabel', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="姓名"
                  />
                </div>

                <div>
                  <Label className="text-xs">身份证标签</Label>
                  <Input
                    value={selectedElement.idLabel || ''}
                    onChange={(e) => handlePropertyChange('idLabel', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="身份证号"
                  />
                </div>

                <div>
                  <Label className="text-xs">邮箱标签</Label>
                  <Input
                    value={selectedElement.emailLabel || ''}
                    onChange={(e) => handlePropertyChange('emailLabel', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="邮箱"
                  />
                </div>

                <div>
                  <Label className="text-xs">���交按钮文本</Label>
                  <Input
                    value={selectedElement.submitButton || ''}
                    onChange={(e) => handlePropertyChange('submitButton', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="提交"
                  />
                </div>

                <div>
                  <Label className="text-xs">成功���示信息</Label>
                  <Input
                    value={selectedElement.successMessage || ''}
                    onChange={(e) => handlePropertyChange('successMessage', e.target.value)}
                    className="mt-1 h-8 text-xs"
                    placeholder="提交成功"
                  />
                </div>

                <div className="border-b pb-2 mt-4">
                  <Label className="text-xs font-medium text-orange-600">颜色设置</Label>
                </div>

                <div>
                  <Label className="text-xs">按钮颜色 (Tailwind CSS类)</Label>
                  <Select
                    value={selectedElement.buttonColor || 'bg-blue-600'}
                    onValueChange={(value) => handlePropertyChange('buttonColor', value)}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-600">蓝色 (bg-blue-600)</SelectItem>
                      <SelectItem value="bg-green-600">绿色 (bg-green-600)</SelectItem>
                      <SelectItem value="bg-red-600">红色 (bg-red-600)</SelectItem>
                      <SelectItem value="bg-purple-600">紫色 (bg-purple-600)</SelectItem>
                      <SelectItem value="bg-gray-600">灰色 (bg-gray-600)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">警告文字颜色</Label>
                  <Select
                    value={selectedElement.warningColor || 'text-red-600'}
                    onValueChange={(value) => handlePropertyChange('warningColor', value)}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-red-600">红色 (text-red-600)</SelectItem>
                      <SelectItem value="text-orange-600">橙色 (text-orange-600)</SelectItem>
                      <SelectItem value="text-yellow-600">黄色 (text-yellow-600)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">提交按钮颜色</Label>
                  <Select
                    value={selectedElement.submitColor || 'bg-green-600'}
                    onValueChange={(value) => handlePropertyChange('submitColor', value)}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-green-600">绿色 (bg-green-600)</SelectItem>
                      <SelectItem value="bg-blue-600">蓝色 (bg-blue-600)</SelectItem>
                      <SelectItem value="bg-purple-600">紫色 (bg-purple-600)</SelectItem>
                      <SelectItem value="bg-indigo-600">靛蓝色 (bg-indigo-600)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4 mt-4">
            {/* 布�� */}
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
                  <Label className="text-xs text-gray-600">高���</Label>
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
                  <Label className="text-xs text-gray-600">字体大��</Label>
                  <Input
                    value={selectedElement.style?.fontSize || ''}
                    onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                    className="mt-1 h-7 text-xs"
                    placeholder="16px"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">字���粗细</Label>
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
                      <SelectItem value="lighter">��体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">文��颜色</Label>
                  <Input
                    type="color"
                    value={selectedElement.style?.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="mt-1 h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">文字��齐</Label>
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
                  <Label className="text-xs text-gray-600">����景色</Label>
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
  const [siteName, setSiteName] = useState('我的�����站');
  const [pages, setPages] = useState([
    { id: 'home', name: '首页', route: '/', isActive: true }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showElementTree, setShowElementTree] = useState(true);

  // 保存当前页面元素���函数
  const saveCurrentPageElements = useCallback(() => {
    const activePage = pages.find(p => p.isActive);
    if (activePage) {
      setPages(prev => prev.map(p =>
        p.isActive ? { ...p, elements: [...elements] } : p
      ));
    }
  }, [pages, elements]);

  // 元素变化时自动保存到当前页面（添加防��）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCurrentPageElements();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [elements]);

  // 添加元素到画布
  const handleAddElement = useCallback((component) => {
    const newElement = {
      id: `element_${Date.now()}`,
      type: component.type,
      ...component.defaultProps,
    };
    setElements(prev => [...prev, newElement]);
  }, []);
  
  // 选����元素
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

  // 切换页面
  const handleSwitchPage = useCallback((pageId) => {
    // 首先保��当前页面的元素
    saveCurrentPageElements();

    // ���到要切换的页面
    const targetPage = pages.find(p => p.id === pageId);
    if (!targetPage) return;

    console.log('切换到���面:', targetPage.name, '元素数量:', targetPage.elements?.length || 0);

    // 更新页面状态
    setPages(prev => prev.map(p => ({ ...p, isActive: p.id === pageId })));

    // 稍微延迟加载元素，确���页面状态更新完成
    setTimeout(() => {
      // 加载对应页��的元素到�������
      if (targetPage.elements && Array.isArray(targetPage.elements)) {
        console.log('加载页面元素:', targetPage.elements);
        setElements([...targetPage.elements]);
      } else {
        // 如果页面没有elements，显示空画布
        console.log('页面没有元素，清空画布');
        setElements([]);
      }
    }, 10);

    // 清除当前选中的元素
    setSelectedElement(null);
    setSelectedPath([]);
  }, [pages, saveCurrentPageElements]);

  // 复制��素
  const handleDuplicateElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: `element_${Date.now()}`,
    };
    setElements(prev => [...prev, newElement]);
  }, []);
  
  // 保存项���
  const handleSave = async () => {
    try {
      const projectData = {
        siteName,
        pages,
        elements,
        css: '', // ��以后续添���CSS编辑功能
        js: ''   // 可以后��添加JS编辑功���
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
        throw new Error(result.message || '保存失���');
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
        throw new Error('保存项目��败，无法导���');
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

      alert('导出成功！已下���ZIP包');
    } catch (error) {
      console.error('���出失败:', error);
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
      alert('请输入����站名称');
      return;
    }

    try {
      // 首先���存项目
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
        throw new Error('保存�����失败，无法发布');
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
        alert(`🚀 发布���功！\n\n网站���称: ${publishResult.data.siteName}\n访问地址: ${publishResult.data.deployUrl}\n发布时间: ${new Date(publishResult.data.publishedAt).toLocaleString('zh-CN')}`);
      } else {
        throw new Error(publishResult.message || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert(`发布失���: ${error.message}\n\n请检查网络连接或联系管理员`);
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
        console.error('加载项��列表失败:', result.message);
      }
    } catch (error) {
      console.error('加载项目列表�����:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ��载指定项目
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
      alert('加载项目失��: ' + error.message);
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
              ������建
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('=== 当前页面调试信息 ===');
                console.log('页面总数:', pages.length);
                console.log('当前活跃页面:', pages.find(p => p.isActive));
                console.log('当前元素数量:', elements.length);

                const imageElements = elements.filter(el => el.type === 'image');
                console.log('图片元素数量:', imageElements.length);

                imageElements.forEach((img, index) => {
                  console.log(`图片 ${index + 1}:`, {
                    id: img.id,
                    type: img.type,
                    src: img.src ? img.src.substring(0, 100) + '...' : '无src',
                    alt: img.alt,
                    isBase64: img.src?.startsWith('data:image/'),
                    srcLength: img.src?.length,
                    style: img.style
                  });
                });

                alert(`调试信息已输出到控制台\n图片元素: ${imageElements.length}个`);
              }}
            >
              🐛调试
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-sm">
          <span className="text-gray-600">元素:</span>
          <span className="font-mono font-medium">{elements.length}</span>
          {elements.filter(el => el.type === 'image').length > 0 && (
            <span className="text-blue-600 text-xs">
              (图片:{elements.filter(el => el.type === 'image').length})
            </span>
          )}
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
          {!showPreview && <ComponentLibrary pages={pages} setPages={setPages} onSwitchPage={handleSwitchPage} />}

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

          {/* ��下角元素树状图 */}
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

      {/* 项��管理对话框 */}
      <Dialog open={showProjectManager} onOpenChange={setShowProjectManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              项目管理
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 操作���钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={newProject} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  新建项目
                </Button>
                <Button onClick={loadProjects} variant="outline" size="sm" disabled={isLoading}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  刷新��表
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
                <div className="text-gray-500 mb-4">���无保存的项目</div>
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
                            <span>页面: {project.pagesCount}</span>
                          </div>
                        </div>
                        <Badge
                          variant={project.status === 'published' ? 'default' : 'secondary'}
                          className={project.status === 'published' ? 'bg-green-500' : ''}
                        >
                          {project.status === 'published' ? '已发布' : '���稿'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>创建时间: {new Date(project.createdAt).toLocaleString('zh-CN')}</div>
                        <div>更新时间: {new Date(project.updatedAt).toLocaleString('zh-CN')}</div>
                        {project.publishedAt && (
                          <div>发��时���: {new Date(project.publishedAt).toLocaleString('zh-CN')}</div>
                        )}
                        {project.deployUrl && (
                          <div className="flex items-center gap-2">
                            <span>���问地址:</span>
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
                            ���问
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

      <style>{`
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
