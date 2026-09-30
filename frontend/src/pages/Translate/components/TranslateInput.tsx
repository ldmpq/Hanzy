import { Mic, Volume2, X } from 'lucide-react';

interface Props {
  mode: 'translate' | 'convert';
  inputText: string;
  setInputText: (text: string) => void;
  pinyin?: string;
}

export const TranslateInput = ({ mode, inputText, setInputText, pinyin }: Props) => {
  return (
    <div className="relative p-6 md:p-8 flex flex-col group">
      <div className="flex-1 flex flex-col">

        <div className="grid">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'translate' ? "Nhập văn bản cần dịch..." : "Nhập chữ Hán cần chuyển đổi..."}
            className="col-start-1 row-start-1 w-full resize-none overflow-hidden bg-transparent text-main text-2xl placeholder:text-sub/40 focus:outline-none leading-relaxed"
            spellCheck="false"
            rows={1}
          />
          <div className="col-start-1 row-start-1 invisible whitespace-pre-wrap break-words text-2xl leading-relaxed pointer-events-none">
            {inputText || ' '}
          </div>
        </div>

        {pinyin && inputText && (
          <div className="mt-1 animate-fade-in">
            <p className="text-base text-brand/80 font-medium tracking-wide">
              {pinyin}
            </p>
          </div>
        )}

      </div>
      
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
  );
};