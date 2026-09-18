import { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, Volume2, X, History as HistoryIcon, Star, Check, Mic, Leaf } from 'lucide-react';

export default function Translate() {
  const [mode, setMode] = useState<'translate' | 'convert'>('translate');
  const [inputText, setInputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Giả lập trạng thái loading khi gõ
  useEffect(() => {
    if (inputText) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [inputText]);

  // MockData 1 
  const sourceLanguage = mode === 'translate' ? 'Tiếng Việt' : 'Giản thể (简体)';
  
  // MockData 2
  const targetLanguage = mode === 'translate' ? 'Tiếng Trung' : 'Phồn thể (繁體)';
  
  // MockData 3
  const translatedText = inputText.length > 0 
    ? (mode === 'translate' ? '你好，很高兴认识你。' : '難能可貴') 
    : '';
  
  // MockData 4
  const pinyinText = (inputText.length > 0 && mode === 'translate') 
    ? 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.' 
    : '';

  // MockData 5
  const historyItems = [
    { id: 1, type: 'translate', source: 'Xin chào', target: '你好', pinyin: 'Nǐ hǎo' },
    { id: 2, type: 'convert', source: '难能可贵', target: '難能可貴', pinyin: '' },
    { id: 3, type: 'translate', source: 'Tôi học tiếng Trung', target: '我学习中文', pinyin: 'Wǒ xuéxí zhōngwén' },
  ];

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSwap = () => {
    // Logic đảo chiều (frontend mock)
    setInputText(translatedText);
  };

  return (
    <div className="min-h-screen bg-app font-sans pb-24 animate-fade-in relative transition-colors px-4 md:px-6">
      
      {/* 1. HEADER & SEGMENTED CONTROL (Chuyển mode) */}
      <div className="max-w-[1000px] mx-auto pt-8 pb-8 flex flex-col items-center">
        
        {/* Nút chuyển Mode tinh tế, không làm rối giao diện */}
        <div className="flex bg-surface p-1 rounded-xl shadow-sm border border-line mb-6">
          <button
            onClick={() => { setMode('translate'); setInputText(''); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'translate' 
                ? 'bg-brand/10 text-brand' 
                : 'text-sub hover:text-main'
            }`}
          >
            Dịch ngôn ngữ
          </button>
          <button
            onClick={() => { setMode('convert'); setInputText(''); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'convert' 
                ? 'bg-brand/10 text-brand' 
                : 'text-sub hover:text-main'
            }`}
          >
            Chuyển đổi chữ
          </button>
        </div>
      </div>

      {/* 2. TRANSLATION WORKSPACE CHÍNH */}
      <div className="max-w-[1000px] mx-auto space-y-12">
        
        <div className="bg-surface rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-line overflow-hidden flex flex-col">
          
          {/* THANH NGÔN NGỮ */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <div className="flex-1 text-center md:text-left">
              <span className="font-bold text-brand text-sm md:text-base tracking-wide uppercase">
                {sourceLanguage}
              </span>
            </div>
            
            <button 
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-app hover:bg-line/50 border border-line flex items-center justify-center text-sub hover:text-main transition-all shrink-0 mx-4"
              title="Đảo chiều"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            
            <div className="flex-1 text-center md:text-right">
              <span className="font-bold text-brand text-sm md:text-base tracking-wide uppercase">
                {targetLanguage}
              </span>
            </div>
          </div>

          {/* KHU VỰC NHẬP / XUẤT (Chia đôi màn hình Desktop, Xếp chồng Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line min-h-[280px]">
            
            {/* --- BÊN TRÁI: INPUT --- */}
            <div className="relative p-6 md:p-8 flex flex-col group">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập văn bản cần dịch..."
                className="w-full flex-1 resize-none bg-transparent text-main text-2xl placeholder:text-sub/40 focus:outline-none leading-relaxed"
                spellCheck="false"
              />
              
              {/* Quick Actions Input */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  <button className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 transition-colors" title="Nhập bằng giọng nói">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    disabled={!inputText}
                    className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sub transition-colors" 
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-sub/60">{inputText.length} / 5000</span>
                  {inputText && (
                    <button 
                      onClick={() => setInputText('')}
                      className="p-1.5 rounded-full bg-line/50 text-sub hover:text-main hover:bg-line transition-all"
                      title="Xóa nội dung"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* --- BÊN PHẢI: OUTPUT --- */}
            <div className="relative p-6 md:p-8 flex flex-col bg-app/20">
              <div className="flex-1 flex flex-col">
                
                {!inputText ? (
                  // EMPTY STATE: Mascot Cây Hanzy mờ nhạt
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 select-none">
                    <div className="w-16 h-16 bg-line rounded-full flex items-center justify-center mb-4">
                      <Leaf className="w-8 h-8 text-sub" /> {/* Icon thay thế tạm cho Mascot Cây */}
                    </div>
                    <p className="text-base font-medium text-sub">Nhập nội dung để bắt đầu dịch</p>
                  </div>
                ) : isLoading ? (
                  // LOADING STATE: Skeleton tinh tế, không dùng spinner to
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-line/50 rounded w-3/4"></div>
                    <div className="h-6 bg-line/50 rounded w-1/2"></div>
                  </div>
                ) : (
                  // RESULT STATE
                  <div className="animate-fade-in">
                    <p className="text-2xl text-main font-medium leading-relaxed break-words mb-4">
                      {translatedText}
                    </p>
                    {pinyinText && (
                      <p className="text-lg text-brand font-medium tracking-wide">
                        {pinyinText}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions Output */}
              <div className="flex items-center gap-1 mt-4">
                <button 
                  disabled={!translatedText || isLoading}
                  className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sub transition-colors"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleCopy}
                  disabled={!translatedText || isLoading}
                  className="p-2.5 rounded-full text-sub hover:text-main hover:bg-line/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sub transition-colors"
                  title="Sao chép"
                >
                  {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
                
                <div className="flex-1"></div> {/* Spacer */}

                <button 
                  disabled={!translatedText || isLoading}
                  className="p-2.5 rounded-full text-sub hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sub transition-colors"
                  title="Lưu bản dịch"
                >
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* 3. LỊCH SỬ DỊCH GẦN ĐÂY */}
        <div>
          <div className="flex items-center gap-2 mb-6 px-2">
            <HistoryIcon className="w-5 h-5 text-sub" />
            <h3 className="text-base font-bold text-main">Lịch sử gần đây</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-2xl border border-transparent hover:border-line hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold text-sub bg-app px-2 py-1 rounded uppercase">
                      {item.type === 'translate' ? 'Dịch' : 'Chuyển đổi'}
                    </span>
                    <p className="text-sm font-medium text-sub truncate">{item.source}</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-base font-bold text-main group-hover:text-brand transition-colors">{item.target}</p>
                    {item.pinyin && <span className="text-xs font-medium text-sub">{item.pinyin}</span>}
                  </div>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-full text-sub hover:text-orange-500 hover:bg-orange-500/10 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}