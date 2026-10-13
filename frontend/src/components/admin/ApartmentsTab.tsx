import React from 'react';

interface Props {
  sectors: any[];
  aptSectorId: string;
  setAptSectorId: (v: string) => void;
  availableTowersForApt: any[];
  aptTowerId: string;
  setAptTowerId: (v: string) => void;
  aptName: string;
  setAptName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ApartmentsTab({
  sectors, aptSectorId, setAptSectorId, availableTowersForApt,
  aptTowerId, setAptTowerId, aptName, setAptName, onSubmit
}: Props) {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] p-3 space-y-2">
      <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">Create Apartment</h3>

      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Sector</label>
        <select
          value={aptSectorId}
          onChange={(e) => setAptSectorId(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          required
        >
          <option value="">Select a Sector...</option>
          {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Tower</label>
        <select
          value={aptTowerId}
          onChange={(e) => setAptTowerId(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          required
          disabled={!aptSectorId || availableTowersForApt.length === 0}
        >
          <option value="">Select a tower...</option>
          {availableTowersForApt.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold uppercase italic text-slate-600 dark:text-slate-300">Name / Number (e.g., 401)</label>
        <input
          type="text"
          placeholder="Apartment number..."
          value={aptName}
          onChange={(e) => setAptName(e.target.value)}
          className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          required
        />
      </div>

      <button type="submit" className="w-full py-1.5 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900">
        Create Apartment
      </button>
    </form>
  );
}
