import { useState, useEffect } from 'react';
import Template from '../components/Template';
import { api_tctd } from '../services/api';
import { BsFillDoorClosedFill } from "react-icons/bs";
import { PiCityFill } from "react-icons/pi";
import { GiHighGrass } from "react-icons/gi";

import PendingUsersTab from '../components/admin/PendingUsersTab';
import StructuresTab from '../components/admin/StructuresTab';
import ApartmentsTab from '../components/admin/ApartmentsTab';
import AreasTab from '../components/admin/AreasTab';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'structures' | 'layoutBuilder' | 'apartments' | 'areas'>('users');
  const [statusMsg, setStatusMsg] = useState('');

  const [sectors, setSectors] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  // Structure creation states
  const [structType, setStructType] = useState('TOWER');
  const [structName, setStructName] = useState('');
  const [selectedSectorForTower, setSelectedSectorForTower] = useState('');

  // Apartment creation states
  const [aptSectorId, setAptSectorId] = useState('');
  const [availableTowersForApt, setAvailableTowersForApt] = useState<any[]>([]);
  const [aptTowerId, setAptTowerId] = useState('');
  const [aptName, setAptName] = useState('');

  // Area creation states
  const [areaSectorId, setAreaSectorId] = useState('');
  const [areaTitle, setAreaTitle] = useState('');
  const [areaDesc, setAreaDesc] = useState('');

  // Visual layout builder states
  const [layoutMode, setLayoutMode] = useState<'NEW' | 'EDIT'>('NEW');
  const [existingLayouts, setExistingLayouts] = useState<any[]>([]);
  const [selectedLayoutIdToEdit, setSelectedLayoutIdToEdit] = useState('');

  const [layoutTargetType, setLayoutTargetType] = useState<'S_NIG' | 'TOWER'>('S_NIG');
  const [layoutSectorId, setLayoutSectorId] = useState('');
  const [layoutTowersForTarget, setLayoutTowersForTarget] = useState<any[]>([]);
  const [sectorAreasForGrid, setSectorAreasForGrid] = useState<any[]>([]);
  const [layoutTargetId, setLayoutTargetId] = useState('');
  const [layoutLabel, setLayoutLabel] = useState('');
  const [gridRows, setGridRows] = useState(3);
  const [gridCols, setGridCols] = useState(3);

  const [visualMatrix, setVisualMatrix] = useState<any[][]>([]);
  const [selectedCellCoords, setSelectedCellCoords] = useState<{r: number, c: number} | null>(null);
  const [towerApartmentsForGrid, setTowerApartmentsForGrid] = useState<any[]>([]);

  const [cellEditType, setCellEditType] = useState('GAP');
  const [cellStreetNum, setCellStreetNum] = useState('1');
  const [cellAptId, setCellAptId] = useState('');
  const [cellObjId, setCellObjId] = useState('');
  const [cellObjLabel, setCellObjLabel] = useState('');

  const resolveApartmentLabel = async (aptId: string): Promise<string> => {
    if (!aptId || aptId === 'GAP' || aptId.startsWith('STREET')) return aptId;
    try {
      const aptData = await api_tctd(`/apartments/${aptId}`, 'GET');
      return aptData?.name || aptId;
    } catch (err) {
      console.error(`Could not fetch apartment for ID: ${aptId}`, err);
      return aptId;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [usersData, sectorsData] = await Promise.all([
          api_tctd('/users', 'GET').catch(() => []),
          api_tctd('/structures/S_NIG', 'GET').catch(() => [])
        ]);

        if (Array.isArray(usersData)) {
          setPendingUsers(usersData.filter((u: {status: string}) => u.status === 'PENDING'));
        }
        if (Array.isArray(sectorsData)) {
          setSectors(sectorsData);
          if (sectorsData.length > 0) {
            setSelectedSectorForTower(sectorsData[0].id);
            setAptSectorId(sectorsData[0].id);
            setAreaSectorId(sectorsData[0].id);
            setLayoutSectorId(sectorsData[0].id);
          }
        }
      } catch (e) {
        console.error("Error loading auxiliary admin data", e);
      }
    })();
  }, []);

  // Fetch towers and areas when layoutSectorId changes
  useEffect(() => {
    if (layoutSectorId) {
      api_tctd(`/structures/TOWER?subNigId=${layoutSectorId}`, 'GET')
        .then(data => setLayoutTowersForTarget(Array.isArray(data) ? data : []))
        .catch(() => setLayoutTowersForTarget([]));

      api_tctd(`/zas/subnig/${layoutSectorId}`, 'GET')
        .then(data => setSectorAreasForGrid(Array.isArray(data) ? data : []))
        .catch(() => setSectorAreasForGrid([]));
    } else {
      setLayoutTowersForTarget([]);
      setSectorAreasForGrid([]);
    }
  }, [layoutSectorId]);

  // Fetch apartments for grid when layoutTargetId is a Tower
  useEffect(() => {
    if (layoutTargetType === 'TOWER' && layoutTargetId) {
      api_tctd(`/apartments/tower/${layoutTargetId}`, 'GET')
        .then(data => setTowerApartmentsForGrid(Array.isArray(data) ? data : []))
        .catch(() => setTowerApartmentsForGrid([]));
    } else {
      setTowerApartmentsForGrid([]);
    }
  }, [layoutTargetType, layoutTargetId]);

  useEffect(() => {
    if (layoutMode === 'EDIT') {
      api_tctd('/layouts', 'GET')
        .then(data => setExistingLayouts(Array.isArray(data) ? data : []))
        .catch(() => setExistingLayouts([]));
    } else {
      setLayoutTargetId('');
      setLayoutLabel('');
      initVisualGrid(gridRows, gridCols);
    }
  }, [layoutMode]);

  const handleSelectLayoutToEdit = async (layoutId: string) => {
    setSelectedLayoutIdToEdit(layoutId);
    const target = existingLayouts.find(l => l.id === layoutId || l.structureId === layoutId);
    if (!target || !target.layoutJson) return;

    const json = target.layoutJson;
    setLayoutTargetType(target.structureType || 'S_NIG');
    setLayoutTargetId(target.structureId || '');
    setLayoutLabel(json.label || '');

    // If it's a tower layout, ensure we fetch its apartments immediately for the cell selector
    if (target.structureType === 'TOWER' && target.structureId) {
      try {
        const apts = await api_tctd(`/apartments/tower/${target.structureId}`, 'GET');
        setTowerApartmentsForGrid(Array.isArray(apts) ? apts : []);
      } catch (e) {
        setTowerApartmentsForGrid([]);
      }
    }

    const matrix = json.matrix || [];
    setGridRows(matrix.length);
    setGridCols(matrix[0]?.length || 1);

    const mappedMatrix = await Promise.all(
      matrix.map(async (row: any[]) =>
        Promise.all(
          row.map(async (cell: any) => {
            if (cell === 'GAP' || !cell) return { type: 'GAP', id: '', label: '' };
            if (typeof cell === 'string') {
              if (cell.startsWith('STREET')) return { type: 'STREET', id: cell, label: cell };
              const realName = await resolveApartmentLabel(cell);
              return { type: 'APT', id: cell, label: realName };
            }
            if (typeof cell === 'object' && cell !== null) {
              return {
                type: cell.type,
                id: cell.id,
                label: cell.label || ''
              };
            }
            return { type: 'GAP', id: '', label: '' };
          })
        )
      )
    );
    setVisualMatrix(mappedMatrix);
  };

  useEffect(() => {
    if (!aptSectorId) {
      setAvailableTowersForApt([]);
      return;
    }
    api_tctd(`/structures/TOWER?subNigId=${aptSectorId}`, 'GET')
      .then(data => {
        setAvailableTowersForApt(Array.isArray(data) ? data : []);
        setAptTowerId('');
      })
      .catch(() => setAvailableTowersForApt([]));
  }, [aptSectorId]);

  const initVisualGrid = (rows: number, cols: number) => {
    const newMatrix = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ type: 'GAP', id: '', label: '' }))
    );
    setVisualMatrix(newMatrix);
  };

  useEffect(() => {
    if (layoutMode === 'NEW') initVisualGrid(gridRows, gridCols);
  }, [gridRows, gridCols, layoutMode]);

  const handleOpenCellConfig = (r: number, c: number) => {
    setSelectedCellCoords({ r, c });
    const currentCell = visualMatrix[r][c];
    setCellEditType(currentCell.type);
    if (currentCell.type === 'STREET') {
      const match = currentCell.id.match(/\d+/);
      setCellStreetNum(match ? match[0] : '1');
    } else if (currentCell.type === 'APT') {
      setCellAptId(currentCell.id);
    } else if (currentCell.type === 'TOWER' || currentCell.type === 'ZA') {
      setCellObjId(currentCell.id);
      setCellObjLabel(currentCell.label);
    }
  };

  const handleApplyCellConfig = () => {
    if (!selectedCellCoords) return;
    const { r, c } = selectedCellCoords;
    let cellData: any = { type: cellEditType, id: '', label: '' };

    if (cellEditType === 'STREET') {
      cellData = { type: 'STREET', id: `STREET-${cellStreetNum}`, label: `Street ${cellStreetNum}` };
    } else if (cellEditType === 'APT') {
      const foundApt = towerApartmentsForGrid.find(a => a.id === cellAptId);
      cellData = { type: 'APT', id: cellAptId, label: foundApt ? foundApt.name : cellAptId };
    } else if (cellEditType === 'TOWER') {
      cellData = { type: 'TOWER', id: cellObjId, label: cellObjLabel };
    } else if (cellEditType === 'ZA') {
      cellData = { type: 'ZA', id: cellObjId, label: cellObjLabel };
    }

    const updated = [...visualMatrix.map(row => [...row])];
    updated[r][c] = cellData;
    setVisualMatrix(updated);
    setSelectedCellCoords(null);
  };

  const handleSaveVisualLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendMatrix = visualMatrix.map(row =>
        row.map(cell => {
          if (cell.type === 'GAP') return 'GAP';
          if (cell.type === 'STREET') return cell.id || 'STREET-1';
          if (cell.type === 'APT') return cell.id;
          if (cell.type === 'TOWER' || cell.type === 'ZA') return { type: cell.type, id: cell.id, label: cell.label };
          return 'GAP';
        })
      );

      const payload = {
        structureType: layoutTargetType,
        structureId: layoutTargetId || layoutSectorId,
        layoutJson: {
          type: layoutTargetType === 'S_NIG' ? 'SNIG' : 'TOWER',
          id: layoutTargetId || layoutSectorId,
          label: layoutLabel || 'Community Map',
          matrix: backendMatrix
        }
      };

      await api_tctd('/layouts', 'POST', payload);
      setStatusMsg('Visual layout saved successfully!');
    } catch (err: any) {
      setStatusMsg(err.message || 'Error saving layout.');
    }
  };

  const handleApproveUserWithApartment = async (userId: string, apartmentId: string) => {
    try {
      // Endpoint para aprobar usuario y asignar apartamento
      await api_tctd(`/users/${userId}/status`, 'PATCH', { status: 'ACTIVE', apartmentId });
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      setStatusMsg('User approved and apartment assigned successfully.');
    } catch (err: any) {
      setStatusMsg(err.message || 'Error approving user.');
    }
  };

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-3 max-w-sm mx-auto relative pb-6">
        <div className="shrink-0 space-y-1 border-b border-[#569ad5d4]/30 pb-2">
          <h2 className="text-xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
            Admin <span className="text-[#569ad5d4]">Control Panel</span>
          </h2>
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium">
            Access control, structures, and visual maps management
          </p>

          <div className="grid grid-cols-5 gap-0.5 pt-1">
            {(['users', 'structures', 'layoutBuilder', 'apartments', 'areas'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setStatusMsg(''); }}
                className={`py-1 text-[7px] font-black uppercase italic border rounded-none transition-all truncate px-0.5 ${
                  activeTab === tab
                    ? 'bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 border-[#569ad5d4]'
                    : 'bg-white dark:bg-[#0b1b2b] text-slate-700 dark:text-slate-300 border-[#569ad5d4]/40 hover:bg-slate-100'
                }`}
              >
                {tab === 'layoutBuilder' ? 'Layouts' : tab === 'areas' ? 'Areas' : tab}
              </button>
            ))}
          </div>
        </div>

        {statusMsg && (
          <p className="text-[10px] italic font-bold text-center text-[#569ad5d4] shrink-0 bg-sky-50 dark:bg-sky-950/40 p-1 border border-sky-400">
            {statusMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
          {activeTab === 'users' && (
            <PendingUsersTab pendingUsers={pendingUsers} onApprove={handleApproveUserWithApartment} />
          )}

          {activeTab === 'structures' && (
            <StructuresTab
              structType={structType} setStructType={setStructType}
              structName={structName} setStructName={setStructName}
              selectedSectorForTower={selectedSectorForTower} setSelectedSectorForTower={setSelectedSectorForTower}
              sectors={sectors}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api_tctd(`/structures/${structType}`, 'POST', {
                    name: structName,
                    subNigId: structType === 'TOWER' ? selectedSectorForTower : undefined
                  });
                  setStatusMsg('Structure created successfully.');
                  setStructName('');
                } catch (err: any) {
                  setStatusMsg(err.message || 'Error creating structure.');
                }
              }}
            />
          )}

          {activeTab === 'layoutBuilder' && (
            <div className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] p-3 space-y-3">
              <div className="flex justify-between items-center border-b border-[#569ad5d4]/30 pb-1">
                <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">Visual Layout Builder</h3>
                <div className="flex space-x-1">
                  {(['NEW', 'EDIT'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setLayoutMode(mode)}
                      className={`px-2 py-0.5 text-[8px] font-black uppercase italic border ${
                        layoutMode === mode ? 'bg-[#569ad5d4] text-slate-900 border-[#569ad5d4]' : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {layoutMode === 'EDIT' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Select Layout to Edit</label>
                  <select
                    value={selectedLayoutIdToEdit}
                    onChange={(e) => handleSelectLayoutToEdit(e.target.value)}
                    className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                  >
                    <option value="">Choose layout...</option>
                    {existingLayouts.map(l => (
                      <option key={l.id} value={l.id}>
                        [{l.structureType === "TOWER" ? "Tower" : l.structureType === "S_NIG" ? "Sector" : "Unknown"}] {l.layoutJson?.label || l.structureId}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Map Type</label>
                  <select
                    value={layoutTargetType}
                    onChange={(e) => {
                      setLayoutTargetType(e.target.value as any);
                      if (layoutMode === 'NEW') initVisualGrid(gridRows, gridCols);
                    }}
                    className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                  >
                    <option value="S_NIG">Sector</option>
                    <option value="TOWER">Tower</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Map Label</label>
                  <input
                    type="text"
                    placeholder="e.g., Loma de los Reyes"
                    value={layoutLabel}
                    onChange={(e) => setLayoutLabel(e.target.value)}
                    className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Associated Sector</label>
                <select
                  value={layoutSectorId}
                  onChange={(e) => {
                    setLayoutSectorId(e.target.value);
                    if (layoutTargetType === 'S_NIG') setLayoutTargetId(e.target.value);
                  }}
                  className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select Sector...</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {layoutTargetType === 'TOWER' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Target Tower</label>
                  <select
                    value={layoutTargetId}
                    onChange={(e) => setLayoutTargetId(e.target.value)}
                    className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                    required
                    disabled={!layoutSectorId || layoutTowersForTarget.length === 0}
                  >
                    <option value="">Select Tower...</option>
                    {layoutTowersForTarget.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#569ad5d4]/30">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Rows ({gridRows})</label>
                  <input type="number" min="1" max="10" value={gridRows} onChange={(e) => setGridRows(Number(e.target.value))} className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Columns ({gridCols})</label>
                  <input type="number" min="1" max="10" value={gridCols} onChange={(e) => setGridCols(Number(e.target.value))} className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="grid gap-1 bg-slate-100 dark:bg-[#0b1b2b] p-2 border border-[#569ad5d4]/60" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {visualMatrix.map((row, r) =>
                  row.map((cell, c) => {
                    const isSelected = selectedCellCoords?.r === r && selectedCellCoords?.c === c;
                    let bgStyle = 'bg-white dark:bg-[#183d5dd4] text-slate-800 dark:text-white';
                    let icon = null;

                    if (cell.type === 'GAP') bgStyle = 'bg-transparent border-dashed border-slate-300 text-transparent';
                    else if (cell.type === 'STREET') bgStyle = 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[8px]';
                    else if (cell.type === 'APT') { bgStyle = 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200'; icon = <BsFillDoorClosedFill />; }
                    else if (cell.type === 'TOWER') { bgStyle = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'; icon = <PiCityFill />; }
                    else if (cell.type === 'ZA') { bgStyle = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'; icon = <GiHighGrass />; }

                    return (
                      <div key={`${r}-${c}`} onClick={() => handleOpenCellConfig(r, c)} className={`border p-1 min-h-[40px] flex flex-col items-center justify-center cursor-pointer font-black text-[9px] transition-all ${bgStyle} ${isSelected ? 'ring-2 ring-amber-400' : ''}`}>
                        {icon}
                        <span className="truncate max-w-full text-[8px]">{cell.label || cell.type}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedCellCoords && (
                <div className="bg-sky-50 dark:bg-[#0b1b2b] border-2 border-amber-400 p-2.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase italic text-amber-600 dark:text-amber-400">Configure Cell [{selectedCellCoords.r}, {selectedCellCoords.c}]</span>
                    <button onClick={() => setSelectedCellCoords(null)} className="text-xs font-bold text-red-500">✕</button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Element Type</label>
                    <select
                      value={cellEditType}
                      onChange={(e) => setCellEditType(e.target.value)}
                      className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-white dark:bg-[#183d5dd4] text-slate-900 dark:text-white"
                    >
                      <option value="GAP">Empty Space (GAP)</option>
                      {/* Las torres NUNCA deben mostrar STREET */}
                      {layoutTargetType === 'TOWER' && <option value="APT">Apartment</option>}
                      {layoutTargetType === 'S_NIG' && (
                        <>
                          <option value="STREET">Street</option>
                          <option value="TOWER">Tower Object</option>
                          <option value="ZA">Area Object</option>
                        </>
                      )}
                    </select>
                  </div>

                  {cellEditType === 'STREET' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Street Number ID</label>
                      <input type="number" min="1" value={cellStreetNum} onChange={(e) => setCellStreetNum(e.target.value)} className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-white dark:bg-[#183d5dd4] text-slate-900 dark:text-white" />
                    </div>
                  )}

                  {cellEditType === 'APT' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Select Apartment</label>
                      <select value={cellAptId} onChange={(e) => setCellAptId(e.target.value)} className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-white dark:bg-[#183d5dd4] text-slate-900 dark:text-white">
                        <option value="">Choose apartment...</option>
                        {towerApartmentsForGrid.map(apt => (
                          <option key={apt.id} value={apt.id}>Apt {apt.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cellEditType === 'TOWER' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Select Tower</label>
                      <select
                        value={cellObjId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setCellObjId(selectedId);
                          const foundTower = layoutTowersForTarget.find(t => t.id === selectedId);
                          if (foundTower) setCellObjLabel(foundTower.name);
                        }}
                        className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-white dark:bg-[#183d5dd4] text-slate-900 dark:text-white"
                      >
                        <option value="">Choose tower...</option>
                        {layoutTowersForTarget.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cellEditType === 'ZA' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Select Area</label>
                      <select
                        value={cellObjId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setCellObjId(selectedId);
                          const foundArea = sectorAreasForGrid.find(a => a.id === selectedId);
                          if (foundArea) setCellObjLabel(foundArea.title);
                        }}
                        className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-white dark:bg-[#183d5dd4] text-slate-900 dark:text-white"
                      >
                        <option value="">Choose area...</option>
                        {sectorAreasForGrid.map(a => (
                          <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button type="button" onClick={handleApplyCellConfig} className="w-full py-1 text-[9px] font-black uppercase italic bg-amber-500 text-slate-900 mt-1">
                    Apply Cell Configuration
                  </button>
                </div>
              )}

              <button type="button" onClick={handleSaveVisualLayout} className="w-full py-2 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 shadow-md">
                Save Visual Layout to System
              </button>
            </div>
          )}

          {activeTab === 'apartments' && (
            <ApartmentsTab
              sectors={sectors}
              aptSectorId={aptSectorId} setAptSectorId={setAptSectorId}
              availableTowersForApt={availableTowersForApt}
              aptTowerId={aptTowerId} setAptTowerId={setAptTowerId}
              aptName={aptName} setAptName={setAptName}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api_tctd('/apartments', 'POST', { towerId: aptTowerId, name: aptName });
                  setStatusMsg('Apartment created successfully.');
                  setAptName('');
                } catch (err: any) {
                  setStatusMsg(err.message || 'Error creating apartment.');
                }
              }}
            />
          )}

          {activeTab === 'areas' && (
            <AreasTab
              sectors={sectors}
              areaSectorId={areaSectorId} setAreaSectorId={setAreaSectorId}
              areaTitle={areaTitle} setAreaTitle={setAreaTitle}
              areaDesc={areaDesc} setAreaDesc={setAreaDesc}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api_tctd('/zas', 'POST', { subNigId: areaSectorId, title: areaTitle, description: areaDesc });
                  setStatusMsg('Area created successfully.');
                  setAreaTitle('');
                  setAreaDesc('');
                } catch (err: any) {
                  setStatusMsg(err.message || 'Error creating Area.');
                }
              }}
            />
          )}
        </div>
      </div>
    </Template>
  );
}
