import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { api_tctd, setUserSession, getUserSession } from '../services/api';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [apartmentGuide, setApartmentGuide] = useState('');
  const [password, setPassword] = useState('');
  const [privateProfile, setPrivateProfile] = useState(false);

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
      const newUser = await api_tctd('/users', 'POST', {
        fullName,
        nickname: nickname || undefined,
        phoneNumber: phone,
        email: email || undefined,
        apartmentGuide,
        password,
        privateProfile,
      });

      setUserSession(newUser);
      navigate('/boards');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col justify-center items-center px-4 bg-slate-100 dark:bg-[#0b1b2b] text-slate-800 dark:text-slate-100 font-sans selection:bg-[#569ad5d4] selection:text-white transition-colors overflow-hidden">
      <div className="w-full max-w-sm bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-5 shadow-[0_10px_30px_rgba(86,154,213,0.15)] dark:shadow-[0_0_30px_rgba(24,61,93,0.8)] backdrop-blur-md rounded-none relative flex flex-col max-h-[90dvh]">
        <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />

        <div className="text-center space-y-2 mb-3 shrink-0">
          <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-[#0b1b2b] border-2 border-[#569ad5d4] flex items-center justify-center p-2 rounded-none shadow-[0_0_15px_rgba(86,154,213,0.3)]">
            <img src={logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_6px_#569ad5d4]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black tracking-wider uppercase italic text-slate-900 dark:text-white">
              Join Your <span className="text-[#569ad5d4]">Community</span>
            </h1>
            <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium tracking-wide">
              Create your account to participate
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center mb-2 shrink-0">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
          <div className="space-y-0.5">
            <label htmlFor="fullName" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="nickname" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Nickname <span className="text-[10px] opacity-70">(Optional)</span>
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="Johnny"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3.5 py-2 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="phone" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="email" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Email <span className="text-[10px] opacity-70">(Optional)</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="apartmentGuide" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Apartment Location
            </label>
            <input
              id="apartmentGuide"
              type="text"
              placeholder="e.g. Tower A, Apt 402"
              value={apartmentGuide}
              onChange={(e) => setApartmentGuide(e.target.value)}
              className="w-full px-3.5 py-2 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="password" className="text-xs font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-base italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-slate-50 dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="privateProfile"
              type="checkbox"
              checked={privateProfile}
              onChange={(e) => setPrivateProfile(e.target.checked)}
              className="w-4 h-4 rounded-none accent-[#183d5dd4] dark:accent-[#569ad5d4] cursor-pointer"
            />
            <label htmlFor="privateProfile" className="text-xs italic text-slate-600 dark:text-slate-300 font-medium cursor-pointer select-none">
              Keep my profile private (hidden from general directory)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-black uppercase tracking-widest italic text-white bg-[#183d5dd4] hover:bg-[#122e47] dark:bg-[#569ad5d4] dark:hover:bg-[#4585c0] rounded-none focus:outline-none focus:ring-2 focus:ring-[#569ad5d4] disabled:opacity-50 transition-all shadow-lg shadow-[#569ad5d4]/30 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-3 pt-2 border-t border-[#569ad5d4]/30 shrink-0">
          <p className="text-sm italic text-slate-600 dark:text-slate-300">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-bold italic text-[#183d5dd4] dark:text-white underline decoration-[#569ad5d4] hover:text-[#569ad5d4] transition-colors ml-1"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
