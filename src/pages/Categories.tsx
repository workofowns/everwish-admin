import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Plus, ChevronRight, Edit2, Trash2, FolderOpen, X, Check, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  icon: string;
  image_url?: string;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url?: string;
  sort_order: number;
}

const Categories = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");
  const [newCatImageUrl, setNewCatImageUrl] = useState("");

  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [newSubIcon, setNewSubIcon] = useState("📄");
  const [newSubImageUrl, setNewSubImageUrl] = useState("");

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatData, setEditCatData] = useState({ name: "", slug: "", icon: "", imageUrl: "" });

  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubData, setEditSubData] = useState({ name: "", slug: "", icon: "", imageUrl: "" });

  const { data: catsRes } = useQuery({ queryKey: ["adminCategories"], queryFn: () => fetchApi("/categories") });
  const { data: subsRes } = useQuery({ queryKey: ["adminSubCategories"], queryFn: () => fetchApi("/sub-categories") });

  const catsData = catsRes?.data || [];
  const subsData = subsRes?.data || [];

  const categories = catsData.map((c: Category) => ({
    ...c,
    color: "#A37FF6",
    subcategories: subsData.filter((sc: SubCategory) => sc.category_id === c.id).map((sc: SubCategory) => ({
      ...sc,
      color: "#FF8BC4"
    }))
  }));

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("context", "assets");
    formData.append("file", file);

    // The media API is NOT under /admin, so we need to construct the URL manually
    const baseUrl = API_BASE_URL.replace("/admin", "");
    const token = localStorage.getItem("adminToken");

    const res = await fetch(`${baseUrl}/media/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'newCat' | 'editCat' | 'newSub' | 'editSub') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const promise = uploadFile(file);
    toast.promise(promise, {
      loading: "Uploading image...",
      success: (data) => {
        if (type === 'newCat') setNewCatImageUrl(data.url);
        if (type === 'editCat') setEditCatData({ ...editCatData, imageUrl: data.url });
        if (type === 'newSub') setNewSubImageUrl(data.url);
        if (type === 'editSub') setEditSubData({ ...editSubData, imageUrl: data.url });
        return "Image uploaded";
      },
      error: "Upload failed"
    });
  };

  const createCatMutation = useMutation({
    mutationFn: (payload: any) => fetchApi("/categories", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category added");
      setNewCatName(""); setNewCatSlug(""); setNewCatIcon("📁"); setNewCatImageUrl(""); setShowAddCategory(false);
    }
  });

  const createSubCatMutation = useMutation({
    mutationFn: (payload: any) => fetchApi("/sub-categories", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubCategories"] });
      toast.success("Subcategory added");
      setNewSubName(""); setNewSubSlug(""); setNewSubIcon("📄"); setNewSubImageUrl(""); setAddingSubTo(null);
    }
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => fetchApi(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category updated");
      setEditingCatId(null);
    }
  });

  const updateSubCatMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => fetchApi(`/sub-categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubCategories"] });
      toast.success("Subcategory updated");
      setEditingSubId(null);
    }
  });

  const delCatMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminCategories"] })
  });

  const delSubCatMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/sub-categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminSubCategories"] })
  });

  const addCategory = () => {
    if (!newCatName.trim()) return;
    createCatMutation.mutate({
      name: newCatName,
      slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, "-"),
      icon: newCatIcon,
      imageUrl: newCatImageUrl
    });
  };

  const addSubcategory = (catId: string) => {
    if (!newSubName.trim()) return;
    createSubCatMutation.mutate({
      categoryId: catId,
      name: newSubName,
      slug: newSubSlug || newSubName.toLowerCase().replace(/\s+/g, "-"),
      icon: newSubIcon,
      imageUrl: newSubImageUrl
    });
  };

  const startEditCategory = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setEditCatData({ name: cat.name, slug: cat.slug, icon: cat.icon || "📁", imageUrl: cat.image_url || "" });
    setEditingCatId(cat.id);
  };

  const saveEditCategory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editCatData.name.trim()) return;
    updateCatMutation.mutate({ id, data: editCatData });
  };

  const startEditSubcategory = (e: React.MouseEvent, sub: SubCategory) => {
    e.stopPropagation();
    setEditSubData({ name: sub.name, slug: sub.slug, icon: sub.icon || "📄", imageUrl: sub.image_url || "" });
    setEditingSubId(sub.id);
  };

  const saveEditSubcategory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editSubData.name.trim()) return;
    updateSubCatMutation.mutate({ id, data: editSubData });
  };

  const deleteCategory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure?")) delCatMutation.mutate(id);
  }
  const deleteSubcategory = (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure?")) delSubCatMutation.mutate(subId);
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="sub-label mb-1">Content Management</p>
            <h1 className="section-header text-3xl">Categories</h1>
          </div>
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Add Category Form */}
        <AnimatePresence>
          {showAddCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-5 mb-5 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} title="Icon" className="w-12 h-12 text-center text-2xl rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/30" placeholder="📁" />

                  <div className="relative group w-12 h-12 flex items-center justify-center rounded-xl bg-muted border border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                    {newCatImageUrl ? (
                      <img src={newCatImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                    <input type="file" onChange={(e) => handleFileChange(e, 'newCat')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div className="flex-1 flex gap-3 min-w-[300px]">
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none" />
                  <input value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} placeholder="slug (auto)" className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-xs text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>

                <div className="flex gap-2">
                  <button onClick={addCategory} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"><Check className="w-5 h-5" /></button>
                  <button onClick={() => setShowAddCategory(false)} className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category List */}
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-[1.3rem] overflow-hidden border border-border/50"
            >
              {/* Category Header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              >
                {editingCatId === cat.id ? (
                  <div className="flex-1 flex flex-wrap items-center gap-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <input value={editCatData.icon} onChange={e => setEditCatData({ ...editCatData, icon: e.target.value })} className="w-11 h-11 text-center text-xl rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/30" />
                      <div className="relative group w-11 h-11 flex items-center justify-center rounded-xl bg-muted border border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer overflow-hidden">
                        {editCatData.imageUrl ? (
                          <img src={editCatData.imageUrl} alt="Edit" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        )}
                        <input type="file" onChange={(e) => handleFileChange(e, 'editCat')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <div className="flex-1 flex gap-3 min-w-[200px]">
                      <input value={editCatData.name} onChange={e => setEditCatData({ ...editCatData, name: e.target.value })} placeholder="Name" className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-sm font-medium outline-none" />
                      <input value={editCatData.slug} onChange={e => setEditCatData({ ...editCatData, slug: e.target.value })} placeholder="Slug" className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-xs outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => saveEditCategory(e, cat.id)} className="p-2.5 rounded-xl bg-primary text-primary-foreground"><Check className="w-5 h-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingCatId(null); }} className="p-2.5 rounded-xl bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner overflow-hidden" style={{ backgroundColor: cat.color + "15" }}>
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="relative z-10">{cat.icon}</span>
                        )}
                      </div>
                      {cat.image_url && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-[10px] shadow-sm z-20">
                          {cat.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-foreground text-lg">{cat.name}</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">/{cat.slug}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-muted/50 border border-border flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase">{cat.subcategories.length} Entities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => startEditCategory(e, cat)} className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => deleteCategory(e, cat.id)} className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`p-2 rounded-xl bg-muted/20 transition-transform ${expandedId === cat.id ? "rotate-90 bg-primary/10 text-primary" : ""}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </div>

              {/* Subcategories Container */}
              <AnimatePresence>
                {expandedId === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border/30 bg-muted/5"
                  >
                    <div className="p-6 pl-12 space-y-3">
                      {cat.subcategories.map(sub => (
                        <div key={sub.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                          {editingSubId === sub.id ? (
                            <div className="flex-1 flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <input value={editSubData.icon} onChange={e => setEditSubData({ ...editSubData, icon: e.target.value })} className="w-10 h-10 text-center text-lg rounded-xl bg-muted border-0" />
                                <div className="relative group w-10 h-10 flex items-center justify-center rounded-xl bg-muted border border-dashed border-muted-foreground/30 overflow-hidden">
                                  {editSubData.imageUrl ? (
                                    <img src={editSubData.imageUrl} alt="Sub" className="w-full h-full object-cover" />
                                  ) : (
                                    <Upload className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <input type="file" onChange={(e) => handleFileChange(e, 'editSub')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                              </div>
                              <div className="flex-1 flex gap-2 min-w-[200px]">
                                <input value={editSubData.name} onChange={e => setEditSubData({ ...editSubData, name: e.target.value })} placeholder="Name" className="flex-1 px-4 py-2 rounded-xl bg-muted text-sm outline-none" />
                                <input value={editSubData.slug} onChange={e => setEditSubData({ ...editSubData, slug: e.target.value })} placeholder="Slug" className="flex-1 px-4 py-2 rounded-xl bg-muted text-xs outline-none" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={(e) => saveEditSubcategory(e, sub.id)} className="p-2 rounded-xl bg-primary text-primary-foreground"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditingSubId(null)} className="p-2 rounded-xl bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center relative overflow-hidden ring-1 ring-border/50">
                                {sub.image_url ? (
                                  <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-lg">{sub.icon}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-black text-foreground">{sub.name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest mt-0.5">/{sub.slug}</p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => startEditSubcategory(e, sub)} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => deleteSubcategory(e, sub.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      {/* Add Subcategory Row */}
                      <div className="pt-2">
                        {addingSubTo === cat.id ? (
                          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-dashed border-primary/30">
                            <div className="flex items-center gap-2">
                              <input value={newSubIcon} onChange={e => setNewSubIcon(e.target.value)} placeholder="Icon" className="w-10 h-10 text-center rounded-xl bg-white text-lg outline-none border border-border" />
                              <div className="relative group w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                                {newSubImageUrl ? (
                                  <img src={newSubImageUrl} alt="Sub" className="w-full h-full object-cover" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                                <input type="file" onChange={(e) => handleFileChange(e, 'newSub')} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                            <div className="flex-1 flex gap-2 min-w-[200px]">
                              <input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Subcategory name" className="flex-1 px-4 py-2 rounded-xl bg-white text-sm outline-none border border-border" />
                              <input value={newSubSlug} onChange={e => setNewSubSlug(e.target.value)} placeholder="slug" className="flex-1 px-4 py-2 rounded-xl bg-white text-xs outline-none border border-border" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => addSubcategory(cat.id)} className="p-2 rounded-xl bg-primary text-primary-foreground"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setAddingSubTo(null)} className="p-2 rounded-xl bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingSubTo(cat.id)}
                            className="flex items-center gap-2 text-xs font-black text-primary hover:bg-primary/5 px-4 py-3 rounded-xl border border-primary/20 border-dashed transition-all"
                          >
                            <Plus className="w-4 h-4" /> ADD SUB-ENTITY
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Categories;
