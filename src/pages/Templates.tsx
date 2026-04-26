import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadMedia, MEDIA_FOLDERS } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormBuilder, { FormStep } from "@/components/dashboard/FormBuilder";
import {
  Plus, Search, Crown, Edit2, Trash2, X, Check, Zap,
  Settings2, RefreshCw, IndianRupee, Upload, Layers,
  Globe, Layout, Tag, Box, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "image";
  placeholder: string;
  required: boolean;
  options?: string[];
  multiple?: boolean;
  maxSizeMB?: number;
  description?: string;
}

interface StripePrice {
  id: string;
  nickname: string;
  amount: number;
  currency: string;
}

interface Template {
  id: string;
  name: string;
  template_name: string;
  description: string;
  type: "free" | "premium";
  component_key: string;
  thumbnail_url: string;
  form_fields: FormField[] | FormStep[];
  price: number;
  price_amount: number;
  real_price: number;
  currency: string;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  category_id?: string;
  category_name?: string;
  sub_category_id?: string;
  sub_category_name?: string;
  price_id?: string | null;
  price_nickname?: string;
  is_active: boolean;
  tags: string[];
}

interface TemplatesResponse {
  rows: Template[];
  total: number;
}

const COMMON_TAGS = [
  "Birthday", "Wedding", "Anniversary", "Valentine", "Father's Day",
  "Mother's Day", "Christmas", "New Year", "Party", "Corporate",
  "Minimal", "Colorful", "Modern", "Classic", "Premium"
];

const Templates = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "premium">("all");
  const [editingFields, setEditingFields] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add template form state
  const [newName, setNewName] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newThumbnailUrl, setNewThumbnailUrl] = useState("");
  const [newType, setNewType] = useState<"free" | "premium">("free");
  const [newComponentName, setNewComponentName] = useState("");
  const [newFields, setNewFields] = useState<FormStep[]>([
    {
      id: `step_1`,
      title: "Step 1",
      fields: [{ name: "name", label: "Name", type: "text", placeholder: "Enter name", required: true }]
    }
  ]);
  const [newPriceId, setNewPriceId] = useState<string>("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  // Holds the selected File locally — S3 upload deferred until Deploy
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>("");

  const { data, isLoading } = useQuery<TemplatesResponse>({
    queryKey: ["adminTemplates", search],
    queryFn: () => fetchApi(`/templates?search=${encodeURIComponent(search)}`),
  });

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchApi("/categories"),
  });

  const { data: subCategoriesData } = useQuery({
    queryKey: ["sub-categories"],
    queryFn: () => fetchApi("/sub-categories"),
  });

  const { data: pricesData } = useQuery<StripePrice[]>({
    queryKey: ["stripePrices"],
    queryFn: () => fetchApi("/stripe/prices"),
  });

  const templates = data?.rows || [];

  const filtered = templates.filter(t => {
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesType;
  });

  // Store file locally; actual S3 upload happens on Deploy
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke previous object URL to avoid memory leaks
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    const preview = URL.createObjectURL(file);
    setPendingThumbnailFile(file);
    setLocalPreviewUrl(preview);
    // Clear any previously saved CDN URL so preview shows the new file
    setNewThumbnailUrl("");
    // Reset file input so same file can be re-selected if needed
    e.target.value = "";
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => fetchApi(`/templates/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      toast.success("Template deleted successfully");
    },
    onError: () => toast.error("Failed to delete template"),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error("Failed to delete template");
      } else {
        queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
        toast.success("Template deleted successfully");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => fetchApi(`/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      toast.success("Template updated successfully");
      resetAddForm();
    },
    onError: (e: any) => toast.error(e.message || "Failed to update template")
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => fetchApi(`/templates`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      toast.success("Template created successfully");
      resetAddForm();
    },
    onError: (e: any) => toast.error(e.message || "Failed to create template")
  });

  const deleteTemplate = (id: string) => {
    if (window.confirm("Are you sure you want to decommission this template design unit? This action cannot be reversed.")) {
      deleteMutation.mutate(id);
    }
  };

  const resetAddForm = () => {
    setNewName("");
    setNewTemplateName("");
    setNewDescription("");
    setNewType("free");
    setNewComponentName("");
    setNewPriceId("");
    setNewTags([]);
    setTagInput("");
    setNewIsActive(true);
    setNewFields([
      {
        id: `step_${Date.now()}`,
        title: "Step 1",
        fields: [{ name: "name", label: "Name", type: "text", placeholder: "Enter name", required: true }]
      }
    ]);
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setNewThumbnailUrl("");
    // Clear pending file + revoke local preview
    setPendingThumbnailFile(null);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl("");
    setShowAddForm(false);
    setEditingId(null);
  };

  const toggleTag = (tag: string) => {
    setNewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (!newTags.includes(tag)) {
        setNewTags([...newTags, tag]);
      }
      setTagInput("");
    }
  };

  const submitTemplate = async () => {
    if (!newName.trim() || !newComponentName.trim() || !selectedSubCategoryId) {
      toast.error("Please fill required fields (Name, Component, Subcategory)");
      return;
    }

    let thumbnailUrl = newThumbnailUrl.trim();

    // Upload to S3 now (only on Deploy/Save)
    if (pendingThumbnailFile) {
      setIsUploading(true);
      try {
        thumbnailUrl = await uploadMedia(pendingThumbnailFile, MEDIA_FOLDERS.TEMPLATES);
        setNewThumbnailUrl(thumbnailUrl);
        setPendingThumbnailFile(null);
      } catch (err: any) {
        toast.error(err?.message || "Thumbnail upload failed");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const payload = {
      name: newName.trim(),
      templateName: newTemplateName.trim(),
      description: newDescription.trim(),
      thumbnailUrl,
      slug: newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      type: newType,
      componentKey: newComponentName.trim(),
      formFields: newFields,
      subCategoryId: selectedSubCategoryId,
      priceId: newPriceId || null,
      isActive: newIsActive,
      tags: newTags
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (template: Template) => {
    setEditingId(template.id);
    setNewName(template.name);
    setNewTemplateName(template.template_name || "");
    setNewDescription(template.description || "");
    setNewType(template.type);
    setNewComponentName(template.component_key);
    let fieldsToEdit = template.form_fields || [];
    if (fieldsToEdit.length > 0 && !('fields' in fieldsToEdit[0])) {
      fieldsToEdit = [{
        id: 'step_1',
        title: 'Step 1',
        fields: fieldsToEdit as any
      }];
    } else if (fieldsToEdit.length === 0) {
      fieldsToEdit = [{
        id: `step_${Date.now()}`,
        title: "Step 1",
        fields: []
      }];
    }
    setNewFields(fieldsToEdit);
    setNewThumbnailUrl(template.thumbnail_url || "");
    setNewPriceId(template.price_id || "");
    setNewTags(template.tags || []);
    setNewIsActive(template.is_active);
    setSelectedCategoryId(template.category_id || "");
    setSelectedSubCategoryId(template.sub_category_id || "");
    setShowAddForm(true);
  };

  const toggleTemplateActive = (template: Template) => {
    updateMutation.mutate({
      id: template.id,
      payload: { isActive: !template.is_active }
    });
  };

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData.data || []);
    }
  }, [categoryData]);

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Layout className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Catalog Control</p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Wish Templates</h1>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl btn-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> Add Design Template
          </button>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
              onClick={(e) => e.target === e.currentTarget && resetAddForm()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
              >
                {/* ── Sticky Header ── */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-800 leading-tight">{editingId ? 'Edit Template' : 'New Template'}</h2>
                      <p className="text-[11px] text-slate-400">{editingId ? 'Update configuration below' : 'Fill in details to deploy a new design'}</p>
                    </div>
                  </div>
                  <button onClick={resetAddForm} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* ── Two-Column Body ── */}
                <div className="flex flex-col lg:flex-row flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                  {/* LEFT — Core config */}
                  <div className="lg:w-[52%] overflow-y-auto custom-scrollbar p-7 space-y-5">

                    {/* Tags Multi-select */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Tags (Select or type & enter)
                      </label>
                      <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-h-[50px]">
                        {newTags.map(tag => (
                          <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg">
                            {tag}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTag(tag)} />
                          </Badge>
                        ))}
                        <input
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={addCustomTag}
                          placeholder={newTags.length === 0 ? "Add tags..." : ""}
                          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-600 min-w-[100px] placeholder:text-slate-300"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 overflow-x-auto pb-1 max-h-[80px]">
                        {COMMON_TAGS.filter(t => !newTags.includes(t)).map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name + Template Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Template Name</label>
                        <input
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="e.g. birthday-pro"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all placeholder:font-normal placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Display Label</label>
                        <input
                          value={newTemplateName}
                          onChange={e => setNewTemplateName(e.target.value)}
                          placeholder="e.g. Birthday Blast"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all placeholder:font-normal placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                      <textarea
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder="Brief description of this template..."
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all resize-none placeholder:text-slate-300"
                      />
                    </div>

                    {/* Category + Subcategory */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                        <Select value={selectedCategoryId} onValueChange={(v) => { setSelectedCategoryId(v); setSelectedSubCategoryId(""); }}>
                          <SelectTrigger className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium text-slate-700 outline-none">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            {categories.map(c => <SelectItem key={c.id} value={c.id} className="text-sm">{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subcategory</label>
                        <Select value={selectedSubCategoryId} onValueChange={setSelectedSubCategoryId} disabled={!selectedCategoryId}>
                          <SelectTrigger className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium text-slate-700 outline-none">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            {subCategoriesData?.data?.filter((sc: any) => sc.category_id === selectedCategoryId).map((sc: any) => (
                              <SelectItem key={sc.id} value={sc.id} className="text-sm">{sc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Component Key + Access Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Component Key</label>
                        <input
                          value={newComponentName}
                          onChange={e => setNewComponentName(e.target.value)}
                          placeholder="e.g. BirthdayClassic"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-500 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-all placeholder:font-normal placeholder:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Type</label>
                        <div className="flex h-10 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                          {(["free", "premium"] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setNewType(type)}
                              className={`flex-1 rounded-lg text-xs font-bold uppercase transition-all ${newType === type ? "bg-white text-primary shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stripe Pricing Link (premium only) */}
                    {newType === "premium" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stripe Price Link</label>
                        <Select value={newPriceId} onValueChange={setNewPriceId}>
                          <SelectTrigger className="w-full h-10 px-3.5 rounded-xl bg-primary/5 border-primary/20 text-sm font-medium text-slate-700 outline-none">
                            <SelectValue placeholder="Select a managed price point" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                            <SelectItem value="none" className="text-sm text-slate-400 italic">No linked price</SelectItem>
                            {pricesData?.map(p => (
                              <SelectItem key={p.id} value={p.id} className="text-sm">
                                {p.nickname} — {p.currency.toUpperCase()} {p.amount / 100}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-primary/60 italic pl-1">Multi-currency rates are auto-generated from the linked price.</p>
                      </div>
                    )}

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Public Visibility</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Show this template on the marketplace</p>
                      </div>
                      <Switch checked={newIsActive} onCheckedChange={setNewIsActive} />
                    </div>
                  </div>

                  {/* RIGHT — Thumbnail + Form Fields */}
                  <div className="lg:flex-1 overflow-y-auto custom-scrollbar p-7 space-y-6 bg-slate-50/50">

                    {/* Thumbnail */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cover Thumbnail</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative cursor-pointer rounded-xl overflow-hidden bg-white border-2 border-dashed border-slate-200 hover:border-primary/40 transition-all flex items-center justify-center"
                        style={{ height: '160px' }}
                      >
                        {/* Show local preview (pending file) or existing CDN URL */}
                        {(localPreviewUrl || newThumbnailUrl) ? (
                          <>
                            <img src={localPreviewUrl || newThumbnailUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Preview" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-sm">
                              <Upload className="w-6 h-6 mb-1" />
                              <span className="text-xs font-bold">Replace Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                              <Upload className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500">Click to upload</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                      </div>
                    </div>

                    {/* Form Builder */}
                    <FormBuilder steps={newFields} onChange={setNewFields} />
                  </div>
                </div>

                {/* ── Sticky Footer ── */}
                <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-white flex-shrink-0">
                  <p className="text-[11px] text-slate-400">
                    {newFields.length} form step{newFields.length !== 1 ? 's' : ''} configured
                  </p>
                  <div className="flex gap-3">
                    <button onClick={resetAddForm} className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                      Cancel
                    </button>
                    <button
                      onClick={submitTemplate}
                      disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                      className="px-7 py-2 rounded-lg btn-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
                      ) : createMutation.isPending || updateMutation.isPending ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : editingId ? (
                        <><Check className="w-4 h-4" /> Save Changes</>
                      ) : (
                        <><Zap className="w-4 h-4" /> Deploy Template</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Statistics */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
            />
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {(["all", "free", "premium"] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === type
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`group bg-white rounded-xl overflow-hidden border border-slate-200 transition-all hover:shadow-xl hover:border-primary/20 ${!template.is_active ? 'grayscale opacity-60' : ''}`}
            >
              {/* Thumbnail */}
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                <img src={template.thumbnail_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={template.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    {template.type === "premium" && (
                      <div className="bg-amber-400 text-black px-2 py-0.5 rounded-md text-[8px] font-bold uppercase flex items-center w-fit">
                        <Crown className="w-2.5 h-2.5 mr-1" /> Premium
                      </div>
                    )}
                    <div className="bg-slate-900/60 text-white backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] font-bold uppercase w-fit">
                      {template.sub_category_name || "Misc"}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <button onClick={() => startEdit(template)} className="p-2 rounded-lg bg-white shadow-lg text-slate-800 hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTemplate(template.id)} className="p-2 rounded-lg bg-white shadow-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all scale-90 group-hover:scale-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate leading-tight mb-1">{template.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{template.template_name}</p>
                  </div>
                  <Switch
                    className="scale-75 origin-right"
                    checked={template.is_active}
                    onCheckedChange={() => toggleTemplateActive(template)}
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1">
                      {(template.tags || []).slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold border border-slate-200">
                          {tag}
                        </span>
                      ))}
                      {template.tags?.length > 2 && <span className="text-[8px] text-slate-300">+{template.tags.length - 2}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {template.type === "premium" ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-amber-600 leading-none">
                          {template.currency?.toUpperCase()} {template.real_price}
                        </span>
                        <span className="text-[7px] text-slate-300 font-bold uppercase tracking-tighter">
                          {template.price_nickname || "Managed"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Free</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && !isLoading && (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-100 rounded-[4rem] opacity-40 grayscale">
            <Box className="w-16 h-16 text-slate-200 mb-6" />
            <h3 className="section-header text-2xl">Vault Empty</h3>
            <p className="text-sm font-bold text-slate-400 max-w-sm text-center mt-3 uppercase tracking-widest italic leaging-relaxed">Deploy your first design template to start populating your catalog.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Templates;
