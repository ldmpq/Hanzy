import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useTranslate = () => {
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

  const currentSourceLang = mode === 'translate' ? transSource : convSource;
  const currentTargetLang = mode === 'translate' ? transTarget : convTarget;
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputText, mode, transSource, convSource, transTarget, convTarget, currentSourceLang, currentTargetLang]);

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

  return {
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
  };
};