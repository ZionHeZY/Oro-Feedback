# Oro-Feedback
Support Pages For Oro App

## GitHub Pages 部署

本仓库已包含静态网页文件，可直接启用 GitHub Pages 展示中英文隐私政策。

### 目录结构

- `index.html`：首页，包含中英隐私政策入口
- `privacy-policy-zh.html`：中文隐私政策
- `privacy-policy-en.html`：英文隐私政策
- `styles.css`：站点样式
- `privacy_policy`：中文隐私政策 Markdown 原文
- `privacy_policy_en`：英文隐私政策 Markdown 原文

### 启用 GitHub Pages

1. 打开仓库的 Settings → Pages
2. 在 Build and deployment 区域将 Source 设置为：`Deploy from a branch`
3. 选择 Branch：`main`，目录：`/ (root)`，保存
4. 稍等片刻，访问页面（例如）：`https://<你的 GitHub 用户名>.github.io/Oro-Feedback/`

### 自定义域名（可选）

如需绑定自定义域名，可在 Settings → Pages 中设置 Custom domain，并在仓库根目录添加 `CNAME` 文件。

### 本地预览

直接在浏览器打开 `index.html` 即可本地预览，无需构建。

