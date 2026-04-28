import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Search, Trash2, Filter, Image as ImageIcon, 
  ExternalLink, Download, Clock, Database, HardDrive,
  RefreshCw, X, Check, AlertTriangle, Layers
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface MediaObject {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

const Media = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<"all" | "small" | "medium" | "large">("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "size_desc" | "size_asc">("date_desc");

  const { data: objects, isLoading } = useQuery<MediaObject[]>({
    queryKey: ["media", selectedFolder],
    queryFn: () => fetchApi(`/media?folder=${selectedFolder === "all" ? "" : selectedFolder}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => fetchApi(`/media?key=${encodeURIComponent(key)}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Image deleted from S3");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete image")
  });

  const handleDelete = (key: string) => {
    if (window.confirm("Are you sure you want to delete this image? This will delete it permanently from AWS S3.")) {
      deleteMutation.mutate(key);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const folders = [
    { id: "all", label: "All Assets" },
    { id: "categories", label: "Categories" },
    { id: "sub-categories", label: "Sub-Categories" },
    { id: "templates", label: "Templates" },
    { id: "wishes", label: "Wishes" },
    { id: "users", label: "User Content" },
  ];

  const filtered = (objects || [])
    .filter(obj => {
      const matchesSearch = obj.key.toLowerCase().includes(search.toLowerCase());
      
      let matchesSize = true;
      if (sizeFilter === "small") matchesSize = obj.size < 102400; // < 100KB
      if (sizeFilter === "medium") matchesSize = obj.size >= 102400 && obj.size < 1048576; // 100KB - 1MB
      if (sizeFilter === "large") matchesSize = obj.size >= 1048576; // > 1MB
      
      return matchesSearch && matchesSize;
    })
    .sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      if (sortBy === "date_asc") return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      if (sortBy === "size_desc") return b.size - a.size;
      if (sortBy === "size_asc") return a.size - b.size;
      return 0;
    });

  const totalSize = (objects || []).reduce((acc, curr) => acc + curr.size, 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-20">
        {/* Header with Glass Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Infrastructure Control</p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cloud Assets</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Objects</p>
                  <p className="text-lg font-black text-slate-900 leading-none">{objects?.length || 0}</p>
                </div>
             </div>
             
             <div className="bg-white/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Storage Used</p>
                  <p className="text-lg font-black text-slate-900 leading-none">{formatSize(totalSize)}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Toolbar: Search + Advanced Filters */}
        <div className="space-y-5 bg-white/40 p-6 rounded-[2.5rem] border border-white shadow-md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by filename, UUID, or key extension..."
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/80 border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
              />
            </div>
            
            <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 overflow-x-auto whitespace-nowrap no-scrollbar max-w-full">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFolder === folder.id 
                    ? "bg-white text-primary shadow-sm border border-slate-200/50" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                >
                  {folder.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "all", label: "All" },
                    { id: "small", label: "<100KB" },
                    { id: "medium", label: "100KB-1MB" },
                    { id: "large", label: ">1MB" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSizeFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${sizeFilter === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-4 w-[1px] bg-slate-200" />

              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none cursor-pointer"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="size_desc">Largest First</option>
                  <option value="size_asc">Smallest First</option>
                </select>
              </div>
            </div>

            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
              Showing {filtered.length} of {objects?.length || 0} Assets
            </p>
          </div>
        </div>

        {isLoading ? (
           <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-primary/5 border-t-primary animate-spin" />
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-primary/10 border-b-primary animate-spin-slow" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing S3 Vault</p>
                <p className="text-[9px] text-slate-300 font-bold uppercase mt-1">Fetching object inventory...</p>
              </div>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
            {filtered.map((obj, i) => (
              <div key={obj.key} className="group flex flex-col transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[4/5] relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:border-primary/20 transition-all duration-500">
                   <img src={obj.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                   
                   {/* Overlay: Actions */}
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[3px] flex items-center justify-center gap-3">
                      <a href={obj.url} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-900 transition-all hover:scale-110 hover:bg-primary hover:text-white shadow-2xl">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button 
                        onClick={() => handleDelete(obj.key)}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-rose-500 transition-all hover:scale-110 hover:bg-rose-500 hover:text-white shadow-2xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>

                   {/* Tags / Metadata on top */}
                   <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                      <div className="px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[8px] font-black text-slate-800 uppercase tracking-widest shadow-sm border border-white">
                        {obj.key.split('/')[0]}
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Download className="w-3.5 h-3.5 text-slate-600" onClick={() => window.open(obj.url)} />
                      </div>
                   </div>

                   {/* Size badge bottom right */}
                   <div className="absolute bottom-5 right-5">
                      <div className="px-2.5 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                        {formatSize(obj.size)}
                      </div>
                   </div>
                </div>

                <div className="mt-4 px-2 space-y-1">
                   <p className="text-[11px] font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors" title={obj.key}>
                      {obj.key.split('/').pop()}
                   </p>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{format(new Date(obj.lastModified), "MMM dd, yyyy")}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span>{obj.key.split('.').pop()?.toUpperCase()}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-white/30 rounded-[4rem] border-4 border-dashed border-white shadow-inner">
             <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
               <ImageIcon className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-3xl font-black text-slate-800 uppercase tracking-[0.2em] mb-2">Vault Empty</h3>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm text-center leading-relaxed">No cloud assets found matching your current filter criteria.</p>
             <button 
               onClick={() => { setSearch(""); setSizeFilter("all"); setSelectedFolder("all"); }}
               className="mt-10 px-8 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
             >
               Clear Filters
             </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Media;
