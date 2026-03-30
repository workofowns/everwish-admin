import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Plus, ChevronRight, Edit2, Trash2, FolderOpen, X, Check } from "lucide-react";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

const initialCategories: Category[] = [
  {
    id: "1", name: "Celebrations", slug: "celebrations", icon: "🎉", color: "#A37FF6",
    subcategories: [
      { id: "1a", name: "Birthday", slug: "birthday", icon: "🎂", color: "#FF8BC4" },
      { id: "1b", name: "Anniversary", slug: "anniversary", icon: "💍", color: "#FF6B9D" },
      { id: "1c", name: "Wedding", slug: "wedding", icon: "💒", color: "#FFD700" },
    ],
  },
  {
    id: "2", name: "Festivals", slug: "festivals", icon: "🪔", color: "#FF8BC4",
    subcategories: [
      { id: "2a", name: "Diwali", slug: "diwali", icon: "🪔", color: "#FFB347" },
      { id: "2b", name: "Holi", slug: "holi", icon: "🎨", color: "#FF6B6B" },
      { id: "2c", name: "Navratri", slug: "navratri", icon: "🙏", color: "#4ECDC4" },
    ],
  },
  {
    id: "3", name: "Blessings", slug: "blessings", icon: "🙏", color: "#431483",
    subcategories: [
      { id: "3a", name: "Daily Prayer", slug: "daily-prayer", icon: "📿", color: "#9B59B6" },
      { id: "3b", name: "New Year", slug: "new-year", icon: "✨", color: "#3498DB" },
    ],
  },
];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories(prev => [...prev, {
      id: Date.now().toString(),
      name: newCatName,
      slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, "-"),
      icon: newCatIcon,
      color: "#A37FF6",
      subcategories: [],
    }]);
    setNewCatName("");
    setNewCatSlug("");
    setNewCatIcon("📁");
    setShowAddCategory(false);
  };

  const addSubcategory = (catId: string) => {
    if (!newSubName.trim()) return;
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? {
        ...cat,
        subcategories: [...cat.subcategories, {
          id: Date.now().toString(),
          name: newSubName,
          slug: newSubSlug || newSubName.toLowerCase().replace(/\s+/g, "-"),
          icon: "📄",
          color: cat.color,
        }],
      } : cat
    ));
    setNewSubName("");
    setNewSubSlug("");
    setAddingSubTo(null);
  };

  const deleteCategory = (id: string) => setCategories(prev => prev.filter(c => c.id !== id));
  const deleteSubcategory = (catId: string, subId: string) =>
    setCategories(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, subcategories: cat.subcategories.filter(s => s.id !== subId) } : cat
    ));

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="sub-label mb-1">Content Management</p>
            <h1 className="section-header text-3xl">Categories</h1>
          </div>
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
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
              <div className="flex items-center gap-3 mb-3">
                <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="w-12 h-12 text-center text-2xl rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/30" />
                <div className="flex-1 space-y-2">
                  <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" className="w-full px-3 py-2 rounded-xl bg-muted text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none" />
                  <input value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} placeholder="slug (auto-generated)" className="w-full px-3 py-2 rounded-xl bg-muted text-xs text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
                <button onClick={addCategory} className="p-2 rounded-xl bg-primary text-primary-foreground"><Check className="w-4 h-4" /></button>
                <button onClick={() => setShowAddCategory(false)} className="p-2 rounded-xl bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category List */}
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Category Header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + "20" }}>
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">/{cat.slug}</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground px-2 py-1 rounded-lg bg-muted">
                  {cat.subcategories.length} sub
                </span>
                <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === cat.id ? "rotate-90" : ""}`} />
              </div>

              {/* Subcategories */}
              <AnimatePresence>
                {expandedId === cat.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-8 space-y-2">
                      {cat.subcategories.map(sub => (
                        <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                          <span className="text-lg">{sub.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{sub.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">/{sub.slug}</p>
                          </div>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <button onClick={() => deleteSubcategory(cat.id, sub.id)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Subcategory */}
                      {addingSubTo === cat.id ? (
                        <div className="flex items-center gap-2 p-2">
                          <input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Subcategory name" className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                          <input value={newSubSlug} onChange={e => setNewSubSlug(e.target.value)} placeholder="slug" className="w-32 px-3 py-2 rounded-xl bg-muted text-xs outline-none focus:ring-2 focus:ring-primary/30" />
                          <button onClick={() => addSubcategory(cat.id)} className="p-2 rounded-xl bg-primary text-primary-foreground"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setAddingSubTo(null)} className="p-2 rounded-xl bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingSubTo(cat.id)}
                          className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 p-2 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Subcategory
                        </button>
                      )}
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
