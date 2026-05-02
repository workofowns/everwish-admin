import { useState } from "react";
import RazorpayLayout from "@/components/razorpay/RazorpayLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Package,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Settings2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RazorpayProduct {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

const RazorpayProducts = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RazorpayProduct | null>(null);

  const { data: products = [], isLoading } = useQuery<RazorpayProduct[]>({
    queryKey: ["razorpayProducts"],
    queryFn: () => fetchApi("/razorpay/products"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetchApi("/razorpay/products", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Razorpay product created");
      queryClient.invalidateQueries({ queryKey: ["razorpayProducts"] });
      setIsAdding(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/razorpay/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["razorpayProducts"] });
    },
    onError: (err: any) => toast.error(err.message || "Delete failed"),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };
    createMutation.mutate(data);
  };

  return (
    <RazorpayLayout title="Products" subtitle="Price Containers">
      <div className="space-y-10">
        {/* Header Action */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">
              Razorpay Products
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Group price sets into logical product containers
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all active:scale-95 hover:bg-blue-700 shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4 text-white" /> New Product
          </button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-50 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                key={product.id}
                className="glass-card rounded-[3rem] bg-white border border-slate-100 p-8 shadow-2xl shadow-slate-100 relative group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Package className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm("Delete this product? All linked prices will also be deleted."))
                          deleteMutation.mutate(product.id);
                      }}
                      className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm border border-slate-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-lg font-black text-slate-900 leading-none mb-2">
                  {product.name}
                </h4>
                <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2 mb-6">
                  {product.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                      product.is_active
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                  <code className="text-[9px] font-mono text-slate-300 font-medium">
                    {product.id.slice(0, 8)}...
                  </code>
                </div>
              </motion.div>
            ))}

            {products.length === 0 && (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-blue-100 rounded-[3.5rem] bg-blue-50/10 opacity-40">
                <Package className="w-12 h-12 text-blue-200 mb-4" />
                <h3 className="text-xl font-black text-slate-400">No Products Yet</h3>
                <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed mt-2 uppercase tracking-wide italic">
                  Create a product container to organize your Razorpay price sets.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog
        open={isAdding}
        onOpenChange={(open) => {
          if (!open) setIsAdding(false);
        }}
      >
        <DialogContent className="max-w-xl rounded-[3rem] p-0 border-none overflow-hidden bg-white shadow-2xl">
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
              Create New Product
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-10 pt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Product Name
              </label>
              <input
                name="name"
                required
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-sm"
                placeholder="e.g. Razorpay Pro Subscription"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Description
              </label>
              <textarea
                name="description"
                className="w-full h-24 p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-sm resize-none"
                placeholder="Describe this product..."
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </RazorpayLayout>
  );
};

export default RazorpayProducts;
