import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowRightLeft, Copy, Volume2, X, Star, Check, Mic, Leaf } from 'lucide-react';

export default function Translate() {
  const [mode, setMode] = useState<'translate' | 'convert'>('translate');
  
  const [transSource, setTransSource] = useState('Tiếng Việt');
  const [transTarget, setTransTarget] = useState('Tiếng Trung');
  
  const [convSource, setConvSource] = useState('Giản thể (简体)');
  const [convTarget, setConvTarget] = useState('Phồn thể (繁體)');

  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [pinyinResult, setPinyinResult] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // LOGIC TÍCH HỢP API BACKEND
  useEffect(() => {
    if (!inputText.trim()) {
      setResultText('');
      setPinyinResult('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        if (mode === 'translate') {
          // 1. Ánh xạ ngôn ngữ chuẩn cho API Dịch thuật
          const sourceCode = currentSourceLang === 'Tiếng Việt' ? 'vi' : 'zh-cn';
          const targetCode = currentTargetLang === 'Tiếng Trung' ? 'zh-cn' : 'vi';
          
          const response = await axios.post('http://localhost:5000/api/translate', {
            text: inputText,
            source: sourceCode,
            target: targetCode
          });
          
          setResultText(response.data.data.translatedText);
          setPinyinResult(response.data.data.pinyinResult || '');
          
        } else {
          // 2. Ánh xạ loại chuyển đổi Giản <-> Phồn
          const convertType = currentSourceLang === 'Giản thể (简体)' ? 's2t' : 't2s';
          
          const response = await axios.post('http://localhost:5000/api/translate/convert', {
            text: inputText,
            type: convertType
          });
          
          setResultText(response.data.data.resultText);
          setPinyinResult('');
        }
      } catch (error) {
        console.error("API Error:", error);
        setResultText('Máy chủ đang bận hoặc có lỗi kết nối. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    }, 600); // Debounce 600ms

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputText, mode, transSource, convSource]);

  const handleSwap = () => {
    if (mode === 'translate') {
      setTransSource(transTarget);
      setTransTarget(transSource);
    } else {
      setConvSource(convTarget);
      setConvTarget(convSource);
    }
    
    if (resultText && !resultText.includes('Máy chủ đang bận')) {
      setInputText(resultText);
    }
  };

  const handleModeChange = (newMode: 'translate' | 'convert') => {
    setMode(newMode);
    setInputText(''); 
  };

  const handleCopy = () => {
    if (!resultText || resultText.includes('Máy chủ đang bận')) return;
    const textToCopy = pinyinResult ? `${resultText}\n${pinyinResult}` : resultText;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentSourceLang = mode === 'translate' ? transSource : convSource;
  const currentTargetLang = mode === 'translate' ? transTarget : convTarget;

  return (
    <div className="min-h-screen bg-app font-sans pb-24 animate-fade-in relative transition-colors px-4 md:px-6">
      
      <div className="max-w-[1000px] mx-auto pt-8 pb-8 flex flex-col items-center">
        <div className="flex bg-surface p-1 rounded-xl shadow-sm border border-line mb-6">
          <button
            onClick={() => handleModeChange('translate')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'translate' ? 'bg-brand/10 text-brand shadow-sm' : 'text-sub hover:text-main'
            }`}
          >
            Dịch ngôn ngữ
          </button>
          <button
            onClick={() => handleModeChange('convert')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'convert' ? 'bg-brand/10 text-brand shadow-sm' : 'text-sub hover:text-main'
            }`}
          >
            Chuyển đổi chữ
          </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto space-y-12">
        <div className="bg-surface rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-line overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <div className="flex-1 text-center md:text-left">
              <span className="font-bold text-brand text-sm md:text-base tracking-wide uppercase transition-all">
                {currentSourceLang}
              </span>
            </div>
            
            <button 
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-app hover:bg-line/50 border border-line flex items-center justify-center text-sub hover:text-main transition-all shrink-0 mx-4 active:scale-95"
              title="Đảo chiều"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            
            <div className="flex-1 text-center md:text-right">
              <span className="font-bold text-brand text-sm md:text-base tracking-wide uppercase transition-all">
                {currentTargetLang}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line min-h-[280px]">
            
            <div className="relative p-6 md:p-8 flex flex-col group">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'translate' ? "Nhập văn bản cần dịch..." : "Nhập chữ Hán cần chuyển đổi..."}
                className="w-full flex-1 resize-none bg-transparent text-main text-2xl placeholder:text-sub/40 focus:outline-none leading-relaxed"
                spellCheck="false"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  <button className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button disabled={!inputText} className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 disabled:opacity-30 transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-sub/60">{inputText.length} / 5000</span>
                  {inputText && (
                    <button onClick={() => setInputText('')} className="p-1.5 rounded-full bg-line/50 text-sub hover:text-main hover:bg-line transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col bg-app/20">
              <div className="flex-1 flex flex-col">
                
                {!inputText ? (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 select-none">
                    <div className="w-16 h-16 bg-line rounded-full flex items-center justify-center mb-4">
                      <Leaf className="w-8 h-8 text-sub" />
                    </div>
                    <p className="text-base font-medium text-sub">Nhập nội dung để bắt đầu</p>
                  </div>
                ) : isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-line/50 rounded w-3/4"></div>
                    <div className="h-6 bg-line/50 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <p className={`text-2xl font-medium leading-relaxed break-words mb-4 ${resultText.includes('lỗi kết nối') ? 'text-red-500 text-lg' : 'text-main'}`}>
                      {resultText}
                    </p>
                    {pinyinResult && (
                      <p className="text-lg text-brand font-medium tracking-wide">
                        {pinyinResult}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 mt-4">
                <button disabled={!resultText || isLoading || resultText.includes('lỗi kết nối')} className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 disabled:opacity-30 transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
                <button onClick={handleCopy} disabled={!resultText || isLoading || resultText.includes('lỗi kết nối')} className="p-2.5 rounded-full text-sub hover:text-main hover:bg-line/50 disabled:opacity-30 transition-colors">
                  {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
                <div className="flex-1"></div>
                <button disabled={!resultText || isLoading || resultText.includes('lỗi kết nối')} className="p-2.5 rounded-full text-sub hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}