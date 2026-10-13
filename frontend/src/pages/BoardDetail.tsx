import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Template from '../components/Template';
import PostItem from '../components/ui/PostItem';
import { api_tctd, getUserSession } from '../services/api';

interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    nickname?: string;
    role?: string;
  };
}

interface BoardInfo {
  id: string;
  title: string;
  type: string;
}

export default function BoardDetail() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUserSession();

  const [board, setBoard] = useState<BoardInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [reportPostTarget, setReportPostTarget] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('');

  const isLeadership = currentUser && ['L_NIG', 'L_SNIG', 'L_T'].includes(currentUser.role);

  const loadBoardData = async () => {
    try {
      const boardData = await api_tctd(`/boards/${boardId}`, 'GET');
      setBoard(boardData);

      const postsData = await api_tctd(`/posts/board/${boardId}`, 'GET');
      setPosts(postsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Could not load board content.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBoardData = async () => {
      try {
        const boardData = await api_tctd(`/boards/${boardId}`, 'GET');
        setBoard(boardData);

        const postsData = await api_tctd(`/posts/board/${boardId}`, 'GET');
        setPosts(postsData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Could not load board content.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  const handlePostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setPosting(true);
    setErrorMsg('');

    try {
      await api_tctd('/posts', 'POST', {
        boardId,
        content: newContent,
      });

      setNewContent('');
      const updatedPosts = await api_tctd(`/posts/board/${boardId}`, 'GET');
      setPosts(updatedPosts);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error publishing post. Check cooldowns or permissions.');
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      await api_tctd(`/posts/${postId}`, 'DELETE');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error deleting post.');
      }
      loadBoardData();
    }
  };

  const handleUpdatePost = async (postId: string, content: string) => {
    try {
      await api_tctd(`/posts/${postId}`, 'PUT', { content });
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? { ...p, content } : p))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error updating post.');
      }
    }
  };

  const handleReportPostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportPostTarget || !reportReason.trim()) return;

    try {
      await api_tctd('/reports', 'POST', {
        targetId: reportPostTarget.id,
        targetType: 'POST',
        reason: reportReason,
      });
      setReportPostTarget(null);
      setReportReason('');
      alert('Post reported successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to submit report.');
      }
    }
  };

  const handleBanAuthor = async (authorId: string) => {
    try {
      await api_tctd(`/users/${authorId}/status`, 'PATCH', { status: 'BANNED' });
      alert('Author successfully banned.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to ban user.');
      }
    }
  };

  return (
    <Template>
      <div className="h-full w-full flex flex-col space-y-3 max-w-sm mx-auto relative">

        <div className="shrink-0 flex items-center justify-between border-b border-[#569ad5d4]/30 pb-2">
          <div>
            <h2 className="text-base font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
              {board ? board.title : 'Loading Board...'}
            </h2>
            <p className="text-[10px] italic text-slate-600 dark:text-slate-300 font-medium">
              Live discussion channel
            </p>
          </div>
          <button
            onClick={() => navigate('/boards')}
            className="text-[10px] font-bold uppercase italic text-[#183d5dd4] dark:text-[#569ad5d4] underline hover:opacity-80"
          >
            ← Back
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs italic font-bold text-red-500 text-center shrink-0">
            {errorMsg}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scroll">
          {loading ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              Loading posts...
            </p>
          ) : posts.length === 0 ? (
            <p className="text-xs italic text-center text-slate-500 dark:text-slate-400 py-6">
              No posts in this board yet. Be the first to write!
            </p>
          ) : (
            posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                currentUser={currentUser}
                isLeadership={isLeadership}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
                onReport={(p) => setReportPostTarget(p)}
                onBan={handleBanAuthor}
              />
            ))
          )}
        </div>

        {reportPostTarget && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full bg-white dark:bg-[#0b1b2b] border-2 border-[#569ad5d4] p-4 shadow-2xl rounded-none space-y-3">
              <h3 className="text-xs font-black uppercase italic text-slate-900 dark:text-white">
                Report Post
              </h3>
              <form onSubmit={handleReportPostSubmit} className="space-y-3">
                <textarea
                  placeholder="Enter reason for reporting this post..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 text-xs italic rounded-none border border-[#569ad5d4] bg-slate-50 dark:bg-[#183d5dd4] text-slate-900 dark:text-white h-20 resize-none focus:outline-none"
                  required
                />
                <div className="flex space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setReportPostTarget(null)}
                    className="px-3 py-1 text-[10px] uppercase font-bold italic border border-slate-400 text-slate-600 dark:text-slate-300 rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[10px] uppercase font-black italic bg-[#183d5dd4] text-white dark:bg-[#569ad5d4] dark:text-slate-900 rounded-none shadow-md"
                  >
                    Send Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <form onSubmit={handlePostSubmit} className="shrink-0 pt-2 flex space-x-2">
          <input
            type="text"
            placeholder="Write a message to your neighbors..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="flex-1 px-3 py-2 text-xs italic rounded-none border border-[#569ad5d4] focus:outline-none focus:ring-1 focus:ring-[#183d5dd4] dark:focus:ring-white bg-white dark:bg-[#0b1b2b]/80 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
            required
          />
          <button
            type="submit"
            disabled={posting}
            className="px-4 py-2 text-xs font-black uppercase tracking-wider italic text-white bg-[#183d5dd4] hover:bg-[#122e47] dark:bg-[#569ad5d4] dark:hover:bg-[#4585c0] rounded-none transition-all shadow-md disabled:opacity-50"
          >
            {posting ? '...' : 'Send'}
          </button>
        </form>

      </div>
    </Template>
  );
}
