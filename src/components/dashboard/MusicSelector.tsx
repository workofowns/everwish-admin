// Refactored MusicSelector using shared Modal component
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { X, Search, Music as MusicIcon, RefreshCw, Check, Play, Pause } from "lucide-react";

interface Music {
  id: number;
  name: string;
  music_url: string;
  thumbnail_url: string | null;
  duration: number;
  category: string | null;
}

interface MusicSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (music: Music) => void;
  title?: string;
}

const MusicSelector = ({ isOpen, onClose, onSelect, title = "Select Background Music" }: MusicSelectorProps) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audio] = useState<HTMLAudioElement | null>(typeof Audio !== "undefined" ? new Audio() : null);

  const { data, isLoading } = useQuery<{ success: boolean; music: Music[] }>(
    {
      queryKey: ["adminMusicList"],
      queryFn: () => fetchApi("/music"),
      enabled: isOpen,
    }
  );

  const { data: categoriesData } = useQuery<{ success: boolean; categories: string[] }>(
    {
      queryKey: ["adminMusicCategories"],
      queryFn: () => fetchApi("/music/categories"),
      enabled: isOpen,
    }
  );

  const handlePlay = (m: Music) => {
    if (!audio) return;
    if (playingId === m.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = m.music_url;
      audio.play();
      setPlayingId(m.id);
    }
  };

  const musicList = data?.music || [];
  const categories = ["all", ...(categoriesData?.categories || [])];
  const filtered = musicList.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl flex flex-col border border-slate-200 overflow-hidden max-h-[90vh]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <MusicIcon className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Choose a default track for this template
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-slate-50 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search music..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-100"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Tuning Inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <MusicIcon className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Silence...</h3>
            <p className="text-xs text-slate-400 mt-2">No music found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="group relative flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MusicIcon className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <button
                    onClick={() => handlePlay(m)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {playingId === m.id ? (
                      <Pause className="w-6 h-6 text-white fill-current" />
                    ) : (
                      <Play className="w-6 h-6 text-white fill-current" />
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-700 truncate">{m.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[8px] font-black uppercase tracking-tighter text-slate-500">
                      {m.category || "Uncategorized"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {Math.floor(m.duration / 60)}:{(m.duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onSelect(m)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>

  );
};

export default MusicSelector;
