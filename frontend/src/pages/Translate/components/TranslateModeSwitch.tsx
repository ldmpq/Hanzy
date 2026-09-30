interface Props {
  mode: 'translate' | 'convert';
  onModeChange: (newMode: 'translate' | 'convert') => void;
}

export const TranslateModeSwitch = ({ mode, onModeChange }: Props) => {
  return (
    <div className="max-w-[1000px] mx-auto pt-8 pb-8 flex flex-col items-center">
      <div className="flex bg-surface p-1 rounded-xl shadow-sm border border-line mb-6">
        <button
          onClick={() => onModeChange('translate')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            mode === 'translate' ? 'bg-brand/10 text-brand shadow-sm' : 'text-sub hover:text-main'
          }`}
        >
          Dịch ngôn ngữ
        </button>
        <button
          onClick={() => onModeChange('convert')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            mode === 'convert' ? 'bg-brand/10 text-brand shadow-sm' : 'text-sub hover:text-main'
          }`}
        >
          Chuyển đổi chữ
        </button>
      </div>
    </div>
  );
};