import { useState, useEffect } from 'react';
import { api_tctd } from '../../services/api';

interface Props {
  pendingUsers: any[];
  onApprove: (userId: string, apartmentId: string) => void;
}

export default function PendingUsersTab({ pendingUsers, onApprove }: Props) {
  const [sectors, setSectors] = useState<any[]>([]);
  const [towersMap, setTowersMap] = useState<{ [sectorId: string]: any[] }>({});
  const [apartmentsMap, setApartmentsMap] = useState<{ [towerId: string]: any[] }>({});

  const [userSelections, setUserSelections] = useState<{ [userId: string]: { sectorId: string; towerId: string; apartmentId: string } }>({});
  const [guideData, setGuideData] = useState<any[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const sectorsData = await api_tctd('/structures/S_NIG', 'GET');
        if (Array.isArray(sectorsData)) {
          setSectors(sectorsData);
          const guide: any[] = [];
          for (const sec of sectorsData) {
            const towers = await api_tctd(`/structures/TOWER?subNigId=${sec.id}`, 'GET').catch(() => []);
            const towersWithApts = [];
            for (const tow of (Array.isArray(towers) ? towers : [])) {
              const apts = await api_tctd(`/apartments/tower/${tow.id}`, 'GET').catch(() => []);
              towersWithApts.push({ ...tow, apartments: Array.isArray(apts) ? apts : [] });
            }
            guide.push({ ...sec, towers: towersWithApts });
          }
          setGuideData(guide);
        }
      } catch (err) {
        console.error("Error loading guide data", err);
      }
    })();
  }, []);

  const handleSectorChange = async (userId: string, sectorId: string) => {
    setUserSelections(prev => ({
      ...prev,
      [userId]: { sectorId, towerId: '', apartmentId: '' }
    }));

    if (!towersMap[sectorId]) {
      try {
        const towers = await api_tctd(`/structures/TOWER?subNigId=${sectorId}`, 'GET');
        setTowersMap(prev => ({ ...prev, [sectorId]: Array.isArray(towers) ? towers : [] }));
      } catch (e) {
        setTowersMap(prev => ({ ...prev, [sectorId]: [] }));
      }
    }
  };

  const handleTowerChange = async (userId: string, towerId: string) => {
    const current = userSelections[userId] || { sectorId: '', towerId: '', apartmentId: '' };
    setUserSelections(prev => ({
      ...prev,
      [userId]: { ...current, towerId, apartmentId: '' }
    }));

    if (!apartmentsMap[towerId]) {
      try {
        const apts = await api_tctd(`/apartments/tower/${towerId}`, 'GET');
        setApartmentsMap(prev => ({ ...prev, [towerId]: Array.isArray(apts) ? apts : [] }));
      } catch (e) {
        setApartmentsMap(prev => ({ ...prev, [towerId]: [] }));
      }
    }
  };

  const handleAptChange = (userId: string, apartmentId: string) => {
    const current = userSelections[userId] || { sectorId: '', towerId: '', apartmentId: '' };
    setUserSelections(prev => ({
      ...prev,
      [userId]: { ...current, apartmentId }
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">
          Pending Users ({pendingUsers.length})
        </h3>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="px-2 py-0.5 text-[8px] font-black uppercase italic bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200 border border-sky-400"
        >
          {showGuide ? 'Hide Apartment Guide' : 'View Apartment Guide'}
        </button>
      </div>

      {showGuide && (
        <div className="bg-sky-50 dark:bg-[#0b1b2b] border border-sky-400 p-2.5 space-y-2 max-h-48 overflow-y-auto custom-scroll text-[9px]">
          <h4 className="font-black uppercase italic text-sky-700 dark:text-sky-300">-- Structures & Apartments Guide --</h4>
          {guideData.length === 0 ? (
            <p className="italic text-slate-500">Loading guide...</p>
          ) : (
            guideData.map(sec => (
              <div key={sec.id} className="space-y-1 border-b border-sky-200 dark:border-sky-900 pb-1">
                <p className="font-bold uppercase text-slate-900 dark:text-white">Sector: {sec.name}</p>
                {sec.towers.length === 0 ? (
                  <p className="text-slate-500 italic pl-2">No towers registered.</p>
                ) : (
                  sec.towers.map((tow: any) => (
                    <div key={tow.id} className="pl-2 space-y-0.5">
                      <p className="font-medium text-slate-700 dark:text-slate-300">🏢 {tow.name}</p>
                      <div className="pl-3 flex flex-wrap gap-1">
                        {tow.apartments.length === 0 ? (
                          <span className="italic text-slate-400 text-[8px]">No apartments</span>
                        ) : (
                          tow.apartments.map((apt: any) => (
                            <span key={apt.id} className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] px-1 py-0.5 text-[8px] font-bold text-slate-800 dark:text-white">
                              Apt {apt.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <p className="text-xs italic text-center text-slate-500 py-6">No pending users found for approval.</p>
      ) : (
        pendingUsers.map(user => {
          const sel = userSelections[user.id] || { sectorId: '', towerId: '', apartmentId: '' };
          const towers = sel.sectorId ? (towersMap[sel.sectorId] || []) : [];
          const apts = sel.towerId ? (apartmentsMap[sel.towerId] || []) : [];

          return (
            <div key={user.id} className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4]/60 p-2.5 space-y-2">
              <div>
                <p className="text-xs font-black uppercase italic text-slate-900 dark:text-white">{user.fullName}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-300">{user.email || user.phoneNumber}</p>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-[#569ad5d4]/30">
                <p className="text-[9px] font-bold uppercase italic text-amber-600 dark:text-amber-400">Assign Location (Apartment):</p>
                <div className="grid grid-cols-3 gap-1">
                  <select
                    value={sel.sectorId}
                    onChange={(e) => handleSectorChange(user.id, e.target.value)}
                    className="p-1 text-[9px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                  >
                    <option value="">Sector...</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>

                  <select
                    value={sel.towerId}
                    onChange={(e) => handleTowerChange(user.id, e.target.value)}
                    className="p-1 text-[9px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                    disabled={!sel.sectorId || towers.length === 0}
                  >
                    <option value="">Tower...</option>
                    {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>

                  <select
                    value={sel.apartmentId}
                    onChange={(e) => handleAptChange(user.id, e.target.value)}
                    className="p-1 text-[9px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                    disabled={!sel.towerId || apts.length === 0}
                  >
                    <option value="">Apt...</option>
                    {apts.map(a => <option key={a.id} value={a.id}>Apt {a.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={!sel.apartmentId}
                onClick={() => onApprove(user.id, sel.apartmentId)}
                className={`w-full py-1.5 text-[9px] font-black uppercase italic text-white transition-all ${
                  sel.apartmentId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                }`}
              >
                {sel.apartmentId ? 'Approve & Assign Apartment' : 'Select Apartment to Approve'}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
