import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdown';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Trang chủ', path: '/dashboard' },
    { name: 'Từ điển', path: '/dictionary' },
    { name: 'Dịch thuật', path: '/translate' },
    { 
      name: 'Học tập', 
      path: '/study',
      subItems: [
        { name: 'Flashcards', path: '/library' },
        { name: 'Học từ mới', path: '/courses' },
        { name: 'Ôn tập', path: '/review' },
        { name: 'Kiểm tra', path: '/quiz' },
      ]
    },
    { name: 'Thành tích', path: '/progress' },
  ];

  return (
    <div className="min-h-screen bg-app font-sans flex flex-col text-main transition-colors">
      <header className="w-full flex items-center justify-between py-6 px-6 md:px-16 max-w-[1400px] mx-auto z-50 relative">
        <Link to="/dashboard" className="text-2xl font-bold text-brand tracking-tight">
          Leafyy
        </Link>
        
        {/* 1. DESKTOP NAVIGATION */}
        <nav className="hidden md:flex gap-10 items-center mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(`${item.path}/`)) ||
                             (item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path)));

            if (item.subItems) {
              return (
                <div key={item.name} className="relative group">
                  <button 
                    className={`flex items-center gap-1 text-sm font-medium pb-2 border-b-2 transition-colors ${
                      isActive 
                        ? 'text-brand border-brand' 
                        : 'text-sub border-transparent hover:text-main'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:rotate-180 ${
                      isActive ? 'text-brand' : 'text-sub'
                    }`} />
                  </button>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-48 z-50">
                    <div className="bg-surface rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-line py-2 flex flex-col overflow-hidden">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={`px-5 py-2.5 text-sm font-medium transition-colors hover:bg-brand/10 hover:text-brand ${
                            location.pathname.startsWith(sub.path) ? 'text-brand bg-brand/10' : 'text-sub'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }                 
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  isActive 
                    ? 'text-brand border-brand' 
                    : 'text-sub border-transparent hover:text-main'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Mobile Hamburger Button */}
        <div className="flex items-center gap-4">
          <AvatarDropdown />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-sub hover:text-brand focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* 2. MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-line px-6 py-4 flex flex-col gap-4 shadow-lg absolute top-20 left-0 w-full z-40 animate-fadeIn">
          {navItems.map((item) => (
            <div key={item.name} className="flex flex-col gap-2">
              {item.subItems ? (
                <>
                  <span className="text-sm font-bold text-main pt-2">{item.name}</span>
                  <div className="pl-4 flex flex-col gap-2 border-l-2 border-line">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-sm py-1 font-medium transition-colors ${
                          location.pathname.startsWith(sub.path) ? 'text-brand' : 'text-sub'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-semibold py-1 transition-colors ${
                    location.pathname === item.path ? 'text-brand' : 'text-main'
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-16 py-8 pb-28">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-line mt-28 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-xs">
            <div className="text-xl font-bold text-brand mb-4">Leafyy</div>
            <p className="text-[10px] text-sub uppercase font-bold tracking-widest">
              © 2026 Leafyy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}