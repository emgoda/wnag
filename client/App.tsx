import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "@/components/AdminLayout";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { ControlTerminal } from "@/components/ControlTerminal";
import { WebMonitor } from "@/components/WebMonitor";
import { WebEditor } from "@/components/WebEditor";
import { PublishedSite } from "@/components/PublishedSite";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/control-panel" element={
            <AdminLayout>
              <ControlTerminal />
            </AdminLayout>
          } />
          <Route path="/web-monitor" element={
            <AdminLayout>
              <WebMonitor />
            </AdminLayout>
          } />
          <Route path="/web-creation" element={
            <AdminLayout>
              <WebEditor />
            </AdminLayout>
          } />
          <Route path="/data-access" element={
              <AdminLayout>
                <PlaceholderPage title="数据访问" description="数据访问功能正在开发中" />
              </AdminLayout>
            } />
            <Route path="/tasks" element={
              <AdminLayout>
                <PlaceholderPage title="所有任务" description="任务管理功能正在开发中" />
              </AdminLayout>
            } />
            <Route path="/settings" element={
              <AdminLayout>
                <PlaceholderPage title="系统设置" description="系统设置功能正在开发中" />
              </AdminLayout>
            } />
            <Route path="/published/:siteId" element={<PublishedSite />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

const container = document.getElementById("root")!;

// Clean approach to avoid multiple roots
let root = (container as any)._reactRoot;
if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(<App />);
