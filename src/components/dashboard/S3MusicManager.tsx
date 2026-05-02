import { Music } from "lucide-react";

const S3MusicManager = () => {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-white/30 rounded-[4rem] border-4 border-dashed border-white shadow-inner">
      <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
        <Music className="w-10 h-10 text-slate-200" />
      </div>
      <h3 className="text-3xl font-black text-slate-800 uppercase tracking-[0.2em] mb-2">Music Library</h3>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm text-center leading-relaxed">Music management module coming soon.</p>
    </div>
  );
};

export default S3MusicManager;
