import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Request reset password cho email:', email);
    // TODO: Gọi API /auth/forgot-password ở đây
    
    // Giả lập thành công
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-app font-sans transition-colors duration-300">
      {/* Header tối giản */}
      <header className="w-full p-6 flex justify-between items-center absolute top-0">
        <Link to="/" className="text-2xl font-bold text-brand tracking-tight">
          Hanzy
        </Link>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface p-8 md:p-10 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-line animate-fade-in">
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">Quên mật khẩu?</h1>
            <p className="text-sub text-sm">
              Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-main mb-2">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sub" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-app border border-line rounded-xl py-3.5 pl-12 pr-4 text-main focus:outline-none focus:border-brand transition-colors"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl transition-transform hover:-translate-y-0.5 shadow-md shadow-brand/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Gửi liên kết khôi phục
              </button>
            </form>
          ) : (
            <div className="bg-brand/10 border border-brand/20 rounded-xl p-6 text-center">
              <Mail className="w-10 h-10 text-brand mx-auto mb-3" />
              <h3 className="font-bold text-main mb-2">Đã gửi email!</h3>
              <p className="text-sm text-sub">
                Vui lòng kiểm tra hộp thư đến (và hộp thư rác) của <strong>{email}</strong> để nhận hướng dẫn đặt lại mật khẩu.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-sub hover:text-brand transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang Đăng nhập
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
}