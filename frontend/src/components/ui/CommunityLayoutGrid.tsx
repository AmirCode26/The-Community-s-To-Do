import { useNavigate } from 'react-router-dom';
import { BsFillDoorClosedFill } from "react-icons/bs";
import { PiCityFill } from "react-icons/pi";
import { GiHighGrass } from "react-icons/gi";

interface GridProps {
  layout: {
    type: 'SNIG' | 'TOWER';
    id: string;
    label: string;
    matrix: (string | { type: 'TOWER' | 'ZA'; id: string; label?: string })[][];
  };
  currentUser: any;
}

export default function CommunityLayoutGrid({ layout }: GridProps) {
  const navigate = useNavigate();

  const handleCellClick = (cell: string | { type: 'TOWER' | 'ZA'; id: string; label?: string }) => {
    if (typeof cell === 'string') {
      if (cell !== 'GAP' && !cell.startsWith('STREET')) {
        navigate(`/users?apartmentId=${cell}`);
      }
      return;
    }

    if (cell.type === 'TOWER') {
      navigate(`/layout/tower/${cell.id}`);
    } else if (cell.type === 'ZA') {
      navigate(`/zones`);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0b1b2b]/50 p-2 space-y-2">
      <div className="text-[10px] font-black uppercase italic text-slate-800 dark:text-slate-200 text-center border-b border-[#569ad5d4]/20 pb-1">
        {layout.label}
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${layout.matrix[0]?.length || 1}, minmax(0, 1fr))` }}
      >
        {layout.matrix.map((row, rIndex) =>
          row.map((cell, cIndex) => {
            const isGap = cell === 'GAP' || (typeof cell === 'string' && cell === 'GAP');
            const isStreet = typeof cell === 'string' && cell.startsWith('STREET');
            const isApartment = typeof cell === 'string' && !isGap && !isStreet;
            const isObject = typeof cell === 'object' && cell !== null;

            let cellClass = 'bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4]/40 text-slate-900 dark:text-white';
            let iconElement = null;

            if (isGap) {
              cellClass = 'bg-transparent border-none text-transparent cursor-default shadow-none';
            } else if (isStreet) {
              cellClass = 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-default';
            } else if (isApartment) {
              cellClass = 'bg-sky-50 dark:bg-sky-950/40 border border-sky-400/60 text-sky-900 dark:text-sky-200 cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/60';
              iconElement = <BsFillDoorClosedFill className="text-base text-sky-600 dark:text-sky-400" />;
            } else if (isObject) {
              if (cell.type === 'TOWER') {
                cellClass = 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400/60 text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60';
                iconElement = <PiCityFill className="text-base text-emerald-600 dark:text-emerald-400" />;
              } else if (cell.type === 'ZA') {
                cellClass = 'bg-amber-50 dark:bg-amber-950/40 border border-amber-400/60 text-amber-900 dark:text-amber-200 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60';
                iconElement = <GiHighGrass className="text-base text-amber-600 dark:text-amber-400" />;
              }
            }

            return (
              <div
                key={`${rIndex}-${cIndex}`}
                onClick={() => !isGap && !isStreet && handleCellClick(cell)}
                className={`p-1.5 font-black uppercase italic text-center flex items-center justify-center min-h-[45px] transition-all rounded-none ${cellClass}`}
              >
                {iconElement}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
