import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-app font-sans">
      
      {/* HEADER */}
      <header className="w-full py-6 px-8 md:px-16 max-w-[1400px] mx-auto shrink-0">
        <Link to="/" className="text-2xl font-bold text-brand tracking-tight">
          Leafyy
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-2xl mx-auto text-center animate-fade-in">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-10 mx-auto">
          <div className="absolute inset-0 bg-surface rounded-full shadow-sm border border-line z-0"></div>
          <img 
            src="/images/panda-404.png" 
            alt="Leafyy 404 Illustration" 
            className="relative z-10 w-[115%] h-[115%] object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.previousElementSibling?.classList.add('bg-brand/10');
            }}
          />
        </div>

        {/* Tiêu đề & Mô tả */}
        <h1 className="text-4xl sm:text-5xl font-bold text-brand mb-4 tracking-tight">
          Trang không tìm thấy
        </h1>
        <p className="text-sub text-base sm:text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Có vẻ bạn đã đi lạc. Hãy quay lại và tiếp tục khám phá Leafyy.
        </p>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm"
          >
            <LayoutDashboard className="w-5 h-5" /> Quay lại Trang chủ
          </button>
          
          <button
            onClick={() => navigate('/dictionary')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface hover:bg-line/50 text-brand border border-line px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm"
          >
            <Search className="w-5 h-5" /> Tìm kiếm từ vựng
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-line py-8">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-xl font-bold text-brand mb-1">Leafyy</div>
            <div className="text-xs font-medium text-sub">
              © 2026 Leafyy. All rights reserved.
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-sub">
            <Link to="#" className="hover:text-main transition-colors">About</Link>
            <Link to="#" className="hover:text-main transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-main transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-main transition-colors">Contact</Link>
            <Link to="#" className="hover:text-main transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}