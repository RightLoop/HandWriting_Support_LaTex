import React, { useState, useEffect, useRef } from 'react';
import { Settings, Download, RotateCcw, Type, PenTool, Grid, Minus, Eraser, Upload, RefreshCw } from 'lucide-react';

// Simplified KaTeX rendering component
const Latex = ({ children, className = "", loaded }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.katex && containerRef.current) {
      try {
        window.katex.render(children, containerRef.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {
        console.error("KaTeX render error", e);
        containerRef.current.innerText = children;
      }
    }
  }, [children, loaded]);

  return <span ref={containerRef} className={className} />;
};

// SVG Filters for Ink Effect
const InkFilters = () => (
  // Added ID "ink-filters" to ensure we can target it in @media print
  <svg id="ink-filters" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
    <defs>
      <filter id="ink-roughness">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.6" 
          numOctaves="2" 
          result="noise" 
        />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.4" />
      </filter>

      <filter id="symbol-distortion" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.0" result="warped" />
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="grain" />
        <feDisplacementMap in="warped" in2="grain" scale="0.5" result="grainy" />
        <feMorphology operator="dilate" radius="0.4" in="grainy" result="thickened" />
        <feComposite operator="in" in="SourceGraphic" in2="thickened" />
      </filter>

      <filter id="math-distortion" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="roughness" />
        <feDisplacementMap in="SourceGraphic" in2="roughness" scale="1.5" result="distorted" />
        <feMorphology operator="dilate" radius="0.3" in="distorted" result="thickened" />
        <feComposite operator="in" in="SourceGraphic" in2="thickened" />
      </filter>
    </defs>
  </svg>
);

// Font Presets Definition
const FONT_PRESETS = {
  wild: {
    name: "狂野 (Wild)",
    cn: '"Long Cang", cursive',
    en: '"Caveat", cursive',
    url: "https://fonts.googleapis.com/css2?family=Long+Cang&family=Caveat:wght@400;700&display=swap"
  },
  neat: {
    name: "工整 (Neat)",
    cn: '"Ma Shan Zheng", cursive',
    en: '"Patrick Hand", cursive',
    url: "https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Patrick+Hand&display=swap"
  },
  cute: {
    name: "可爱 (Cute)",
    cn: '"Zhi Mang Xing", cursive',
    en: '"Indie Flower", cursive',
    url: "https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&family=Indie+Flower&display=swap"
  }
};

const App = () => {
  // --- State ---
  const [text, setText] = useState(
    "已知 $\\sqrt{x} \\approx 1.414$，\n且 $x \\ge 2$，\n求证：\n$$ x^2 + y^2 \\le 10 \\implies y < 3 $$\n(修复了导出问题，现在应该能完美打印 A4 纸了！)"
  );
  const [chaosLevel, setChaosLevel] = useState(5); 
  const [inkColor, setInkColor] = useState('#2c3e50');
  const [paperType, setPaperType] = useState('grid');
  const [fontSize, setFontSize] = useState(24);
  const [isKatexLoaded, setIsKatexLoaded] = useState(false);
  
  // Font State
  const [activePreset, setActivePreset] = useState('wild');
  const [customFontFamily, setCustomFontFamily] = useState(null); 
  const [useCustomFont, setUseCustomFont] = useState(false);

  const previewRef = useRef(null);

  // --- External Scripts Loading ---
  useEffect(() => {
    if (window.katex) setIsKatexLoaded(true);

    const link = document.createElement('link');
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.async = true;
    script.onload = () => setIsKatexLoaded(true);
    document.body.appendChild(script);

    return () => {
      try {
        if(document.head.contains(link)) document.head.removeChild(link);
        if(document.body.contains(script)) document.body.removeChild(script);
      } catch(e) {}
    };
  }, []);

  // --- Dynamic Font Loader for Presets ---
  useEffect(() => {
    const oldLink = document.getElementById('dynamic-font-link');
    if (oldLink) oldLink.remove();

    if (!useCustomFont) {
      const fontLink = document.createElement('link');
      fontLink.id = 'dynamic-font-link';
      fontLink.href = FONT_PRESETS[activePreset].url;
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
    }
  }, [activePreset, useCustomFont]);

  // --- Handle Custom Font Upload ---
  const handleFontUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const fontName = `CustomFont_${Date.now()}`;
      const fontFace = new FontFace(fontName, buffer);
      
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setCustomFontFamily(fontName);
      setUseCustomFont(true);
      alert(`字体 "${file.name}" 加载成功！已自动应用。`);
    } catch (err) {
      console.error(err);
      alert("字体加载失败，请确保是有效的 .ttf 或 .otf 文件。");
    }
  };

  const currentCnFont = useCustomFont && customFontFamily ? customFontFamily : FONT_PRESETS[activePreset].cn;
  const currentEnFont = useCustomFont && customFontFamily ? customFontFamily : FONT_PRESETS[activePreset].en;

  // --- CSS Injection for KaTeX Overrides & Print Styles ---
  const HandStyleOverrides = () => (
    <style>{`
      /* KaTeX Fonts Override - Base */
      .katex { font-size: 1.1em !important; font-weight: 600 !important; }
      .katex .mathnormal, .katex .mathit { font-family: ${currentEnFont} !important; font-style: normal !important; font-weight: 700 !important; }
      
      /* 1. Basic Elements */
      .katex .mord:not(.mop), .katex .mainrm, .katex .mbin, .katex .mopen, .katex .mclose, .katex .mpunct { 
        font-family: ${currentEnFont} !important; 
        font-weight: 700 !important; 
        font-style: normal !important; 
      }
      
      /* 2. Relations (approx, ge, le, implies) & Arrows */
      .katex .mrel, .katex .mrel span {
        font-family: ${currentEnFont}, 'Comic Sans MS', sans-serif !important;
        font-weight: 800 !important;
        filter: url(#symbol-distortion);
      }
      
      /* 3. SVG Lines (Roots, Fractions, Arrow Shafts) */
      .katex svg path {
        filter: url(#ink-roughness);
      }

      /* 4. Root Symbol (√) */
      .katex .sqrt > .root {
        font-family: KaTeX_Main, sans-serif !important;
        filter: url(#symbol-distortion);
      }

      /* 5. Operators like *, + */
      .katex .mbin {
        font-family: ${currentEnFont} !important;
        font-weight: 800 !important;
      }

      .katex .mop, .katex .mop span { font-family: ${currentEnFont} !important; font-weight: 700 !important; font-style: normal !important; }
      .katex .base { margin-top: -2px; }

      /* === ROBUST PRINT STYLES === */
      @media print {
        @page { size: A4; margin: 0; }
        
        /* 1. Hide EVERYTHING by default */
        body { 
          visibility: hidden !important; 
          background-color: white !important; 
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }

        /* 2. Make the Paper & Filters Visible */
        #print-target, #print-target * {
          visibility: visible !important;
        }
        #ink-filters, #ink-filters * {
          visibility: visible !important;
        }

        /* 3. Position the Paper Absolutely to Top-Left */
        /* This escapes any parent flex/grid/overflow layout constraints */
        #print-target {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          margin: 0 !important;
          padding: 20mm !important; /* Keep the inner margin */
          width: 210mm !important;
          min-height: 297mm !important;
          
          /* Ensure graphics and colors print */
          background-color: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          
          /* Remove borders/shadows that look bad on paper */
          box-shadow: none !important;
          border: none !important;
          
          /* Ensure full overflow is printed */
          overflow: visible !important;
          display: block !important;
        }
      }
    `}</style>
  );

  const isChinese = (char) => /[\u4e00-\u9fa5]/.test(char);

  // --- Parser ---
  const parseContent = (inputText) => {
    const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\n)/g;
    const parts = inputText.split(regex);
    
    return parts.map((part, index) => {
      // 1. Random Line Spacing Logic
      if (part === '\n') {
        const randomHeight = fontSize * (0.6 + (Math.random() * chaosLevel * 0.1)); 
        return <div key={index} style={{ height: `${randomHeight}px`, width: '100%' }} />;
      }
      
      if (!part) return null;

      // 2. Block Math
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        const rotation = (Math.random() - 0.5) * chaosLevel * 1.5;
        return (
          <div key={index} className="w-full my-2 flex justify-center transform">
             <div style={{ 
                fontFamily: currentEnFont, 
                filter: 'url(#math-distortion)',
                transform: `rotate(${rotation}deg) scale(1.1)`, 
                color: inkColor,
                textShadow: `0.5px 0.5px 0px ${inkColor}aa` 
             }}>
                <Latex loaded={isKatexLoaded}>{math}</Latex>
             </div>
          </div>
        );
      } 
      // 3. Inline Math
      else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        const rotation = (Math.random() - 0.5) * chaosLevel * 2.0; 
        const yOffset = (Math.random() - 0.5) * chaosLevel * 1.5;
        return (
          <span key={index} className="inline-block mx-1" style={{
            filter: 'url(#math-distortion)', 
            transform: `translateY(${yOffset}px) rotate(${rotation}deg)`,
            color: inkColor,
            fontWeight: 'bold',
            textShadow: `0.2px 0.2px 0px ${inkColor}88`
          }}>
            <Latex loaded={isKatexLoaded}>{math}</Latex>
          </span>
        );
      } 
      // 4. Regular Text
      else {
        const segmentLineHeight = 1.6 + (Math.random() - 0.5) * (chaosLevel * 0.05);
        
        return (
          <span key={index} style={{ 
            lineHeight: segmentLineHeight, 
            display: 'inline',
            filter: 'url(#ink-roughness)', 
          }}>
            {part.split('').map((char, charIndex) => {
              const isCn = isChinese(char);
              const rotate = (Math.random() - 0.5) * chaosLevel * 3.0; 
              const skewX = (Math.random() - 0.5) * chaosLevel * 2.0; 
              const skewY = (Math.random() - 0.5) * chaosLevel * 1.0;
              const translateY = (Math.random() - 0.5) * chaosLevel * 1.5;
              const sizeScale = 1 + (Math.random() - 0.5) * (chaosLevel * 0.04);
              
              // TIGHT SPACING
              const marginRight = isCn 
                  ? (Math.random() * chaosLevel * 0.2) + 'px' 
                  : ((Math.random() - 0.3) * chaosLevel * 0.4) + 'px'; 
                  
              const font = isCn ? currentCnFont : currentEnFont;
              
              return (
                <span 
                  key={`${index}-${charIndex}`} 
                  style={{
                    display: 'inline-block',
                    transform: `translate(0, ${translateY}px) rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg) scale(${sizeScale})`,
                    fontFamily: font,
                    color: inkColor,
                    marginLeft: '-0.5px', 
                    marginRight: marginRight,
                    textShadow: `0.3px 0.3px 0px ${inkColor}40`
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      }
    });
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-800 flex flex-col items-center">
      <InkFilters />
      <HandStyleOverrides />
      
      <header className="mb-6 text-center max-w-2xl w-full no-print">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <PenTool className="w-8 h-8" />
          手写体生成器 (修复版)
        </h1>
        <p className="text-gray-500">
          导出修复 · 符号优化 · 极真手写
        </p>
      </header>

      <div className="w-full max-w-[1600px] flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-4 w-full lg:w-[400px] shrink-0 no-print">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700">
              <Type className="w-5 h-5" /> 字体设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">选择预设风格</label>
                <div className="flex gap-2">
                  {Object.entries(FONT_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => { setActivePreset(key); setUseCustomFont(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        !useCustomFont && activePreset === key 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' 
                        : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">或者</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">上传你的字体 (.ttf/.otf)</label>
                <div className="flex gap-2 items-center">
                  <label className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center transition-colors group">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 group-hover:text-gray-700">点击上传字体文件</span>
                    <input type="file" accept=".ttf,.otf" className="hidden" onChange={handleFontUpload} />
                  </label>
                  
                  {useCustomFont && (
                     <button onClick={() => setUseCustomFont(false)} className="text-xs text-red-500 underline whitespace-nowrap">还原</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" /> 纸张与笔迹
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">潦草程度 (Chaos): {chaosLevel}</label>
                <input 
                  type="range" min="0" max="15" value={chaosLevel} 
                  onChange={(e) => setChaosLevel(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">字号</label>
                  <input type="range" min="16" max="48" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                 </div>
                 <div className="flex-1">
                   <label className="text-sm font-medium text-gray-600 mb-2 block">背景</label>
                   <div className="flex gap-2">
                    <button onClick={() => setPaperType('grid')} className={`p-1.5 rounded ${paperType === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}><Grid size={18}/></button>
                    <button onClick={() => setPaperType('lines')} className={`p-1.5 rounded ${paperType === 'lines' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}><Minus size={18}/></button>
                    <button onClick={() => setPaperType('blank')} className={`p-1.5 rounded ${paperType === 'blank' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}><Eraser size={18}/></button>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">输入内容</label>
              <button onClick={() => setText("")} className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700"><RotateCcw size={12} /> 清空</button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 min-h-[150px] p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="输入文本..."
            />
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col flex-1 min-w-0">
           <div className="flex justify-between items-center mb-4 no-print">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <RefreshCw className="w-5 h-5" /> 预览效果
              </h2>
              <button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-md">
                <Download size={18} /> 导出 / 打印 PDF
              </button>
           </div>

           <div className="w-full overflow-auto bg-gray-200/80 rounded-xl border border-gray-300 p-4 md:p-8 flex justify-center print-container-wrapper">
             <div 
                ref={previewRef}
                id="print-target" // REQUIRED FOR PRINT STYLES
                className={`
                  print-container
                  relative shrink-0 shadow-2xl overflow-hidden
                  ${paperType === 'blank' ? 'bg-[#fdfdfd]' : 'bg-[#fffdf7]'}
                `}
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  backgroundImage: paperType === 'grid' 
                      ? 'linear-gradient(#e1e1e1 1px, transparent 1px), linear-gradient(90deg, #e1e1e1 1px, transparent 1px)' 
                    : paperType === 'lines'
                      ? 'linear-gradient(#e1e1e1 1px, transparent 1px)'
                      : 'none',
                  backgroundSize: paperType === 'grid' ? '24px 24px' : paperType === 'lines' ? '100% 32px' : 'auto',
                  backgroundAttachment: 'local'
                }}
             >
                <div className="p-[25mm] w-full h-full overflow-y-visible" style={{ fontSize: `${fontSize}px` }}>
                  <div className="whitespace-pre-wrap break-words">
                    {parseContent(text)}
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] no-print"></div>
             </div>
           </div>
           
           <div className="mt-4 text-center text-gray-500 text-xs no-print">
             提示：点击“导出”后，在弹出的打印窗口中选择“另存为 PDF”。<br/>
             请确保勾选“背景图形”以保留网格线。
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;