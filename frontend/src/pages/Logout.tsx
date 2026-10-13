import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Template from '../components/Template';

export default function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    // Pequeño retraso estético de 1 segundo para mostrar el texto "Logging out..."
    setTimeout(() => {
      localStorage.clear();
      navigate('/login', { replace: true });
    }, 1000);
  };

  const handleCancel = () => {
    // Te devuelve al tablón / inicio si cancelas
    navigate('/boards', { replace: true });
  };

  return (
    <Template>
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-6 shadow-lg rounded-none relative text-center space-y-4">

          <h2 className="text-xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
            Confirm <span className="text-[#569ad5d4]">Logout</span>
          </h2>

          {isLoggingOut ? (
            <p className="text-sm italic font-black uppercase tracking-widest animate-pulse text-[#569ad5d4] py-4">
              Logging out...
            </p>
          ) : (
            <>
              <p className="text-xs italic text-slate-600 dark:text-slate-300">
                Are you sure you want to end your active session? You will need to log in again to access your community board.
              </p>

              <div className="flex space-x-3 pt-2">
                {/* Botón Rojo para confirmar el Logout */}
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex-1 py-2.5 text-xs font-black uppercase italic text-white bg-red-600 hover:bg-red-700 rounded-none transition-all shadow-md"
                >
                  Yes, Log Out
                </button>

                {/* Botón Verde para cancelar y volver a home/boards */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 text-xs font-black uppercase italic text-white bg-emerald-600 hover:bg-emerald-700 rounded-none transition-all shadow-md"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </Template>
  );
}
