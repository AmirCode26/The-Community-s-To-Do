import React from 'react';

interface Props {
  sectors: any[];
  areaSectorId: string;
  setAreaSectorId: (v: string) => void;
  areaTitle: string;
  setAreaTitle: (v: string) => void;
  areaDesc: string;
  setAreaDesc: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AreasTab({
  sectors, areaSectorId, setAreaSectorId, areaTitle, setAreaTitle, areaDesc, setAreaDesc, onSubmit
}: Props) {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] p-3 space-y-2">
      <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">Create Area of Action</h3>
      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Associated Sector</label>
        <select
          value={areaSectorId}
          onChange={(e) => setAreaSectorId(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          required
        >
          <option value="">Select Sector...</option>
          {sectors.map(sn => <option key={sn.id} value={sn.id}>{sn.name}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Title</label>
        <input
          type="text"
          placeholder="Area Title..."
          value={areaTitle}
          onChange={(e) => setAreaTitle(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Description</label>
        <textarea
          rows={2}
          placeholder="Area Description..."
          value={areaDesc}
          onChange={(e) => setAreaDesc(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white resize-none"
          required
        />
      </div>
      <button type="submit" className="w-full py-1.5 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900">
        Create Area
      </button>
    </form>
  );
}
