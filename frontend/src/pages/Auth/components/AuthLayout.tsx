import React from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ArtworkCard from './ArtworkCard';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  activeTab: 'login' | 'register';
  quoteMain: string;
  quoteSub: string;
}

export default function AuthLayout({ children, title, subtitle, activeTab, quoteMain, quoteSub }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans bg-app text-main p-4 md:p-8 transition-colors">
      <div className="w-full max-w-[1200px] h-[90vh] max-h-[850px] bg-surface rounded-[2.5rem] shadow-2xl shadow-black/5 border border-line overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* ================= TRÁI: FORM ================= */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col custom-scrollbar bg-app z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-line/50">
          <div className="max-w-[440px] w-full mx-auto my-auto py-12 px-6">
            <div className="flex items-center gap-2 text-xl font-bold text-brand mb-12">
              <BookOpen className="w-6 h-6" /> Leafyy
            </div>

            <h1 className="text-4xl font-bold text-main mb-2 tracking-tight">{title}</h1>
            <p className="text-sub mb-8 text-[15px] font-medium">{subtitle}</p>

            {/* ================= NÚT TAB ================= */}
            <div className="relative flex bg-surface p-1.5 rounded-xl w-full mb-8 border border-line">

              <div className="absolute left-1.5 right-1.5 top-1.5 bottom-1.5 pointer-events-none">
                <div 
                  className={`w-1/2 h-full bg-brand rounded-lg shadow-sm transition-transform duration-300 ease-out ${
                    activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'
                  }`} 
                />
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`relative z-10 w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors duration-300 ${
                  activeTab === 'login' ? 'text-white' : 'text-sub hover:text-main'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className={`relative z-10 w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors duration-300 ${
                  activeTab === 'register' ? 'text-white' : 'text-sub hover:text-main'
                }`}
              >
                Đăng ký
              </button>
            </div>

            <div key={activeTab} className="animate-slide-fade-x">
              {children}
            </div>
          </div>
        </div>

        {/* ================= PHẢI: VISUAL ARTWORK ================= */}
        <div className="hidden lg:flex w-1/2 h-full bg-surface relative flex-col justify-center items-center overflow-hidden">
          
          <div 
            className="absolute inset-0 flex justify-center pt-8"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)'
            }}
          >
            <div className="w-full max-w-[420px] relative h-full">
            <div className="absolute inset-x-0 top-0 animate-scroll-vertical" style={{ animationDuration: '70s' }}>
              {(() => {
                const artworks = [
                  { title: "A Calm Space to Learn", imageSrc: "/images/zen/zen01.jpg" },
                  { title: "Learn at Your Own Pace", imageSrc: "/images/zen/zen02.jpg" },
                  { title: "Enjoy the Journey", imageSrc: "/images/zen/zen03.jpg" },
                  { title: "Discover Chinese Culture", imageSrc: "/images/zen/zen04.jpg" },
                  { title: "Grow with Confidence", imageSrc: "/images/zen/zen05.jpg" },
                ];

                return (
                  <>
                    <div className="flex flex-col gap-8 pb-8">
                      {artworks.map((art, i) => (
                        <ArtworkCard key={`main-${i}`} title={art.title} imageSrc={art.imageSrc} />
                      ))}
                    </div>
                    <div className="flex flex-col gap-8 pb-8" aria-hidden="true">
                      {artworks.map((art, i) => (
                        <ArtworkCard key={`clone-${i}`} title={art.title} imageSrc={art.imageSrc} />
                      ))}
                    </div>
                  </>
                );
              })()}

            </div>
          </div>
          </div>

          <div key={quoteMain} className="absolute bottom-12 left-12 right-12 z-20 animate-slide-fade-up">
            <h2 className="text-[32px] xl:text-[40px] font-bold text-brand leading-tight mb-5 tracking-tight">
              "{quoteMain}"
              {quoteSub && <span className="block mt-1 text-2xl font-medium opacity-90">{quoteSub}</span>}
            </h2>
            <div className="flex items-center gap-4">
              <span className="w-10 h-[2px] bg-sub"></span>
              <span className="text-main font-bold text-base tracking-wide">Lão Tử</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}