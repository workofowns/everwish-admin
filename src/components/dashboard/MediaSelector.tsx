import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { 
  X, Search, Folder, Image as ImageIcon, 
  ChevronRight, RefreshCw, Check, HardDrive, Filter
} from "lucide-react";
import { format } from "date-fns";

interface MediaObject {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

interface MediaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

const MediaSelector = ({ isOpen, onClose, onSelect, title = "Select from S3 Vault" }: MediaSelectorProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("templates");
  const [search, setSearch] = useState("");

  const { data: folders, isLoading: loadingFolders } = useQuery<string[]>({
    queryKey: ["adminMediaFolders"],
    queryFn: () => fetchApi("/media/folders"),
    enabled: isOpen
  });

  const { data: objects, isLoading: loadingObjects } = useQuery<MediaObject[]>({
    queryKey: ["adminMedia", selectedFolder],
    queryFn: () => fetchApi(`/media?folder=${selectedFolder}`),
    enabled: isOpen
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filtered = (objects || []).filter(obj => 
    obj.key.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <HardDrive className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Browse and select existing cloud assets</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar: Folders */}
            <div className="w-64 border-r border-slate-100 bg-slate-50/50 overflow-y-auto p-4 space-y-2">
               <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Storage Nodes</p>
               {loadingFolders ? (
                 <div className="px-3 py-4 space-y-3">
                   {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
                 </div>
               ) : (
                 <>
                   {folders?.map(folder => (
                     <button
                       key={folder}
                       onClick={() => setSelectedFolder(folder)}
                       className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${selectedFolder === folder 
                         ? "bg-white text-primary shadow-lg shadow-primary/5 border border-primary/10 font-bold" 
                         : "text-slate-500 hover:bg-white/60 hover:text-slate-700"}`}
                     >
                       <Folder className={`w-4 h-4 ${selectedFolder === folder ? "fill-primary/20" : "text-slate-300"}`} />
                       <span className="text-[11px] uppercase tracking-wider">{folder}</span>
                       {selectedFolder === folder && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                     </button>
                   ))}
                 </>
               )}
            </div>

            {/* Main Content: Objects */}
            <div className="flex-1 flex flex-col bg-white">
               {/* Search Bar */}
               <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search assets in this folder..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400">
                    <Filter className="w-3 h-3" />
                    <span>{filtered.length} Objects</span>
                  </div>
               </div>

               {/* Grid */}
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {loadingObjects ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Inventorying Folder...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
                        <ImageIcon className="w-8 h-8 text-slate-200" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">No Assets Found</h3>
                      <p className="text-xs text-slate-400 mt-2 max-w-xs">Try selecting a different storage node or adjusting your search criteria.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {filtered.map((obj) => (
                        <motion.div
                          key={obj.key}
                          whileHover={{ y: -4 }}
                          onClick={() => onSelect(obj.url)}
                          className="group cursor-pointer space-y-3"
                        >
                          <div className="aspect-square relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:border-primary/50 group-hover:ring-4 group-hover:ring-primary/5 transition-all duration-500">
                             <img src={obj.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                             
                             {/* Hover Action Badge */}
                             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-100 flex items-center gap-1.5">
                                   <Check className="w-3 h-3 text-primary" />
                                   <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight">Select</span>
                                </div>
                             </div>

                             {/* Bottom Info Overlay (Subtle) */}
                             <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[8px] font-bold text-white uppercase tracking-widest">{formatSize(obj.size)}</p>
                             </div>

                             <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase border border-white/10 group-hover:opacity-0 transition-opacity">
                                {formatSize(obj.size)}
                             </div>
                          </div>
                          <div className="px-1">
                             <p className="text-[10px] font-bold text-slate-700 truncate" title={obj.key}>{obj.key.split('/').pop()}</p>
                             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                                {format(new Date(obj.lastModified), "MMM dd, yyyy")}
                             </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaSelector;
