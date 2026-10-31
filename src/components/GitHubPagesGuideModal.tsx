import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Globe, Sparkles, Terminal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const workflowCode = `name: Deploy to GitHub Pages

on:
  push:
    branches: ['main', 'master']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci --legacy-peer-deps || npm install --legacy-peer-deps
          else
            npm install --legacy-peer-deps
          fi
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/90 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">GitHub Pages 部署指南</h2>
              <p className="text-xs text-stone-400">已為您配置完成 PWA 與相對路徑，零伺服器極速上線！</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-300">
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              <strong>專為 GitHub Pages 最佳化：</strong><br />
              1. 專案已在 <code className="px-1.5 py-0.5 bg-emerald-900/60 rounded text-emerald-300 font-mono">vite.config.ts</code> 設定 <code className="px-1.5 py-0.5 bg-emerald-900/60 rounded text-emerald-300 font-mono">base: './'</code>，部署在 <code className="text-white">username.github.io/repo-name/</code> 絕不會發生 404 資源缺失。<br />
              2. 所有植物筆記與自訂照片均存於瀏覽器本機 IndexedDB 與 LocalStorage，完全不需要後端伺服器！<br />
              3. 專案內已包含完整的 GitHub Actions 自動部屬腳本。
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center text-xs font-bold">1</span>
              建立 GitHub 倉庫並推送程式碼
            </h3>
            <p className="text-xs text-stone-400 ml-8">在 GitHub 上新建一個公開或私人倉庫，然後執行標準 Git 指令：</p>
            <div className="ml-8 relative group">
              <pre className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs font-mono text-stone-300 overflow-x-auto">
{`git init
git add .
git commit -m "feat: 植感野誌 PWA 植物百科"
git branch -M main
git remote add origin https://github.com/<你的用戶名>/<倉庫名稱>.git
git push -u origin main`}
              </pre>
              <button
                onClick={() => handleCopy(`git init\ngit add .\ngit commit -m "feat: 植感野誌 PWA 植物百科"\ngit branch -M main\ngit remote add origin https://github.com/<你的用戶名>/<倉庫名稱>.git\ngit push -u origin main`, 'git')}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 flex items-center gap-1.5 transition"
              >
                {copiedStep === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedStep === 'git' ? '已複製' : '複製指令'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center text-xs font-bold">2</span>
              在 GitHub 啟用 Pages 設定
            </h3>
            <div className="ml-8 space-y-2 text-xs text-stone-300">
              <p>1. 進入您的 GitHub 專案倉庫，點選頂部 <strong>Settings（設定）</strong>。</p>
              <p>2. 在左側選單點選 <strong>Pages</strong>。</p>
              <p>3. 在 <strong>Build and deployment</strong> 底下的 <strong>Source</strong> 下拉選單中，選擇：<br />
                <span className="inline-block mt-1 px-2.5 py-1 bg-stone-800 border border-stone-600 rounded text-amber-300 font-semibold">GitHub Actions</span>
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center text-xs font-bold">3</span>
              自動建置工作流程 (已為您預先建立)
            </h3>
            <p className="text-xs text-stone-400 ml-8">
              我們已經在專案中的 <code className="text-emerald-400 font-mono">.github/workflows/deploy.yml</code> 自動寫入了 GitHub Actions 工作流：
            </p>
            <div className="ml-8 relative">
              <pre className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs font-mono text-stone-400 max-h-40 overflow-y-auto">
{workflowCode}
              </pre>
              <button
                onClick={() => handleCopy(workflowCode, 'yml')}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 flex items-center gap-1.5 transition"
              >
                {copiedStep === 'yml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedStep === 'yml' ? '已複製' : '複製 Action'}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-200 border border-stone-700 flex items-center justify-center text-xs font-bold">4</span>
              手機開啟並點擊安裝
            </h3>
            <p className="text-xs text-stone-300 ml-8 leading-relaxed">
              部署成功後，GitHub Pages 會給您一個專屬網址（例如：<code className="text-emerald-400 font-mono">https://username.github.io/repo/</code>）。
              用手機 Safari 或 Chrome 開啟該網址，就會出現<strong>「下載到手機」</strong>或<strong>「加入主畫面」</strong>提示，一鍵就能在手機離線使用！
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium text-sm text-white transition active:scale-98"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
