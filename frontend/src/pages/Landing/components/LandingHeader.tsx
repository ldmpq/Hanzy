import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitch from './ThemeSwitch';

export default function LandingHeader() {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Features', path: '#features' },
    { name: 'HSK Levels', path: '#hsk' },
    { name: 'About', path: '#about' },
    { name: 'FAQ', path: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-app/80 backdrop-blur-md border-b border-line transition-colors duration-300">
      <div className="flex items-center justify-between py-6 px-8 md:px-16 max-w-[1400px] mx-auto">
        <Link to="/" className="text-2xl font-bold text-brand tracking-tight">
          Hanzy
        </Link>

        <nav className="hidden lg:flex gap-10 items-center">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.path}
              className="text-sm font-medium text-sub hover:text-main transition-colors"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-6">
          <ThemeSwitch />
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-medium text-sub hover:text-main transition-colors hidden sm:block"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="text-sm font-semibold bg-brand text-white px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}