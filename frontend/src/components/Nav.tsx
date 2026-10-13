import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { getUserSession } from '../services/api';

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUserSession();

  // Validación estricta de liderazgo para mostrar la sección Admin
  const isLeadership = currentUser && ['L_NIG', 'L_SNIG'].includes(currentUser.role);

  const paths: { label: string; url: string }[] = [
    { label: "Home", url: "/home" },
    { label: "Boards", url: "/boards" },
    { label: "Users", url: "/users" },
    { label: "Areas", url: "/areas" },
    { label: "My Community", url: "/myCommunity" },
    ...(isLeadership ? [{ label: "Admin", url: "/admin" }] : []),
    { label: "Logout", url: "/logout" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-white dark:bg-[#183d5dd4] border-b-2 border-[#569ad5d4] px-4 py-3.5 flex items-center justify-between shrink-0 shadow-lg gap-3 overflow-hidden">
      {/* Marca / Logo de TCTD */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <div className="w-10 h-10 bg-slate-50 dark:bg-[#0b1b2b] border border-[#569ad5d4] flex items-center justify-center rounded-none shadow-[0_0_10px_rgba(86,154,213,0.3)]">
          <img src={logo} alt="TCTD Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_4px_#569ad5d4]" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase italic tracking-wider text-slate-900 dark:text-white leading-tight">
            Community <span className="text-[#569ad5d4]">Network</span>
          </span>
        </div>
      </div>

      {/* Contenedor con scroll horizontal para los botones de sección */}
      <div className="flex items-center space-x-1.5 overflow-x-auto custom-scroll shrink min-w-0 py-0.5">
        {paths.map((path) => (
          <button
            key={path.url}
            onClick={() => navigate(path.url)}
            className={`px-2.5 py-1.5 text-[11px] font-bold uppercase italic tracking-wider whitespace-nowrap transition-all rounded-none border shrink-0 ${
              isActive(path.url)
                ? 'bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 border-[#569ad5d4]'
                : 'bg-transparent text-slate-700 dark:text-slate-200 border-[#569ad5d4]/50 hover:border-[#569ad5d4]'
            }`}
          >
            {path.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
