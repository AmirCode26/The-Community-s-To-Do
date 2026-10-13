import { useState, useEffect } from 'react';
import Template from '../components/Template';
import { api_tctd, getUserSession } from '../services/api';
import { GiHighGrass } from "react-icons/gi";

export default function AreasDirectory() {
  const currentUser = getUserSession();
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Voting form states
  const [votingTaskId, setVotingTaskId] = useState<string | null>(null);
  const [voteComment, setVoteComment] = useState('');
  const [votedTaskIds, setVotedTaskIds] = useState<string[]>([]);

  // Fetch Sectors on load
  useEffect(() => {
    (async () => {
      try {
        const data = await api_tctd('/structures/S_NIG', 'GET');
        if (Array.isArray(data) && data.length > 0) {
          setSectors(data);
          setSelectedSectorId(data[0].id);
        }
      } catch (err) {
        console.error("Error loading sectors", err);
      }
    })();
  }, []);

  // Fetch Areas when selectedSectorId changes
  useEffect(() => {
    if (!selectedSectorId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await api_tctd(`/zas/subnig/${selectedSectorId}`, 'GET');
        setAreas(Array.isArray(data) ? data : []);
        setSelectedArea(null);
        setTasks([]);
      } catch (err) {
        console.error("Error loading areas", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSectorId]);

  // Fetch Tasks when an Area is selected
  const handleSelectArea = async (area: any) => {
    setSelectedArea(area);
    try {
      const data = await api_tctd(`/zas/${area.id}/tasks`, 'GET');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading tasks", err);
    }
  };

  // Cast vote on a task
  const handleCastVote = async (taskId: string, approved: boolean) => {
    try {
      await api_tctd('/zas/tasks/vote', 'POST', {
        taskId,
        approved,
        comment: voteComment.trim() || undefined
      });
      setStatusMsg('Vote cast successfully!');
      setVotingTaskId(null);
      setVoteComment('');
      setVotedTaskIds(prev => [...prev, taskId]);

      // Refresh tasks
      if (selectedArea) {
        const data = await api_tctd(`/zas/${selectedArea.id}/tasks`, 'GET');
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error casting vote.');
    }
  };

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-3 max-w-sm mx-auto relative pb-6">

        {/* Header */}
        <div className="shrink-0 space-y-1 border-b border-[#569ad5d4]/30 pb-2">
          <h2 className="text-xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
            Areas <span className="text-[#569ad5d4]">Directory & Voting</span>
          </h2>
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium">
            Community action areas and consensus engine
          </p>

          {/* Sector Selector */}
          <div className="pt-1">
            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="w-full p-1.5 text-xs italic border border-[#569ad5d4] bg-white dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
            >
              {sectors.map(sn => (
                <option key={sn.id} value={sn.id}>Sector: {sn.name}</option>
              ))}
            </select>
          </div>
        </div>

        {statusMsg && (
          <p className="text-[10px] italic font-bold text-center text-[#569ad5d4] shrink-0 bg-sky-50 dark:bg-sky-950/40 p-1 border border-sky-400">
            {statusMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
          {loading ? (
            <p className="text-xs italic text-center text-slate-500 py-6">Loading community areas...</p>
          ) : !selectedArea ? (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">
                Available Areas ({areas.length})
              </h3>
              {areas.length === 0 ? (
                <p className="text-xs italic text-center text-slate-500 py-6">No areas registered for this sector.</p>
              ) : (
                areas.map(area => (
                  <div
                    key={area.id}
                    onClick={() => handleSelectArea(area)}
                    className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4]/60 p-3 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <GiHighGrass className="text-amber-500 text-base" />
                      <h4 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">{area.title}</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 italic">{area.description}</p>
                    <div className="flex justify-between items-center pt-1 text-[9px] font-bold uppercase italic text-amber-600 dark:text-amber-400">
                      <span>Status: {area.status}</span>
                      <span>Priority: {area.priority}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedArea(null)}
                className="text-[10px] font-bold uppercase italic text-[#569ad5d4] hover:underline"
              >
                ← Back to Areas List
              </button>

              <div className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4] p-3 space-y-1">
                <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">{selectedArea.title}</h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 italic">{selectedArea.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase italic text-slate-800 dark:text-slate-200 tracking-wider">
                  -- Consensus Tasks --
                </h4>
                {tasks.length === 0 ? (
                  <p className="text-xs italic text-center text-slate-500 py-4">No tasks found for this area.</p>
                ) : (
                  tasks.map(task => {
                    // Check if current user already voted based on task votes or local state
                    const alreadyVoted =
                      votedTaskIds.includes(task.id) ||
                      (Array.isArray(task.votes) && task.votes.some((v: any) => v.userId === currentUser?.id || v.user?.id === currentUser?.id));

                    return (
                      <div key={task.id} className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4]/60 p-2.5 space-y-2">
                        <div>
                          <p className="text-xs font-black uppercase italic text-slate-900 dark:text-white">{task.title}</p>
                          {task.description && <p className="text-[9px] text-slate-500 dark:text-slate-300">{task.description}</p>}
                        </div>

                        {alreadyVoted ? (
                          <div className="pt-1 text-center">
                            <span className="inline-block w-full py-1 text-[9px] font-black uppercase italic bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-200 border border-sky-400">
                              ✓ Voted
                            </span>
                          </div>
                        ) : votingTaskId === task.id ? (
                          <div className="space-y-2 pt-1 border-t border-[#569ad5d4]/30">
                            <input
                              type="text"
                              placeholder="Optional comment..."
                              value={voteComment}
                              onChange={(e) => setVoteComment(e.target.value)}
                              className="w-full p-1 text-[10px] italic border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCastVote(task.id, true)}
                                className="flex-1 py-1 text-[9px] font-black uppercase italic bg-emerald-600 text-white"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCastVote(task.id, false)}
                                className="flex-1 py-1 text-[9px] font-black uppercase italic bg-red-600 text-white"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => setVotingTaskId(null)}
                                className="px-2 py-1 text-[9px] font-bold uppercase italic border border-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => { setVotingTaskId(task.id); setVoteComment(''); }}
                              className="px-3 py-1 text-[9px] font-black uppercase italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900"
                            >
                              Cast Vote
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </Template>
  );
}
