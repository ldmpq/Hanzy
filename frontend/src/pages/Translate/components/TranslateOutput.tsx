import { Leaf, Volume2, Copy, Check, Star } from 'lucide-react';

interface Props {
  inputText: string;
  resultText: string;
  pinyinResult: string;
  isLoading: boolean;
  isCopied: boolean;
  onCopy: () => void;
}

export const TranslateOutput = ({ inputText, resultText, pinyinResult, isLoading, isCopied, onCopy }: Props) => {
  const isError = resultText.includes('lỗi kết nối');

  return (
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
          <div className="animate-fade-in flex-1">
            {/* Căn lề mb-1 giống hệt bên trái để chữ ôm sát Pinyin */}
            <p className={`text-2xl font-medium leading-relaxed break-words mb-1 ${isError ? 'text-red-500 text-lg' : 'text-main'}`}>
              {resultText}
            </p>
            {pinyinResult && (
              <p className="text-base text-brand/80 font-medium tracking-wide">
                {pinyinResult}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mt-4">
        <button disabled={!resultText || isLoading || isError} className="p-2.5 rounded-full text-sub hover:text-brand hover:bg-brand/10 disabled:opacity-30 transition-colors">
          <Volume2 className="w-5 h-5" />
        </button>
        <button onClick={onCopy} disabled={!resultText || isLoading || isError} className="p-2.5 rounded-full text-sub hover:text-main hover:bg-line/50 disabled:opacity-30 transition-colors">
          {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
        </button>
        <div className="flex-1"></div>
        <button disabled={!resultText || isLoading || isError} className="p-2.5 rounded-full text-sub hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 transition-colors">
          <Star className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};