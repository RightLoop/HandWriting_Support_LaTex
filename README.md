**此项目完全使用Google Gemini 3 Pro完成**
# **✍️ Handwritten LaTeX Note Generator (手写体 LaTeX 笔记生成器)**

一个基于 React \+ Vite 的极客工具，利用 SVG 滤镜和随机扰动算法，将枯燥的 LaTeX 数学公式和文本转换为极其逼真的手写笔记风格，支持 A4 打印导出。

## **✨ 功能特性 (Features)**

### **1\. 🎨 超逼真手写模拟 (Hyper-Realism)**

* **笔画微观扰动**: 利用 SVG feTurbulence 滤镜模拟墨水在纸张上的渗漏和笔尖的物理抖动，拒绝“电脑字体”的僵硬感。  
* **几何形态随机化**: 每个字符都会被赋予随机的**旋转 (Rotation)**、**垂直位移 (Vertical Jitter)** 和**切变 (Skew)**，模拟人类书写的随意性。  
* **动态字间距 (Dynamic Kerning)**: 根据字符类型（中文/英文）应用随机的字间距，模拟连笔或停顿。  
* **随机行高**: 每一行的基线高度都经过随机计算，还原真实书写时行距不完全一致的特征。

### **2\. 🔢 LaTeX 公式深度手写化**

* **符号重塑**: 针对 \\sqrt (根号)、\\approx (约等)、\\ge (大于等于)、\\implies (箭头) 等符号进行特殊处理，强制应用强力扭曲滤镜，使其看起来像画出来的而非打印出来的。  
* **字体融合**: 强制 LaTeX 变量 ($x, y, f$) 和算子 ($\\sin, \\lim$) 使用手写字体，消除了公式与正文的视觉割裂感。  
* **矢量抖动**: 对 LaTeX 生成的 SVG 路径（如分号线、根号顶线）应用噪声滤镜，使其线条不再笔直。

### **3\. 🛠 高度可定制**

* **自定义字体 (Killer Feature)**: 支持**直接上传本地 .ttf/.otf 字体文件**，网页自动解析并应用，无需安装到操作系统。  
* **预设风格**: 内置三种风格预设 —— **狂野 (Wild)**、**工整 (Neat)**、**可爱 (Cute)**，一键切换。  
* **纸张背景**: 提供 **方格纸 (Grid)**、**横线纸 (Lines)** 和 **白纸 (Blank)** 三种背景，支持墨水颜色和字号调节。  
* **参数微调**: 提供“潦草程度 (Chaos Level)”滑块，从“工整作业”到“狂草草稿”随意调节。

### **4\. 🖨️ A4 完美打印/导出**

* **打印级 CSS**: 内置 @media print 样式，点击导出时自动隐藏 UI 控件，移除背景阴影。  
* **绝对定位隔离**: 采用绝对定位策略，防止浏览器打印时的布局截断，确保 SVG 滤镜和背景纹理在 PDF 中完美呈现。  
* **标准尺寸**: 严格遵循 A4 纸张比例 (210mm x 297mm)。

## **🚀 本地部署指南 (Local Setup)**

本指南已修复常见的 Tailwind CSS v4+ PostCSS 兼容性问题及 Windows npx 路径错误，请严格按照步骤执行。

### **1\. 环境准备**

确保您的电脑已安装 **Node.js** (推荐 v18 或更高版本)。

* 检查命令: node \-v

### **2\. 初始化项目**

打开终端 (Terminal / CMD / PowerShell)，执行以下命令：
```
\# 1\. 创建 Vite 项目 (选择 React)  
npm create vite@latest handwritten-notes \-- \--template react

\# 2\. 进入项目目录  
cd handwritten-notes

\# 3\. 安装核心依赖  
npm install

\# 4\. 安装图标库  
npm install lucide-react
```
### **3\. 安装与配置 Tailwind CSS (关键步骤)**

为了避免版本冲突，请手动安装适配器包，并手动创建配置文件。

**3.1 安装依赖**
```
npm install \-D tailwindcss postcss autoprefixer @tailwindcss/postcss
```
3.2 创建配置文件 (手动创建，不要用命令)  
在项目根目录 (handwritten-notes/) 下，新建以下两个文件并填入对应内容：
```
* **文件 1: tailwind.config.js**  
  /\*\* @type {import('tailwindcss').Config} \*/  
  export default {  
    content: \[  
      "./index.html",  
      "./src/\*\*/\*.{js,ts,jsx,tsx}",  
    \],  
    theme: {  
      extend: {},  
    },  
    plugins: \[\],  
  }
```
```
* **文件 2: postcss.config.js**  
  export default {  
    plugins: {  
      '@tailwindcss/postcss': {},  
      autoprefixer: {},  
    },  
  }
```
3.3 引入样式  
打开 src/index.css，清空所有内容，仅保留以下三行：  
```
@tailwind base;  
@tailwind components;  
@tailwind utilities;
```
**也可以直接下载**

### **4\. 植入核心代码**

1. 打开 src/App.jsx。  
2. 清空文件内容。  
3. 将项目提供的完整 HandwrittenNotes.jsx 代码复制粘贴进去。  
4. 保存文件。

### **5\. 启动项目**
```
npm run dev
```
终端将显示访问地址（通常是 http://localhost:5173），在浏览器打开即可使用。

## **📖 使用说明 (Usage)**

1. **输入内容**: 左侧输入框支持 Markdown 文本和 LaTeX 公式。  
   * 行内公式: $ E \= mc^2 $  
   * 块级公式: $$ \\int\_0^\\infty f(x) dx $$  
2. **调整样式**:  
   * 拖动“潦草程度”滑块改变字迹抖动幅度。  
   * 点击“字体设置”选择预设或上传自己的字体文件（推荐使用手写风格字体）。  
3. **导出 PDF**:  
   * 点击右上角“导出 / 打印 PDF”按钮。  
   * 在浏览器的打印预览窗口中：  
     * **目标打印机**: 选择 "另存为 PDF" (Save as PDF)。  
     * **更多设置**: 务必勾选 **"背景图形" (Background graphics)**，否则网格线和纹理不会显示。  
     * **纸张尺寸**: 确保选择 A4。

## **🤝 贡献 (Contributing)**

欢迎提交 Issue 或 Pull Request 来改进笔迹算法或添加更多纸张预设！

## **📄 开源协议 (License)**
MIT License
