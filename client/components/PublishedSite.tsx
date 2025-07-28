import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export function PublishedSite() {
  const { siteId } = useParams();
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSite = () => {
      try {
        const sites = JSON.parse(localStorage.getItem('published_sites') || '[]');
        const site = sites.find(s => s.id === siteId);
        
        if (site) {
          setSiteData(site);
        } else {
          setError('网站不存在或已被删除');
        }
      } catch (err) {
        setError('加载网站失败');
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - 网站不存在</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{siteData.name}</h1>
            <p className="text-sm text-gray-500">
              发布于 {new Date(siteData.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(window.location.href, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          新窗口打开
        </Button>
      </div>

      {/* 网站内容 */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border">
          <iframe
            srcDoc={siteData.html}
            className="w-full h-[calc(100vh-120px)] border-0"
            title={siteData.name}
            sandbox="allow-scripts allow-forms allow-modals allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
