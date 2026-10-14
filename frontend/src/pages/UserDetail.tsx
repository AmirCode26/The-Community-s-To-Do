import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Template from '../components/Template';
import { api_tctd, getUserSession } from '../services/api';

interface UserProfile {
  id: string;
  fullName: string;
  nickname?: string;
  role: string;
  status?: string;
  privateProfile: boolean;
}

const formatRole = (role: string) => {
  switch (role) {
    case 'L_NIG':
      return { label: 'Owner', color: 'text-purple-600 dark:text-purple-400 border-purple-500/60 bg-purple-50 dark:bg-purple-950/30' };
    case 'L_SNIG':
      return { label: 'Leader', color: 'text-blue-600 dark:text-blue-400 border-blue-500/60 bg-blue-50 dark:bg-blue-950/30' };
    case 'L_T':
      return { label: 'Tower Leader', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30' };
    default:
      return { label: 'Neighbor', color: 'text-slate-600 dark:text-slate-300 border-slate-400/60 bg-slate-50 dark:bg-slate-800/30' };
  }
};

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUserSession();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados para el popup modal de cambio de rol
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('RESIDENT');

  const isOwner = currentUser && currentUser.role === 'L_NIG';

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const data = await api_tctd(`/users/${userId}`, 'GET');
        setUser(data);
        if (data?.role) setNewRole(data.role);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMsg(error.message);
        } else {
          setErrorMsg('Could not load user profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const handleRoleUpdate = async () => {
    try {
      await api_tctd(`/users/${userId}/role`, 'PATCH', { role: newRole });
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      setShowRoleModal(false);
      setSuccessMsg('User role updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Could not update user role.');
      }
      setShowRoleModal(false);
    }
  };

  const roleInfo = user ? formatRole(user.role) : null;

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-3 max-w-sm mx-auto relative">

        {/* Encabezado fijo con botón de retorno */}
        <div className="shrink-0 flex items-center justify-between border-b border-[#569ad5d4]/30 pb-2">
          <div>
            <h2 className="text-base font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
              User <span className="text-[#569ad5d4]">Profile</span>
            </h2>
            <p className="text-[10px] italic text-slate-600 dark:text-slate-300 font-medium">
              Resident information view
            </p>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="text-[10px] font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] underline hover:opacity-80"
          >
            ← Directory
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center shrink-0">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-xs italic font-bold text-emerald-600 dark:text-emerald-400 text-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40 p-1 border border-emerald-400">
            {successMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
          {loading ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              Loading resident profile...
            </p>
          ) : !user ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              User not found.
            </p>
          ) : (
            <div className="bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-4 shadow-md rounded-none relative space-y-3">
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#569ad5d4]" />

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase italic text-slate-500 dark:text-slate-300">
                  Resident Name
                </span>
                <h3 className="text-sm font-black uppercase italic text-slate-900 dark:text-white">
                  {user.nickname || user.fullName} {user.nickname && ` (${user.fullName})`}
                </h3>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase italic text-slate-500 dark:text-slate-300">
                  Community Role
                </span>
                <div className="flex items-center justify-between">
                  <span className={`inline-block text-[10px] font-bold uppercase italic px-2 py-0.5 border ${roleInfo?.color}`}>
                    {roleInfo?.label}
                  </span>

                  {/* Botón condicional de cambio de rol visible solo para L_NIG */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewRole(user.role);
                        setShowRoleModal(true);
                      }}
                      className="px-2 py-1 text-[9px] font-black uppercase italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 border border-[#569ad5d4] shadow-sm"
                    >
                      Change Role
                    </button>
                  )}
                </div>
              </div>

              {user.status && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase italic text-slate-500 dark:text-slate-300">
                    Account Status
                  </span>
                  <p className="text-xs italic font-semibold text-slate-800 dark:text-slate-100 uppercase">
                    {user.status}
                  </p>
                </div>
              )}

              {user.privateProfile && (
                <span className="inline-block text-[10px] italic text-amber-600 dark:text-amber-300 font-semibold pt-1">
                  * This resident maintains a private profile.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Popup Modal para cambiar el rol */}
        {showRoleModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full bg-white dark:bg-[#0b1b2b] border-2 border-[#569ad5d4] p-4 shadow-2xl rounded-none space-y-3">
              <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">
                Change Resident Role
              </h3>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300 block">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#183d5dd4] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="L_NIG">Owner (L_NIG)</option>
                  <option value="L_SNIG">Leader (L_SNIG)</option>
                  <option value="L_T">Tower Leader (L_T)</option>
                  <option value="RESIDENT">Neighbor / Resident</option>
                </select>
              </div>

              <div className="flex space-x-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-3 py-1 text-[10px] uppercase font-bold italic border border-slate-400 text-slate-600 dark:text-slate-300 rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRoleUpdate}
                  className="px-3 py-1 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 rounded-none shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Template>
  );
}
