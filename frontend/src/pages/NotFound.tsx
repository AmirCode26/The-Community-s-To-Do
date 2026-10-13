import { useNavigate } from 'react-router-dom';
import Template from '../components/Template';
import logo from '../assets/logo.svg';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Template>
      <div className="h-full w-full flex items-center justify-center p-4">

        {/* Contenedor estilo tarjeta con sombreado azul profundo */}
        <div className="w-full max-w-sm bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-6 shadow-[0_10px_30px_rgba(86,154,213,0.2)] dark:shadow-[0_0_35px_rgba(86,154,213,0.6)] backdrop-blur-md rounded-none relative text-center">

          {/* Esquinas geométricas */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />

          {/* Logo con resplandor azul */}
          <div className="mx-auto w-24 h-20 bg-slate-50 dark:bg-[#0b1b2b] border-2 border-[#569ad5d4] flex items-center justify-center p-2 rounded-none shadow-[0_0_20px_rgba(86,154,213,0.4)]">
            <img src={logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_#569ad5d4]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-5xl font-black italic uppercase tracking-widest text-[#183d5dd4] dark:text-white drop-shadow-lg">
              404
            </h1>
            <h2 className="text-base font-black italic uppercase text-slate-900 dark:text-white">
              Page Not Found
            </h2>
            <p className="text-xs italic text-slate-600 dark:text-slate-300">
              The page you are looking for does not exist or has been removed from the system.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full py-3 px-4 text-xs font-black uppercase tracking-widest italic text-white bg-[#183d5dd4] hover:bg-[#122e47] dark:bg-[#569ad5d4] dark:hover:bg-[#4585c0] dark:text-slate-900 rounded-none focus:outline-none transition-all shadow-lg shadow-[#569ad5d4]/40"
          >
            Return to Home
          </button>

        </div>
      </div>
    </Template>
  );
}
