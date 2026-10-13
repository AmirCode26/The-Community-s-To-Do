import React from 'react';

interface Props {
  structType: string;
  setStructType: (v: string) => void;
  structName: string;
  setStructName: (v: string) => void;
  selectedSectorForTower: string;
  setSelectedSectorForTower: (v: string) => void;
  sectors: any[];
  onSubmit: (e: React.FormEvent) => void;
}

export default function StructuresTab({
  structType, setStructType, structName, setStructName,
  selectedSectorForTower, setSelectedSectorForTower, sectors, onSubmit
}: Props) {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] p-3 space-y-2">
      <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">Create Structure</h3>

      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Type</label>
        <select
          value={structType}
          onChange={(e) => setStructType(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
        >
          <option value="TOWER">Tower</option>
          <option value="S_NIG">Sector</option>
        </select>
      </div>

      {structType === 'TOWER' && (
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Belongs to Sector</label>
          <select
            value={selectedSectorForTower}
            onChange={(e) => setSelectedSectorForTower(e.target.value)}
            className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
            required
          >
            <option value="">Select a Sector...</option>
            {sectors.map(sn => <option key={sn.id} value={sn.id}>{sn.name}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Name</label>
        <input
          type="text"
          placeholder="e.g., Olympus Tower A1..."
          value={structName}
          onChange={(e) => setStructName(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          required
        />
      </div>

      <button type="submit" className="w-full py-1.5 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900">
        Create Structure
      </button>
    </form>
  );
}
