import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PostProps {
  post: {
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
    author?: {
      id: string;
      fullName: string;
      nickname?: string;
      role?: string;
      status?: string;
    };
  };
  currentUser: { id: string; role: string } | null;
  isLeadership: boolean;
  onDelete: (postId: string) => void;
  onUpdate: (postId: string, newContent: string) => void;
  onReport: (post: any) => void;
  onStatusChange: (authorId: string, status: string) => void;
}

const formatRole = (role?: string) => {
  switch (role) {
    case 'L_NIG':
      return { label: 'Owner', color: 'text-purple-600 dark:text-purple-400' };
    case 'L_SNIG':
      return { label: 'Leader', color: 'text-blue-600 dark:text-blue-400' };
    case 'L_T':
      return { label: 'Tower Leader', color: 'text-emerald-600 dark:text-emerald-400' };
    default:
      return { label: 'Neighbor', color: 'text-slate-500 dark:text-slate-400' };
  }
};

export default function PostItem({
  post,
  currentUser,
  isLeadership,
  onDelete,
  onUpdate,
  onReport,
  onStatusChange,
}: PostProps) {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isAuthor = currentUser && post.authorId === currentUser.id;
  const canModify = isAuthor || isLeadership;
  const roleInfo = formatRole(post.author?.role);

  const authorStatus = post.author?.status;
  const isReported = authorStatus === 'REPORTED';
  const isTempBanned = authorStatus === 'TEMPORARY_BAN';
  const isPermaBanned = authorStatus === 'BANNED';

  const authorDisplayName = post.author?.nickname || post.author?.fullName || 'Neighbor';
  const authorFullName = post.author?.nickname && post.author?.fullName ? ` (${post.author.fullName})` : '';

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onUpdate(post.id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-[#183d5dd4] border border-[#569ad5d4]/60 p-3 rounded-none shadow-sm space-y-1 relative">
      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-300 italic">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span
            onClick={() => post.author?.id && navigate(`/users/${post.author.id}`)}
            className="font-bold text-[#183d5dd4] dark:text-[#569ad5d4] cursor-pointer hover:underline"
          >
            {authorDisplayName}{authorFullName}
          </span>
          <span className={`text-[8px] font-black uppercase px-1 border border-current ${roleInfo.color}`}>
            {roleInfo.label}
          </span>

          {/* Indicadores precisos según el enum real del modelo */}
          {isReported && (
            <span className="text-[7px] font-black uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 px-1 border border-blue-500/60 italic">
              [REPORTED]
            </span>
          )}
          {isTempBanned && (
            <span className="text-[7px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-1 border border-amber-500/60 italic">
              [TEMP BAN]
            </span>
          )}
          {isPermaBanned && (
            <span className="text-[7px] font-black uppercase bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-1 border border-red-500/60 italic">
              [BANNED]
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

          <div className="relative">
            <button
              onClick={() => setActiveMenu(!activeMenu)}
              className="px-1.5 py-0.5 text-xs font-bold hover:text-[#569ad5d4] transition-colors"
            >
              ⋮
            </button>

            {activeMenu && (
              <div className="absolute right-0 top-5 bg-white dark:bg-[#0b1b2b] border border-[#569ad5d4] shadow-lg z-10 py-1 w-32 text-[10px]">
                {isAuthor && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setActiveMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic"
                  >
                    Edit
                  </button>
                )}
                {canModify && (
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setActiveMenu(false);
                    }}
                    className="w-full text-left px-3 py-1 text-red-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold"
                  >
                    Delete
                  </button>
                )}

                {isPermaBanned ? (
                  isLeadership && !isAuthor && (
                    <button
                      onClick={() => {
                        onStatusChange(post.authorId, 'ACTIVE');
                        setActiveMenu(false);
                      }}
                      className="w-full text-left px-3 py-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold border-t border-[#569ad5d4]/30"
                    >
                      Pardon
                    </button>
                  )
                ) : isTempBanned ? (
                  <>
                    {!isAuthor && (
                      <button
                        onClick={() => {
                          onReport(post);
                          setActiveMenu(false);
                        }}
                        className="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic text-amber-600 dark:text-amber-400"
                      >
                        Report Post
                      </button>
                    )}
                    {isLeadership && !isAuthor && (
                      <>
                        <button
                          onClick={() => {
                            onStatusChange(post.authorId, 'BANNED');
                            setActiveMenu(false);
                          }}
                          className="w-full text-left px-3 py-1 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold"
                        >
                          Permanent Ban
                        </button>
                        <button
                          onClick={() => {
                            onStatusChange(post.authorId, 'ACTIVE');
                            setActiveMenu(false);
                          }}
                          className="w-full text-left px-3 py-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold border-t border-[#569ad5d4]/30"
                        >
                          Pardon
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {!isAuthor && (
                      <button
                        onClick={() => {
                          onReport(post);
                          setActiveMenu(false);
                        }}
                        className="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic text-amber-600 dark:text-amber-400"
                      >
                        Report Post
                      </button>
                    )}

                    {isLeadership && !isAuthor && (
                      <button
                        onClick={() => {
                          onStatusChange(post.authorId, 'BANNED');
                          setActiveMenu(false);
                        }}
                        className="w-full text-left px-3 py-1 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-[#183d5dd4] italic font-bold border-t border-[#569ad5d4]/30"
                      >
                        Ban
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-1.5 pt-1">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-2 py-1 text-xs italic rounded-none border border-[#569ad5d4] bg-slate-50 dark:bg-[#0b1b2b] text-slate-900 dark:text-white"
          />
          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-0.5 text-[10px] italic border border-slate-400 text-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-2 py-0.5 text-[10px] italic bg-[#183d5dd4] dark:bg-[#569ad5d4] text-white font-bold"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs italic text-slate-800 dark:text-slate-100">
          {post.content}
        </p>
      )}
    </div>
  );
}
