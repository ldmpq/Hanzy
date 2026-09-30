import { useTranslate } from './hooks/useTranslate';
import { TranslateModeSwitch } from './components/TranslateModeSwitch';
import { TranslateHeader } from './components/TranslateHeader';
import { TranslateInput } from './components/TranslateInput';
import { TranslateOutput } from './components/TranslateOutput';

export default function Translate() {
  const {
    mode,
    inputText,
    resultText,
    pinyinResult,
    isLoading,
    isCopied,
    currentSourceLang,
    currentTargetLang,
    setInputText,
    handleSwap,
    handleModeChange,
    handleCopy
  } = useTranslate();

  const isSourceChinese = currentSourceLang === 'Tiếng Trung';
  const isTargetChinese = currentTargetLang === 'Tiếng Trung';

  return (
    <div className="min-h-screen bg-app font-sans pb-24 animate-fade-in relative transition-colors px-4 md:px-6">
      <TranslateModeSwitch mode={mode} onModeChange={handleModeChange} />

      <div className="max-w-[1000px] mx-auto space-y-12">
        <div className="bg-surface rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-line overflow-hidden flex flex-col">
          
          <TranslateHeader 
            sourceLang={currentSourceLang} 
            targetLang={currentTargetLang} 
            onSwap={handleSwap} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line min-h-[280px]">
            <TranslateInput 
              mode={mode} 
              inputText={inputText} 
              setInputText={setInputText}
              pinyin={isSourceChinese ? pinyinResult : ''}
            />
            
            <TranslateOutput 
              inputText={inputText}
              resultText={resultText}
              pinyinResult={isTargetChinese ? pinyinResult : ''}
              isLoading={isLoading}
              isCopied={isCopied}
              onCopy={handleCopy}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}