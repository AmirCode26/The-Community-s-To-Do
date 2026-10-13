import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { api_tctd, setUserSession, getUserSession } from '../services/api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Redirigir si ya está registrado/logueado
  useEffect(() => {
    const session = getUserSession();
    if (session) {
      navigate('/boards', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const user = await api_tctd('/users/login', 'POST', {
        phoneNumber: phone,
        password: password
      });

      setUserSession(user);
      navigate('/boards');
    } catch (err: any) {
      setErrorMsg(err.message || 'Check your phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col justify-center items-center px-4 bg-slate-100 dark:bg-[#0b1b2b] text-slate-800 dark:text-slate-100 font-sans selection:bg-[#569ad5d4] selection:text-white transition-colors overflow-hidden">
      <div className="w-full max-w-sm bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-6 shadow-[0_10px_30px_rgba(86,154,213,0.15)] dark:shadow-[0_0_30px_rgba(24,61,93,0.8)] backdrop-blur-md rounded-none relative">
        <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />

        <div className="text-center space-y-3 mb-5">
          <div className="mx-auto w-40 h-24 bg-slate-50 dark:bg-[#0b1b2b] border-2 border-[#569ad5d4] flex items-center justify-center p-3 rounded-none shadow-[0_0_20px_rgba(86,154,213,0.35)]">
            <img src={logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_#569ad5d4]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-wider uppercase italic text-slate-900 dark:text-white">
              Welcome <span className="text-[#569ad5d4]">Back</span>
            </h1>
            <p className="text-xl italic text-slate-600 dark:text-slate-300 font-medium tracking-wide">
              Enter your info to connect with your community
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center mb-3">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="phone" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-sm font-black uppercase tracking-widest italic text-white bg-[#183d5dd4] hover:bg-[#122e47] dark:bg-[#569ad5d4] dark:hover:bg-[#4585c0] rounded-none focus:outline-none focus:ring-2 focus:ring-[#569ad5d4] disabled:opacity-50 transition-all shadow-lg shadow-[#569ad5d4]/30"
          >
            {loading ? 'Entering...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-t border-[#569ad5d4]/30">
          <p className="text-xl italic text-slate-600 dark:text-slate-300">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-bold italic text-[#183d5dd4] dark:text-white underline decoration-[#569ad5d4] hover:text-[#569ad5d4] transition-colors ml-1"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
