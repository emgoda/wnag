import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Edit3, Trash2, Save, Upload, Undo, Redo, Eye, Code,
  FileText, Globe, Download, Settings, Monitor, Copy
} from 'lucide-react';
import Editor from './Editor';
import PropertyPanel from './PropertyPanel';

interface Page {
  id: string;
  name: string;
  route: string;
  content: string;
  created: Date;
  updated: Date;
}

export default function WebEditor() {
  const [pages, setPages] = useState<Page[]>([
    {
      id: '1',
      name: '首页',
      route: '/',
      content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>首页</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
        p { line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢���来到我的网站</h1>
        <p>这是一个示例页面，您可以编辑HTML内容来自定义页面。</p>
    </div>
</body>
</html>`,
      created: new Date(),
      updated: new Date()
    }
  ]);

  const [selectedPageId, setSelectedPageId] = useState<string>('1');
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  const [showEditPageDialog, setShowEditPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [newPageData, setNewPageData] = useState({ name: '', route: '' });
  const [activeTab, setActiveTab] = useState('pages');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  // 添加调试日志
  useEffect(() => {
    console.log('WebEditor selectedElement 更新:', selectedElement?.tagName || 'null');
  }, [selectedElement]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // 历史记录用于撤销/重做
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPage = pages.find(p => p.id === selectedPageId);

  // 添加页面
  const handleAddPage = () => {
    if (!newPageData.name.trim() || !newPageData.route.trim()) {
      alert('请填写页面名称和路由');
      return;
    }

    // 检查路由是否重复
    if (pages.some(p => p.route === newPageData.route)) {
      alert('路由已存在，请使用���同的路由');
      return;
    }

    const newPage: Page = {
      id: Date.now().toString(),
      name: newPageData.name,
      route: newPageData.route,
      content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newPageData.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${newPageData.name}</h1>
        <p>编辑此页面内容...</p>
    </div>
</body>
</html>`,
      created: new Date(),
      updated: new Date()
    };

    setPages(prev => [...prev, newPage]);
    setSelectedPageId(newPage.id);
    setNewPageData({ name: '', route: '' });
    setShowAddPageDialog(false);
  };

  // 删除页面
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert('至少需要保留一个页面');
      return;
    }

    if (confirm('确定要删除这个页面吗？')) {
      setPages(prev => prev.filter(p => p.id !== pageId));
      if (selectedPageId === pageId) {
        setSelectedPageId(pages.find(p => p.id !== pageId)?.id || '');
      }
    }
  };

  // 编辑页面信息
  const handleEditPage = (page: Page) => {
    setEditingPage({ ...page });
    setShowEditPageDialog(true);
  };

  const handleUpdatePage = () => {
    if (!editingPage) return;

    // 检查路由是否重复（排除当前页面）
    if (pages.some(p => p.id !== editingPage.id && p.route === editingPage.route)) {
      alert('路由已存在，请使用不同的路由');
      return;
    }

    setPages(prev => prev.map(p => 
      p.id === editingPage.id 
        ? { ...editingPage, updated: new Date() }
        : p
    ));
    setShowEditPageDialog(false);
    setEditingPage(null);
  };

  // 更新页面内容
  const handleContentChange = useCallback((content: string) => {
    if (!selectedPage) return;

    // 添加到历��记录
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), selectedPage.content];
      return newHistory.slice(-50); // 限制历史记录数量
    });
    setHistoryIndex(prev => prev + 1);

    setPages(prev => prev.map(p => 
      p.id === selectedPageId 
        ? { ...p, content, updated: new Date() }
        : p
    ));
  }, [selectedPage, selectedPageId, historyIndex]);

  // 撤销
  const handleUndo = () => {
    if (historyIndex >= 0 && history[historyIndex]) {
      const previousContent = history[historyIndex];
      setPages(prev => prev.map(p => 
        p.id === selectedPageId 
          ? { ...p, content: previousContent, updated: new Date() }
          : p
      ));
      setHistoryIndex(prev => prev - 1);
    }
  };

  // 重做
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextContent = history[historyIndex + 1];
      setPages(prev => prev.map(p => 
        p.id === selectedPageId 
          ? { ...p, content: nextContent, updated: new Date() }
          : p
      ));
    }
  };

  // 导入SingleFile
  const handleImportSingleFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const title = doc.querySelector('title')?.textContent || file.name.replace('.html', '');

      // 创建新页面
      const newPage: Page = {
        id: Date.now().toString(),
        name: `导入-${title}`,
        route: `/${title.toLowerCase().replace(/\s+/g, '-')}`,
        content: content,
        created: new Date(),
        updated: new Date()
      };

      setPages(prev => [...prev, newPage]);
      setSelectedPageId(newPage.id);
      alert('SingleFile导入成功！');
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式');
    }

    // 清空文件输入
    event.target.value = '';
  };

  // 处理元素更新
  const handleElementUpdate = useCallback((element: HTMLElement, property: string, value: string) => {
    // 更新对应页面的内容
    if (selectedPage) {
      // 获取更新后的完整HTML
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentDocument) {
        const updatedHTML = iframe.contentDocument.documentElement.outerHTML;

        setPages(prev => prev.map(p =>
          p.id === selectedPageId
            ? { ...p, content: updatedHTML, updated: new Date() }
            : p
        ));
      }
    }
  }, [selectedPageId, selectedPage]);

  // 保存到��端
  const handleSave = async () => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages })
      });

      if (response.ok) {
        alert('保���成功���');
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">网页制作工具</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex < 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            撤销
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4 mr-2" />
            重做
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCodeEditor(!showCodeEditor)}
          >
            <Code className="w-4 h-4 mr-2" />
            {showCodeEditor ? '关闭源码' : '源码编辑'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportSingleFile}
          >
            <Upload className="w-4 h-4 mr-2" />
            导��SingleFile
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 左侧面板 */}
        <div className="w-80 bg-white border-r flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col justify-start items-center overflow-hidden" style={{ width: '315.2px', margin: '0 auto' }}>
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="pages" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                页面
              </TabsTrigger>
              <TabsTrigger value="elements" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                元素库
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                设置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="flex-1 px-4 pb-4">
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 现在可以直接在中间画布编辑页面元素，点击顶部"源��编辑"查看HTML代码
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">页面列表</h3>
                <Dialog open={showAddPageDialog} onOpenChange={setShowAddPageDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      新增页面
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新增页面</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">页面名称</Label>
                        <Input
                          id="name"
                          value={newPageData.name}
                          onChange={(e) => setNewPageData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="例如：关于我们"
                        />
                      </div>
                      <div>
                        <Label htmlFor="route">页面路由</Label>
                        <Input
                          id="route"
                          value={newPageData.route}
                          onChange={(e) => setNewPageData(prev => ({ ...prev, route: e.target.value }))}
                          placeholder="例如：/about"
                        />
                      </div>
                      <div>
                        <Label htmlFor="template">页面模板</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="选择页面模板" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blank">空白页面</SelectItem>
                            <SelectItem value="landing">落地页</SelectItem>
                            <SelectItem value="about">关于页面</SelectItem>
                            <SelectItem value="contact">联系页面</SelectItem>
                            <SelectItem value="blog">博客���面</SelectItem>
                            <SelectItem value="portfolio">作品集</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddPageDialog(false)}>
                          取消
                        </Button>
                        <Button onClick={handleAddPage}>
                          创建
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {pages.map(page => (
                  <Card 
                    key={page.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedPageId === page.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedPageId(page.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{page.name}</h4>
                          <p className="text-xs text-gray-500">{page.route}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            更新：{page.updated.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPage(page);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="elements" className="flex-1 px-4 pb-4 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                  width: 8px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                  background: #c1c1c1;
                  border-radius: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                  background: #a1a1a1;
                }
              `}</style>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">HTML元素库</h3>
                  <Badge variant="outline">点击按钮操作</Badge>
                </div>

                <div className="p-2 bg-blue-50 rounded text-xs text-blue-800">
                  💡 点击元素下方的按钮来插入、替换或���加元素
                </div>

                <div className="space-y-3">
                  {/* 基础��素 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">基础元素</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative p-2 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold text-center">&lt;h1&gt;</div>
                            <div className="text-gray-600 mb-2 text-center">标题</div>
                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'h1',
                                      content: '标题文本'
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'h1',
                                      content: '标题文本'
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'h1',
                                      content: '标题文本'
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>


                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold">&lt;img&gt;</div>
                            <div className="text-gray-600 mb-3">图片</div>
                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'img',
                                      attributes: {
                                        src: 'https://via.placeholder.com/150x100',
                                        alt: '图片描述'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'img',
                                      attributes: {
                                        src: 'https://via.placeholder.com/150x100',
                                        alt: '图片描述'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'img',
                                      attributes: {
                                        src: 'https://via.placeholder.com/150x100',
                                        alt: '图片描述'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold">&lt;button&gt;</div>
                            <div className="text-gray-600 mb-3">按钮</div>
                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'button',
                                      content: '按钮文本'
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'button',
                                      content: '按钮��本'
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'button',
                                      content: '按钮文本'
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold">&lt;input&gt;</div>
                            <div className="text-gray-600 mb-3">输入框</div>
                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'input',
                                      attributes: {
                                        type: 'text',
                                        placeholder: '请输入...'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'input',
                                      attributes: {
                                        type: 'text',
                                        placeholder: '请输入...'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'input',
                                      attributes: {
                                        type: 'text',
                                        placeholder: '请输入...'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold">&lt;div&gt;</div>
                            <div className="text-gray-600 mb-3">容器</div>
                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'div',
                                      content: '容器内容',
                                      attributes: {
                                        style: 'padding: 20px; border: 1px solid #ddd; min-height: 50px; border-radius: 4px;'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'div',
                                      content: '容器内容',
                                      attributes: {
                                        style: 'padding: 20px; border: 1px solid #ddd; min-height: 50px; border-radius: 4px;'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'div',
                                      content: '容器内容',
                                      attributes: {
                                        style: 'padding: 20px; border: 1px solid #ddd; min-height: 50px; border-radius: 4px;'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold">&lt;span&gt;</div>
                            <div className="text-gray-600 mb-3">行内元素</div>
                            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'span',
                                      content: '行内文本',
                                      attributes: {
                                        style: 'padding: 4px 8px; background: #f0f0f0; border-radius: 3px;'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'span',
                                      content: '行内文本',
                                      attributes: {
                                        style: 'padding: 4px 8px; background: #f0f0f0; border-radius: 3px;'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'span',
                                      content: '行内文本',
                                      attributes: {
                                        style: 'padding: 4px 8px; background: #f0f0f0; border-radius: 3px;'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 表单元素 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">表单元素</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative p-2 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold text-center">&lt;form&gt;</div>
                            <div className="text-gray-600 mb-2 text-center">表单</div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'form',
                                      content: '<label>输入框:</label><input type="text" placeholder="请输入内容"><button type="submit">提交</button>',
                                      attributes: {
                                        style: 'padding: 20px; border: 1px solid #ddd; border-radius: 8px;'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'form',
                                      content: '<label>输入框:</label><input type="text" placeholder="请输入内容"><button type="submit">提交</button>',
                                      attributes: {
                                        style: 'padding: 20px; border: 1px solid #ddd; border-radius: 8px;'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'form',
                                      content: '<label>输入框:</label><input type="text" placeholder="请输入内容"><button type="submit">提交</button>',
                                      attributes: {
                                        style: 'padding: 20px; border: 1px solid #ddd; border-radius: 8px;'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="relative p-2 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold text-center">&lt;textarea&gt;</div>
                            <div className="text-gray-600 mb-2 text-center">文本域</div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'textarea',
                                      content: '请输入多行文本...',
                                      attributes: {
                                        rows: '4',
                                        placeholder: '请输入多行文本...',
                                        style: 'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'textarea',
                                      content: '请输入多行文本...',
                                      attributes: {
                                        rows: '4',
                                        placeholder: '请输入多行文本...',
                                        style: 'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'textarea',
                                      content: '请输入多行文本...',
                                      attributes: {
                                        rows: '4',
                                        placeholder: '请输入多行文本...',
                                        style: 'width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="relative p-2 border rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md text-xs transition-all duration-300 group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          <div className="relative z-10">
                            <div className="font-mono text-blue-600 font-semibold text-center">&lt;select&gt;</div>
                            <div className="text-gray-600 mb-2 text-center">下拉框</div>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'select',
                                      content: '<option value="">请选择...</option><option value="1">选项1</option><option value="2">选项2</option><option value="3">选项3</option>',
                                      attributes: {
                                        style: 'padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 150px;'
                                      }
                                    }, 'insert');
                                  }
                                }}
                              >
                                📝 插入
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-orange-100 border-orange-200 text-orange-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'select',
                                      content: '<option value="">请选择...</option><option value="1">选项1</option><option value="2">选项2</option><option value="3">选项3</option>',
                                      attributes: {
                                        style: 'padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 150px;'
                                      }
                                    }, 'replace');
                                  }
                                }}
                              >
                                🔄 替换
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 bg-white/80 hover:bg-green-100 border-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => {
                                  const addElementToPage = (window as any).addElementToPage;
                                  if (addElementToPage) {
                                    addElementToPage({
                                      tag: 'select',
                                      content: '<option value="">请选择...</option><option value="1">选项1</option><option value="2">选项2</option><option value="3">选项3</option>',
                                      attributes: {
                                        style: 'padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 150px;'
                                      }
                                    }, 'append');
                                  }
                                }}
                              >
                                ➕ 追加
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 内置组件 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">内置组件</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-md text-xs transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center justify-center h-12 mb-2">
                            <div className="w-8 h-6 bg-blue-400 rounded flex items-center justify-center text-white text-xs">💳</div>
                          </div>
                          <div className="text-center text-gray-600 text-xs">信用卡支付</div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-md text-xs transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center justify-center h-12 mb-2">
                            <div className="w-8 h-6 bg-yellow-400 rounded flex items-center justify-center text-white text-xs">📄</div>
                          </div>
                          <div className="text-center text-gray-600 text-xs">卡图标</div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-md text-xs transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center justify-center h-12 mb-2">
                            <div className="w-8 h-6 bg-blue-400 rounded flex items-center justify-center text-white text-xs">💳</div>
                          </div>
                          <div className="text-center text-gray-600 text-xs">信用卡组��</div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-md text-xs transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center justify-center h-12 mb-2">
                            <div className="w-8 h-6 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">🕐</div>
                          </div>
                          <div className="text-center text-gray-600 text-xs">倒计时</div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-md text-xs transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center justify-center h-12 mb-2">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-center text-gray-600 text-xs">加载提示</div>
                        </div>
                        <div className="relative p-3 border rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:shadow-md text-xs transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center justify-center h-12 mb-2">
                            <div className="w-6 h-6 bg-green-400 rounded flex items-center justify-center text-white text-xs">✓</div>
                          </div>
                          <div className="text-center text-gray-600 text-xs">完成提示</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 px-4 pb-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">导出设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      导出所有页面
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="w-4 h-4 mr-2" />
                      发布到线上
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 中间编辑器区域 */}
        <div className="flex-1 flex flex-col">
          {/* 源码编辑器（可切换显示） */}
          {showCodeEditor && selectedPage && (
            <div className="h-80 border-b bg-white flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span className="text-sm text-gray-700 font-medium">HTML源码编辑</span>
                  <Badge variant="outline" className="text-xs">实时同步</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCodeEditor(false)}
                  className="text-xs h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <div className="flex-1 relative">
                <Textarea
                  value={selectedPage.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="absolute inset-0 resize-none border-none rounded-none font-mono text-sm leading-relaxed"
                  placeholder="在此编辑HTML源码..."
                  style={{ minHeight: '100%' }}
                />
              </div>
            </div>
          )}

          {/* 页面编辑器 */}
          <div className="flex-1">
            {selectedPage ? (
              <Editor
                key={selectedPageId}
                content={selectedPage.content}
                onChange={handleContentChange}
                pageName={selectedPage.name}
                onElementSelect={setSelectedElement}
                ref={(editorRef: any) => {
                  if (editorRef) {
                    (window as any).addElementToPage = editorRef.addElementToPage;
                  }
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">请选择一个页面进行编辑</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧属性编辑面��� */}
        <PropertyPanel
          selectedElement={selectedElement}
          onElementUpdate={handleElementUpdate}
        />
      </div>

      {/* 编辑页面对话框 */}
      <Dialog open={showEditPageDialog} onOpenChange={setShowEditPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑页面</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">页面名称</Label>
                <Input
                  id="edit-name"
                  value={editingPage.name}
                  onChange={(e) => setEditingPage(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-route">页面路由</Label>
                <Input
                  id="edit-route"
                  value={editingPage.route}
                  onChange={(e) => setEditingPage(prev => prev ? { ...prev, route: e.target.value } : null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditPageDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleUpdatePage}>
                  保存
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 隐藏的文���输入 */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".html"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
