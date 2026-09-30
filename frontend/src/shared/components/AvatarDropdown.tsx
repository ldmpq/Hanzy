import { useState, useRef, useEffect } from 'react';
import { Settings, AlertCircle, MessageSquare, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };

  const displayUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Học giả Leafyy');

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* ================= AVATAR BUTTON ================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden flex items-center justify-center shadow-sm bg-line ${
          isOpen ? 'border-sub ring-2 ring-line' : 'border-transparent hover:border-line'
        }`}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={displayUserName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brand text-white font-bold flex items-center justify-center text-sm">
            {displayUserName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* ================= DROPDOWN MENU  ================= */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-surface rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] border border-line p-3 z-50 animate-fade-in origin-top-right">

          <div 
            onClick={() => { setIsOpen(false); navigate('/profile'); }}
            className="bg-surface hover:bg-app p-3 rounded-xl transition-all cursor-pointer shadow-sm border border-line mb-2 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-app shrink-0 flex items-center justify-center border border-line">
                 {user?.avatar ? (
                   <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-brand font-bold text-lg">
                     {displayUserName.charAt(0).toUpperCase()}
                   </span>
                 )}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-base font-bold text-main truncate group-hover:text-brand transition-colors">{displayUserName}</p>
              </div>
            </div>

            <div className="border-t border-line pt-2.5">
              <div
                onClick={() => { setIsOpen(false); navigate('/profile'); }}
                className="w-full bg-app group-hover:bg-brand/10 group-hover:text-brand text-main font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent group-hover:border-brand/20"
              >
                Xem trang cá nhân <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { setIsOpen(false); navigate('/settings'); }}
              className="w-full flex items-center justify-between p-2.5 text-sm font-medium text-main rounded-xl hover:bg-line/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-app flex items-center justify-center border border-line">
                  <Settings className="w-4 h-4 text-sub" />
                </div>
                <span>Cài đặt</span>
              </div>
              <ChevronRight className="w-4 h-4 text-sub" />
            </button>

            <button onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between p-2.5 text-sm font-medium text-main rounded-xl hover:bg-line/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-app flex items-center justify-center border border-line">
                  <AlertCircle className="w-4 h-4 text-sub" />
                </div>
                <span>Báo cáo sự cố</span>
              </div>
            </button>

            <button onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between p-2.5 text-sm font-medium text-main rounded-xl hover:bg-line/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-app flex items-center justify-center border border-line">
                  <MessageSquare className="w-4 h-4 text-sub" />
                </div>
                <span>Góp ý về Leafyy</span>
              </div>
            </button>
          </div>

          <div className="mt-2 border-t border-line pt-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2.5 text-sm font-bold text-brand rounded-xl hover:bg-brand/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center border border-brand/20">
                <LogOut className="w-4 h-4 text-brand" />
              </div>
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}