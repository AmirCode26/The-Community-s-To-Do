import Template from '../components/Template';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Template>
      <div className="h-full w-full flex flex-col justify-center items-center text-center max-w-sm mx-auto">
        <div className="w-full bg-white dark:bg-[#183d5dd4] border-2 border-[#569ad5d4] p-6 shadow-lg rounded-none relative">

          <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#569ad5d4]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#569ad5d4]" />

          <h1 className="text-2xl font-black uppercase italic tracking-wider text-slate-900 dark:text-white">
            Welcome <span className="text-[#569ad5d4]">Home</span>
          </h1>
          <p className="text-xs italic text-slate-600 dark:text-slate-300 font-medium">
            Your central connection point for community updates, discussions, and neighborhood coordination.
          </p>

          <button
            onClick={() => navigate('/boards')}
            className="w-full mt-5 py-3 px-4 text-xs font-black uppercase tracking-widest italic text-white bg-[#183d5dd4] hover:bg-[#122e47] dark:bg-[#569ad5d4] dark:hover:bg-[#4585c0] rounded-none transition-all shadow-md"
          >
            Explore Boards
          </button>
        </div>
      </div>
    </Template>
  );
}
