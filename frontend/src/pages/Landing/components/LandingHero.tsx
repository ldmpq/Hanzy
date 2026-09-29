import { useNavigate } from 'react-router-dom';

export default function LandingHero() {
  const navigate = useNavigate();
  
  return (
    <section className="flex flex-col lg:flex-row items-center gap-16 mb-32 pt-8">
      <div className="flex-1 max-w-xl">
        <h1 className="text-5xl md:text-6xl font-bold text-main mb-6 leading-[1.1] tracking-tight transition-colors duration-300">
          Grow your Chinese with <span className="text-brand">Leafyy</span>
        </h1>
        <p className="text-lg text-sub mb-10 leading-relaxed transition-colors duration-300">
          The premium spaced-repetition platform for HSK learners. Achieve fluency with effortless progress, smart tracking, and cultural appreciation.
        </p>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl font-semibold transition-transform hover:-translate-y-1 shadow-lg shadow-brand/20"
          >
            Get Started Free
          </button>
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
        <div className="aspect-square md:aspect-[4/3] w-full rounded-[2.5rem] bg-neutral-100 dark:bg-neutral-900 shadow-sm border border-line overflow-hidden relative flex items-center justify-center transition-colors duration-500">
          
          <img 
            src="/public/images/zen/zen06.jpg" 
            alt="Leafyy App Interface Illustration" 
            className="w-full h-full object-cover transition-all duration-700 dark:brightness-[0.35] dark:saturate-50 dark:contrast-125"
          />
          
        </div>
      </div>
    </section>
  );
}