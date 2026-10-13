import { useState, useEffect } from 'react';
import Template from '../components/Template';
import CommunityLayoutGrid from '../components/ui/CommunityLayoutGrid';
import { api_tctd, getUserSession } from '../services/api';

export default function MyCommunity() {
  const currentUser = getUserSession();
  const [filter, setFilter] = useState<'ALL' | 'ZONE' | 'TOWER'>('ALL');
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAllLayouts = async () => {
      try {
        const data = await api_tctd('/layouts', 'GET');
        setLayouts(data || []);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMsg(error.message);
        } else {
          setErrorMsg('Could not load community layouts.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllLayouts();
  }, []);

  // Lógica de filtrado en frontend
  const getFilteredLayouts = () => {
    if (!layouts.length) return { zones: [], towers: [] };

    const zones = layouts.filter(
      (l) => l.structureType === 'S_NIG' || l.layoutJson?.type === 'SNIG'
    );
    const towers = layouts.filter(
      (l) => l.structureType === 'TOWER' || l.layoutJson?.type === 'TOWER'
    );

    if (filter === 'ALL') {
      return { zones, towers };
    }

    if (filter === 'TOWER') {
      const userTowerId = currentUser?.apartment?.towerId || currentUser?.towerId;
      const targetTower = towers.find((l) => l.structureId === userTowerId) || towers[0];
      return { zones: [], towers: targetTower ? [targetTower] : [] };
    }

    if (filter === 'ZONE') {
      return { zones, towers: [] };
    }

    return { zones, towers };
  };

  const { zones, towers } = getFilteredLayouts();

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-3 max-w-sm mx-auto relative">

        <div className="shrink-0 space-y-1 border-b border-[#569ad5d4]/30 pb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
              My <span className="text-[#569ad5d4]">Community</span>
            </h2>
          </div>
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium">
            Sector map and structural grid
          </p>

          <div className="flex space-x-1 pt-1">
            {(['ALL', 'ZONE', 'TOWER'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`flex-1 py-1 text-[9px] font-black uppercase italic border rounded-none transition-all ${
                  filter === mode
                    ? 'bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 border-[#569ad5d4]'
                    : 'bg-white dark:bg-[#0b1b2b] text-slate-700 dark:text-slate-300 border-[#569ad5d4]/40 hover:bg-slate-150'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'ZONE' ? 'My Zone' : 'My Tower'}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center shrink-0">
            {errorMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scroll">
          {loading ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              Rendering spatial matrices...
            </p>
          ) : zones.length === 0 && towers.length === 0 ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              No layout configurations available.
            </p>
          ) : (
            <>
              {/* Sección de Zonas / Sectores (SNIG) */}
              {zones.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase italic text-amber-600 dark:text-amber-400 tracking-wider">
                    -- Zones / Sectors --
                  </h3>
                  {zones.map((zoneItem) => (
                    <CommunityLayoutGrid
                      key={zoneItem.id || zoneItem.structureId}
                      layout={zoneItem.layoutJson}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              )}

              {/* Sección de Torres (TOWERS) */}
              {towers.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-[10px] font-black uppercase italic text-emerald-600 dark:text-emerald-400 tracking-wider">
                    -- Towers / Buildings --
                  </h3>
                  {towers.map((towerItem) => (
                    <CommunityLayoutGrid
                      key={towerItem.id || towerItem.structureId}
                      layout={towerItem.layoutJson}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </Template>
  );
}
