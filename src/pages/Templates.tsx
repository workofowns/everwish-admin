import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FieldBuilder from "@/components/dashboard/FieldBuilder";
import { Plus, Search, Crown, Edit2, Trash2, X, Check, Settings2 } from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  placeholder: string;
  required: boolean;
  options?: string[];
}

interface Template {
  id: string;
  name: string;
  templeName: string;
  type: "free" | "premium";
  componentName: string;
  thumbnail: string;
  formFields: FormField[];
}

const initialTemplates: Template[] = [
  {
    id: "1", name: "Golden Birthday", templeName: "Tirupati Balaji", type: "premium",
    componentName: "GoldenBirthdayTemplate", thumbnail: "",
    formFields: [
      { name: "recipientName", label: "Recipient's Name", type: "text", placeholder: "Enter name", required: true },
      { name: "message", label: "Blessing Message", type: "textarea", placeholder: "Write your blessing...", required: true },
      { name: "date", label: "Date of Birth", type: "date", placeholder: "", required: false },
    ],
  },
  {
    id: "2", name: "Divine Wedding", templeName: "Meenakshi Temple", type: "premium",
    componentName: "DivineWeddingTemplate", thumbnail: "",
    formFields: [
      { name: "brideName", label: "Bride's Name", type: "text", placeholder: "Enter bride's name", required: true },
      { name: "groomName", label: "Groom's Name", type: "text", placeholder: "Enter groom's name", required: true },
      { name: "weddingDate", label: "Wedding Date", type: "date", placeholder: "", required: true },
    ],
  },
  {
    id: "3", name: "Diwali Sparkle", templeName: "Kashi Vishwanath", type: "free",
    componentName: "DiwaliSparkleTemplate", thumbnail: "",
    formFields: [
      { name: "senderName", label: "Your Name", type: "text", placeholder: "Your name", required: true },
      { name: "greeting", label: "Greeting", type: "select", placeholder: "", required: true, options: ["Happy Diwali!", "Shubh Deepavali!", "Festival of Lights"] },
    ],
  },
  {
    id: "4", name: "Simple Blessing", templeName: "Somnath Temple", type: "free",
    componentName: "SimpleBlessingTemplate", thumbnail: "",
    formFields: [
      { name: "name", label: "Name", type: "text", placeholder: "Enter name", required: true },
    ],
  },
];

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "premium">("all");
  const [editingFields, setEditingFields] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add template form state
  const [newName, setNewName] = useState("");
  const [newTempleName, setNewTempleName] = useState("");
  const [newType, setNewType] = useState<"free" | "premium">("free");
  const [newComponentName, setNewComponentName] = useState("");
  const [newFields, setNewFields] = useState<FormField[]>([
    { name: "name", label: "Name", type: "text", placeholder: "Enter name", required: true },
  ]);

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.templeName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const updateFields = (templateId: string, fields: FormField[]) => {
    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, formFields: fields } : t));
  };

  const deleteTemplate = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id));

  const resetAddForm = () => {
    setNewName("");
    setNewTempleName("");
    setNewType("free");
    setNewComponentName("");
    setNewFields([{ name: "name", label: "Name", type: "text", placeholder: "Enter name", required: true }]);
    setShowAddForm(false);
  };

  const addTemplate = () => {
    if (!newName.trim() || !newTempleName.trim() || !newComponentName.trim()) return;
    const template: Template = {
      id: Date.now().toString(),
      name: newName.trim(),
      templeName: newTempleName.trim(),
      type: newType,
      componentName: newComponentName.trim(),
      thumbnail: "",
      formFields: newFields,
    };
    setTemplates(prev => [template, ...prev]);
    resetAddForm();
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="sub-label mb-1">Template Management</p>
            <h1 className="section-header text-3xl">Templates</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Template
          </button>
        </div>

        {/* Add Template Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
              onClick={(e) => e.target === e.currentTarget && resetAddForm()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-[2rem] shadow-2xl border border-border p-8 mx-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground">New Template</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Create a new wish template with custom fields</p>
                  </div>
                  <button onClick={resetAddForm} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Template Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Template Name</label>
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g., Golden Birthday"
                      className="w-full px-4 py-3 rounded-xl bg-muted text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Temple Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Temple Name</label>
                    <input
                      value={newTempleName}
                      onChange={e => setNewTempleName(e.target.value)}
                      placeholder="e.g., Tirupati Balaji"
                      className="w-full px-4 py-3 rounded-xl bg-muted text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Row: Type + Component Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Type</label>
                      <div className="flex gap-2">
                        {(["free", "premium"] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setNewType(type)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                              newType === type
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted border border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {type === "premium" && <Crown className="w-3.5 h-3.5 inline mr-1" />}
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Component Name</label>
                      <input
                        value={newComponentName}
                        onChange={e => setNewComponentName(e.target.value)}
                        placeholder="e.g., GoldenBirthdayTemplate"
                        className="w-full px-4 py-3 rounded-xl bg-muted text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/50 pt-5">
                    <h3 className="text-sm font-bold text-foreground mb-3">Form Fields</h3>
                    <FieldBuilder fields={newFields} onChange={setNewFields} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-border/50">
                  <button
                    onClick={resetAddForm}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTemplate}
                    disabled={!newName.trim() || !newTempleName.trim() || !newComponentName.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" /> Create Template
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(["all", "free", "premium"] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                filterType === type
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="h-36 gradient-accent relative flex items-center justify-center">
                <span className="text-4xl opacity-60">🕉️</span>
                {template.type === "premium" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Crown className="w-3 h-3" /> Premium
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-foreground text-base">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{template.templeName}</p>
                <p className="text-[10px] font-mono text-muted-foreground/70 mt-1 bg-muted px-2 py-0.5 rounded inline-block">
                  {template.componentName}
                </p>

                {/* Fields summary */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {template.formFields.length} fields
                  </span>
                  {template.formFields.slice(0, 3).map(f => (
                    <span key={f.name} className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                      {f.label}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  <button
                    onClick={() => setEditingFields(editingFields === template.id ? null : template.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Fields
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteTemplate(template.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Field Builder */}
              <AnimatePresence>
                {editingFields === template.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-border/50"
                  >
                    <div className="p-5">
                      <FieldBuilder
                        fields={template.formFields}
                        onChange={(fields) => updateFields(template.id, fields)}
                      />
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

export default Templates;
