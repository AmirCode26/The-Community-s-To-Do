import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Template from '../components/Template';
import { api_tctd, getUserSession } from '../services/api';

interface UserProfile {
  id: string;
  fullName: string;
  nickname?: string;
  role: string;
  status?: string;
  privateProfile: boolean;
  towerId?: string;
  apartmentId?: string;
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

export default function UsersDirectory() {
  const currentUser = getUserSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const towerIdParam = searchParams.get('towerId');
  const apartmentIdParam = searchParams.get('apartmentId');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [reportModalUser, setReportModalUser] = useState<UserProfile | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const isLeadership = currentUser && ['L_NIG', 'L_SNIG', 'L_T'].includes(currentUser.role);

  const fetchUsers = async () => {
    try {
      const data = await api_tctd('/users', 'GET');
      setUsers(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Could not load community user directory.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  // Filtrado robusto soportando propiedades planas y anidadas (objetos de relación)
    const filteredUsers = users.filter((user: any) => {
      if (towerIdParam) {
        return user.towerId === towerIdParam || user.apartment?.towerId === towerIdParam;
      }
      if (apartmentIdParam) {
        return user.apartmentId === apartmentIdParam || user.apartment?.id === apartmentIdParam;
      }
      return true;
    });

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportModalUser || !reportReason.trim()) return;

    try {
      await api_tctd('/reports', 'POST', {
        targetId: reportModalUser.id,
        targetType: 'USER',
        reason: reportReason,
      });
      setReportSuccess(true);
      fetchUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Failed to submit report.');
      }
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api_tctd(`/users/${userId}/status`, 'PATCH', { status: newStatus });
      setActiveMenuUserId(null);
      fetchUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Failed to update user status.');
      }
    }
  };

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-3 max-w-sm mx-auto relative">

        <div className="shrink-0 space-y-0.5">
          <h2 className="text-xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
            Community <span className="text-[#569ad5d4]">Directory</span>
          </h2>
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium">
            {towerIdParam ? `Users filtered by tower:` : apartmentIdParam ? `Users filtered by apartment:` : 'Active neighbors and public residents'}
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center shrink-0">
            {errorMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scroll">
          {loading ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              Loading resident registry...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              No registered users found for this filter.
            </p>
          ) : (
            filteredUsers.map((user) => {
              const roleInfo = formatRole(user.role);
              const isSelf = currentUser && currentUser.id === user.id;
              const isReported = user.status === 'REPORTED';
              const isTempBanned = user.status === 'TEMPORARY_BAN';
              const isPermaBanned = user.status === 'BANNED';

              return (
                <div
                  key={user.id}
                  className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4]/70 p-3 shadow-sm rounded-none relative space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <h3
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="text-xs font-black uppercase italic text-slate-900 dark:text-white cursor-pointer hover:text-[#569ad5d4] transition-colors"
                      >
                        {user.nickname || user.fullName} {user.nickname && ` (${user.fullName})`}
                      </h3>

                      {isReported && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 px-1 border border-blue-500/60 italic">
                          [REPORTED]
                        </span>
                      )}
                      {isTempBanned && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-1 border border-amber-500/60 italic">
                          [TEMP BAN]
                        </span>
                      )}
                      {isPermaBanned && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-1 border border-red-500/60 italic">
                          [BANNED]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold uppercase italic px-1.5 py-0.5 border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                          className="px-1.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#569ad5d4]"
                        >
                          ⋮
                        </button>

                        {activeMenuUserId === user.id && (
                          <div className="absolute right-0 top-5 bg-white dark:bg-[#0b1b2b] border border-[#569ad5d4] shadow-lg z-10 py-1 w-32 text-[10px]">
                            {isPermaBanned ? (
                              isLeadership && !isSelf && (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                  className="w-full text-left px-3 py-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold"
                                >
                                  Pardon
                                </button>
                              )
                            ) : isTempBanned ? (
                              <>
                                {!isSelf && (
                                  <button
                                    onClick={() => {
                                      setReportModalUser(user);
                                      setReportSuccess(false);
                                      setActiveMenuUserId(null);
                                    }}
                                    className="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic"
                                  >
                                    Report User
                                  </button>
                                )}
                                {isLeadership && !isSelf && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'BANNED')}
                                      className="w-full text-left px-3 py-1 text-red-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold"
                                    >
                                      Permanent Ban
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                      className="w-full text-left px-3 py-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold border-t border-[#569ad5d4]/30"
                                    >
                                      Pardon
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {!isSelf && (
                                  <button
                                    onClick={() => {
                                      setReportModalUser(user);
                                      setReportSuccess(false);
                                      setActiveMenuUserId(null);
                                    }}
                                    className="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic"
                                  >
                                    Report User
                                  </button>
                                )}

                                {isLeadership && !isSelf && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'TEMPORARY_BAN')}
                                      className="w-full text-left px-3 py-1 text-amber-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold"
                                    >
                                      Temp Ban
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'BANNED')}
                                      className="w-full text-left px-3 py-1 text-red-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold"
                                    >
                                      Permanent Ban
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {user.privateProfile && (
                    <span className="inline-block text-[9px] italic text-amber-600 dark:text-amber-300 font-semibold pt-0.5">
                      * Private Profile
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Reporte */}
        {reportModalUser && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full bg-white dark:bg-[#0b1b2b] border-2 border-[#569ad5d4] p-4 shadow-2xl rounded-none space-y-3">
              <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">
                Report User: <span className="text-[#569ad5d4]">{reportModalUser.nickname || reportModalUser.fullName}</span>
              </h3>

              {reportSuccess ? (
                <div className="space-y-3">
                  <p className="text-xs italic text-emerald-500 font-bold text-center">
                    Report submitted successfully.
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setReportModalUser(null)}
                      className="px-4 py-1 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 rounded-none shadow-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3">
                  <textarea
                    placeholder="Enter detailed reason for report..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 text-xs italic rounded-none border border-[#569ad5d4] bg-slate-50 dark:bg-[#183d5dd4] text-slate-900 dark:text-white h-20 resize-none focus:outline-none"
                    required
                  />
                  <div className="flex space-x-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setReportModalUser(null)}
                      className="px-3 py-1 text-[10px] uppercase font-bold italic border border-slate-400 text-slate-600 dark:text-slate-300 rounded-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 rounded-none shadow-md"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </Template>
  );
}
