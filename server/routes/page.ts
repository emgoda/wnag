import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import archiver from "archiver";

// 模拟数据库存储 (在实际项目中应该使用数据库)
let pages: any[] = [];
let pageIdCounter = 1;

// 保存页面 JSON 配置
export async function handlePageSave(req: Request, res: Response) {
  try {
    const { siteName, elements, css, js, pages: sitePages } = req.body;
    
    if (!siteName || !elements) {
      return res.status(400).json({ 
        error: "缺少必要参数", 
        message: "siteName 和 elements 是必需的" 
      });
    }

    const pageData = {
      id: `page_${pageIdCounter++}`,
      siteName,
      elements,
      css: css || '',
      js: js || '',
      pages: sitePages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'saved'
    };

    // 检查是否是更新现有页面
    const existingPageIndex = pages.findIndex(p => p.siteName === siteName);
    if (existingPageIndex !== -1) {
      pages[existingPageIndex] = { ...pages[existingPageIndex], ...pageData, id: pages[existingPageIndex].id };
      pageData.id = pages[existingPageIndex].id;
    } else {
      pages.push(pageData);
    }

    res.json({
      success: true,
      message: "页面保存成功",
      data: {
        id: pageData.id,
        siteName: pageData.siteName,
        savedAt: pageData.updatedAt
      }
    });

  } catch (error) {
    console.error('保存页面失败:', error);
    res.status(500).json({ 
      error: "保存失败", 
      message: error instanceof Error ? error.message : "未知错误" 
    });
  }
}

// 导出 HTML 打包 ZIP
export async function handlePageExport(req: Request, res: Response) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        error: "缺少页面ID", 
        message: "请提供要导出的页面ID" 
      });
    }

    const page = pages.find(p => p.id === id);
    if (!page) {
      return res.status(404).json({ 
        error: "页面不存在", 
        message: "找不到指定的页面" 
      });
    }

    // 生成 HTML 内容
    const htmlContent = generateHTMLFromElements(page.elements, page.css, page.js, page.siteName);
    
    // 创建 ZIP 文件
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${page.siteName}.zip"`);
    
    archive.pipe(res);
    
    // 添加 HTML 文件
    archive.append(htmlContent, { name: 'index.html' });
    
    // 添加样式文件
    if (page.css) {
      archive.append(page.css, { name: 'styles.css' });
    }
    
    // 添加脚本文件
    if (page.js) {
      archive.append(page.js, { name: 'script.js' });
    }
    
    // 添加项目配置文件
    const projectConfig = {
      name: page.siteName,
      version: "1.0.0",
      description: `${page.siteName} - 由网页制作工具生成`,
      elements: page.elements,
      pages: page.pages,
      exportedAt: new Date().toISOString()
    };
    archive.append(JSON.stringify(projectConfig, null, 2), { name: 'project.json' });
    
    // 添加 README 文件
    const readmeContent = `# ${page.siteName}

此项目由网页制作工具自动生成。

## 文件说明

- \`index.html\` - 主页面文件
- \`styles.css\` - 样式文件
- \`script.js\` - 脚本文件
- \`project.json\` - 项目配置文件

## 部署说明

1. 将所有文件上传到你的网站服务器
2. 确保 index.html 作为首页
3. 如需修改，可重新导入 project.json 到网页制作工具

生成时间: ${new Date().toLocaleString('zh-CN')}
`;
    archive.append(readmeContent, { name: 'README.md' });
    
    await archive.finalize();

  } catch (error) {
    console.error('导出页面失败:', error);
    res.status(500).json({ 
      error: "导出失败", 
      message: error instanceof Error ? error.message : "未知错误" 
    });
  }
}

// 一键部署到 OSS/CDN
export async function handlePagePublish(req: Request, res: Response) {
  try {
    const { id, deployConfig } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        error: "缺少页面ID", 
        message: "请提供要发布的页面ID" 
      });
    }

    const page = pages.find(p => p.id === id);
    if (!page) {
      return res.status(404).json({ 
        error: "页面不存在", 
        message: "找不到指定的页面" 
      });
    }

    // 模拟部署过程
    const deployId = `deploy_${Date.now()}`;
    const deployUrl = `https://${page.siteName.toLowerCase().replace(/\s+/g, '-')}.example.com`;
    
    // 更新页面状态
    const pageIndex = pages.findIndex(p => p.id === id);
    if (pageIndex !== -1) {
      pages[pageIndex] = {
        ...pages[pageIndex],
        status: 'published',
        deployId,
        deployUrl,
        publishedAt: new Date().toISOString()
      };
    }

    // 模拟部署延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: "页面发布成功",
      data: {
        deployId,
        deployUrl,
        siteName: page.siteName,
        publishedAt: new Date().toISOString(),
        status: 'published'
      }
    });

  } catch (error) {
    console.error('发布页面失败:', error);
    res.status(500).json({ 
      error: "发布失败", 
      message: error instanceof Error ? error.message : "未知错误" 
    });
  }
}

// 查询用户的所有页面
export async function handlePageList(req: Request, res: Response) {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let filteredPages = [...pages];
    
    // 按状态筛选
    if (status && status !== 'all') {
      filteredPages = filteredPages.filter(p => p.status === status);
    }
    
    // 搜索筛选
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredPages = filteredPages.filter(p => 
        p.siteName.toLowerCase().includes(searchTerm)
      );
    }
    
    // 分页
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedPages = filteredPages.slice(startIndex, endIndex);
    
    // 格式化返回数据
    const formattedPages = paginatedPages.map(p => ({
      id: p.id,
      siteName: p.siteName,
      status: p.status,
      elementsCount: p.elements ? p.elements.length : 0,
      pagesCount: p.pages ? p.pages.length : 1,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      publishedAt: p.publishedAt || null,
      deployUrl: p.deployUrl || null
    }));

    res.json({
      success: true,
      data: {
        pages: formattedPages,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: filteredPages.length,
          totalPages: Math.ceil(filteredPages.length / limitNum)
        },
        filters: {
          status: status || 'all',
          search: search || ''
        }
      }
    });

  } catch (error) {
    console.error('获取页面列表失败:', error);
    res.status(500).json({ 
      error: "获取失败", 
      message: error instanceof Error ? error.message : "未知错误" 
    });
  }
}

// 获取单个页面配置
export async function handlePageGet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: "缺少页面ID", 
        message: "请提供页面ID" 
      });
    }

    const page = pages.find(p => p.id === id);
    if (!page) {
      return res.status(404).json({ 
        error: "页面不存在", 
        message: "找不到指定的页面" 
      });
    }

    res.json({
      success: true,
      data: page
    });

  } catch (error) {
    console.error('获取页面失败:', error);
    res.status(500).json({ 
      error: "获取失败", 
      message: error instanceof Error ? error.message : "未知错误" 
    });
  }
}

// 生成 HTML 内容的辅助函数
function generateHTMLFromElements(elements: any[], css: string = '', js: string = '', siteName: string = '网站'): string {
  const generateElementHTML = (element: any): string => {
    const styleStr = element.style ? 
      Object.entries(element.style)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ') : '';
    
    const attrs = {
      style: styleStr,
      class: element.className || '',
      id: element.htmlId || ''
    };
    
    const attrStr = Object.entries(attrs)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    switch (element.type) {
      case 'text':
        return `<div ${attrStr}>${element.content || '文本内容'}</div>`;
      
      case 'heading':
        const tag = element.level || 'h1';
        return `<${tag} ${attrStr}>${element.content || '标题'}</${tag}>`;
      
      case 'button':
        return `<button ${attrStr} type="button">${element.content || '按钮'}</button>`;
      
      case 'input':
        return `<input ${attrStr} type="${element.inputType || 'text'}" placeholder="${element.placeholder || ''}" value="${element.value || ''}" />`;
      
      case 'textarea':
        return `<textarea ${attrStr} placeholder="${element.placeholder || ''}">${element.value || ''}</textarea>`;
      
      case 'image':
        return `<img ${attrStr} src="${element.src || ''}" alt="${element.alt || ''}" />`;
      
      case 'link':
        return `<a ${attrStr} href="${element.href || '#'}">${element.content || '链接'}</a>`;
      
      case 'divider':
        return `<hr ${attrStr} />`;
      
      case 'container':
      case 'card':
      case 'row':
      case 'column':
      case 'grid':
        const childrenHTML = element.children ? 
          element.children.map(generateElementHTML).join('\n') : '';
        return `<div ${attrStr}>${childrenHTML}</div>`;
      
      case 'form':
        const formChildrenHTML = element.children ? 
          element.children.map(generateElementHTML).join('\n') : '';
        return `<form ${attrStr} method="${element.method || 'POST'}" action="${element.action || ''}">${formChildrenHTML}</form>`;
      
      default:
        return `<div ${attrStr}>${element.content || element.type}</div>`;
    }
  };

  const elementsHTML = elements.map(generateElementHTML).join('\n');
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteName}</title>
    <meta name="generator" content="网页制作工具">
    <meta name="description" content="${siteName} - 使用网页制作工具创建">
    ${css ? `<style>\n${css}\n</style>` : ''}
    ${css ? '<link rel="stylesheet" href="styles.css">' : ''}
</head>
<body>
    ${elementsHTML}
    ${js ? `<script>\n${js}\n</script>` : ''}
    ${js ? '<script src="script.js"></script>' : ''}
</body>
</html>`;
}
