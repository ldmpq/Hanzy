export default function LandingFooter() {
  return (
    <footer className="w-full border-t border-line mt-16 bg-surface transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="max-w-xs">
          <div className="text-xl font-bold text-brand mb-4">Leafyy</div>
          <p className="text-sm text-sub mb-6 leading-relaxed">
            Calmly Master the Tongue. A premium learning environment for sophisticated Mandarin students.
          </p>
          <p className="text-[10px] text-sub uppercase font-bold tracking-widest opacity-70">
            © 2026 Leafyy. All rights reserved.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-bold text-main">Product</span>
            <a href="#features" className="text-sub hover:text-brand transition-colors">Features</a>
            <a href="#hsk" className="text-sub hover:text-brand transition-colors">HSK Levels</a>
            <a href="#" className="text-sub hover:text-brand transition-colors">Flashcards</a>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-bold text-main">Resources</span>
            <a href="#" className="text-sub hover:text-brand transition-colors">Help Center</a>
            <a href="#" className="text-sub hover:text-brand transition-colors">Privacy Policy</a>
            <a href="#" className="text-sub hover:text-brand transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}