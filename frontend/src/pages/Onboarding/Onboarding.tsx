import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useOnboarding } from './hooks/useOnboarding';
import StepCurrentLevel from './components/StepCurrentLevel';
import StepGoal from './components/StepGoal';
import StepTargetLevel from './components/StepTargetLevel';
import StepCommitment from './components/StepCommitment';

export default function Onboarding() {
  const navigate = useNavigate();

  const {
    step, handleNext, handleBack, isStepValid,
    currentLevel, setCurrentLevel,
    learningGoals, toggleGoal,
    targetHskLevel, setTargetHskLevel,
    dailyCommitment, setDailyCommitment,
    loading
  } = useOnboarding({
    onSuccess: (data) => {
      console.log('Onboarding data saved:', data);
      navigate('/dashboard');
    }
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 font-sans relative">
      <div className="bg-white max-w-[500px] w-full rounded-[32px] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-neutral-100 relative mt-10">
        
        <div className="absolute -top-16 right-8 w-24 h-24 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center overflow-hidden p-2">
          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Panda" alt="Mascot" className="w-full h-full object-contain opacity-80" />
        </div>

        {/* Thanh Progress 4 bước */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#9E2A2B] tracking-tight mb-4">Leafyy</h1>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-6 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#9E2A2B]' : 'bg-neutral-200'}`}></div>
            <div className={`w-6 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#9E2A2B]' : 'bg-neutral-200'}`}></div>
            <div className={`w-6 h-1 rounded-full transition-colors ${step >= 3 ? 'bg-[#9E2A2B]' : 'bg-neutral-200'}`}></div>
            <div className={`w-6 h-1 rounded-full transition-colors ${step >= 4 ? 'bg-[#9E2A2B]' : 'bg-neutral-200'}`}></div>
          </div>
          <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase transition-all">Step {step} of 4</p>
        </div>

        {/* Render Step động */}
        {step === 1 && <StepCurrentLevel currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />}
        {step === 2 && <StepGoal learningGoals={learningGoals} toggleGoal={toggleGoal} />}
        {step === 3 && <StepTargetLevel targetHskLevel={targetHskLevel} setTargetHskLevel={setTargetHskLevel} />}
        {step === 4 && <StepCommitment dailyCommitment={dailyCommitment} setDailyCommitment={setDailyCommitment} />}

        {/* ================= CỤM NÚT CHỨC NĂNG ================= */}
        <div className="mt-10 flex flex-col gap-4">
          <div className="flex items-center gap-3 w-full">

            {step > 1 && (
              <button 
                onClick={handleBack}
                type="button"
                className="w-1/3 py-3.5 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center"
              >
                Back
              </button>
            )}

            <button 
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              className={`${step > 1 ? 'flex-1' : 'w-full'} bg-[#A32A29] hover:bg-[#8B2323] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:bg-neutral-300 disabled:text-neutral-500 shadow-sm`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 4 ? 'Complete Setup' : 'Continue')}
            </button>
            
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
}