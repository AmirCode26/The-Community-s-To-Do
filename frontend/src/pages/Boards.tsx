import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Template from '../components/Template';
import { api_tctd } from '../services/api';

interface Board {
  id: string;
  title: string;
  type: 'ANNOUNCEMENT' | 'DISCUSSION';
  ownerStructureType: string;
  cooldownSeconds: number;
}

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await api_tctd('/boards', 'GET');
        setBoards(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not load community boards.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const announcements = boards.filter((b) => b.type === 'ANNOUNCEMENT');
  const discussions = boards.filter((b) => b.type === 'DISCUSSION');

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-4 max-w-sm mx-auto">

        <div className="shrink-0 space-y-0.5">
          <h2 className="text-xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
            Community <span className="text-[#569ad5d4]">Boards</span>
          </h2>
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium">
            Official notices and community discussion channels
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center shrink-0">
            {errorMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scroll">
          {loading ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              Loading communication channels...
            </p>
          ) : boards.length === 0 ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              No boards available at the moment.
            </p>
          ) : (
            <>
              {announcements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider">
                    Official Announcements
                  </h3>
                  {announcements.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => navigate(`/boards/${board.id}`)}
                      className="bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-3.5 shadow-sm rounded-none cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all relative group"
                    >
                      <div className="absolute top-0 right-0 w-2 h-2 bg-[#569ad5d4]" />
                      <h4 className="text-xs font-black uppercase italic text-slate-900 dark:text-white group-hover:text-[#569ad5d4] transition-colors">
                        {board.title}
                      </h4>
                      <p className="text-[11px] italic text-slate-600 dark:text-slate-300 mt-1">
                        Official communications & building alerts
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {discussions.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-[11px] font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] tracking-wider">
                    Discussion Forums
                  </h3>
                  {discussions.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => navigate(`/boards/${board.id}`)}
                      className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] p-3.5 shadow-sm rounded-none cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all relative group"
                    >
                      <h4 className="text-xs font-bold uppercase italic text-slate-900 dark:text-white group-hover:text-[#569ad5d4] transition-colors">
                        {board.title}
                      </h4>
                      <p className="text-[11px] italic text-slate-600 dark:text-slate-300 mt-1">
                        Open community exchange and neighbor conversations
                      </p>
                    </div>
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
