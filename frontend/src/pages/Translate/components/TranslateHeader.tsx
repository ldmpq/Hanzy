import { ArrowRightLeft } from 'lucide-react';

interface Props {
  sourceLang: string;
  targetLang: string;
  onSwap: () => void;
}

export const TranslateHeader = ({ sourceLang, targetLang, onSwap }: Props) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-line">
      <div className="flex-1 text-center md:text-left">
        <span className="font-bold text-brand text-sm md:text-base tracking-wide uppercase transition-all">
          {sourceLang}
        </span>
      </div>
      
      <button 
        onClick={onSwap}
        className="w-10 h-10 rounded-full bg-app hover:bg-line/50 border border-line flex items-center justify-center text-sub hover:text-main transition-all shrink-0 mx-4 active:scale-95"
        title="Đảo chiều"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>
      
      <div className="flex-1 text-center md:text-right">
        <span className="font-bold text-brand text-sm md:text-base tracking-wide uppercase transition-all">
          {targetLang}
        </span>
      </div>
    </div>
  );
};