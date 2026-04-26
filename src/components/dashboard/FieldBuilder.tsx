import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Check, X, Layers, Settings2 } from "lucide-react";

export interface FormField {
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

interface FieldBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const fieldTypes = ["text", "textarea", "date", "select", "image"] as const;

const FieldBuilder = ({ fields, onChange }: FieldBuilderProps) => {
  const [addingOption, setAddingOption] = useState<number | null>(null);
  const [newOption, setNewOption] = useState("");

  const addField = () => {
    onChange([...fields, {
      name: `field_${Date.now()}`,
      label: "",
      type: "text",
      placeholder: "Value",
      required: true,
    }]);
  };

  const updateField = (index: number, update: Partial<FormField>) => {
    onChange(fields.map((f, i) => i === index ? { ...f, ...update } : f));
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const addOption = (fieldIndex: number) => {
    if (!newOption.trim()) return;
    const field = fields[fieldIndex];
    updateField(fieldIndex, { options: [...(field.options || []), newOption.trim()] });
    setNewOption("");
    setAddingOption(null);
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, { options: field.options?.filter((_, i) => i !== optIndex) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3 h-3 text-slate-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Variable Matrix</p>
        </div>
        <button
          onClick={addField}
          className="flex items-center gap-1.5 text-[9px] font-bold text-primary hover:opacity-80 transition-all uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
        >
          <Plus className="w-2.5 h-2.5" /> Add Slot
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {fields.map((field, i) => (
            <motion.div
              key={`${field.name}-${i}`}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-3 h-3 text-slate-300 cursor-grab active:cursor-grabbing opacity-20 group-hover:opacity-100 transition-opacity" />

                <div className="flex-1 flex flex-wrap gap-2">
                  <div className="col-span-4">
                    <input
                      value={field.label}
                      onChange={e => updateField(i, { label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-700 outline-none focus:bg-white transition-all shadow-inner"
                      placeholder="Label"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      value={field.name}
                      onChange={e => updateField(i, { name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-mono font-bold text-slate-400 outline-none focus:bg-white transition-all"
                      placeholder="key"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={field.type}
                      onChange={e => updateField(i, { type: e.target.value as FormField["type"] })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-bold uppercase text-slate-500 outline-none cursor-pointer"
                    >
                      {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {field.type !== "image" && (
                    <div className="col-span-3">
                      <input
                        value={field.placeholder}
                        onChange={e => updateField(i, { placeholder: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500 outline-none focus:bg-white transition-all"
                        placeholder="Placeholder"
                      />
                    </div>
                  )}

                  {field.type === "image" && (
                    <div className="col-span-3">
                      <label className="flex items-center cursor-pointer group/req">
                        <input
                          type="checkbox"
                          checked={field.multiple}
                          onChange={e => updateField(i, { multiple: e.target.checked })}
                          className="hidden"
                        />
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${field.multiple ? 'bg-primary text-white shadow-sm' : 'bg-slate-50 text-slate-200 border border-slate-100'}`}>
                          <Check className={`w-3.5 h-3.5 transition-transform ${field.multiple ? 'scale-100' : 'scale-0'}`} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter ml-2">Multiple</span>
                      </label>
                      <label className="flex items-center cursor-pointer group/req mt-2">
                        <input
                          type="number"
                          value={field.maxSizeMB}
                          onChange={e => updateField(i, { maxSizeMB: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500 outline-none focus:bg-white transition-all"
                        />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Max Size (MB)</span>
                      </label>

                      <label className="flex items-center cursor-pointer group/req mt-2">
                        <input
                          type="text"
                          placeholder="Description"
                          value={field.description}
                          onChange={e => updateField(i, { description: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500 outline-none focus:bg-white transition-all"
                        />
                      </label>
                    </div>)}
                </div>
                <div className="flex items-center gap-2 border-l border-slate-100 pl-2">
                  <label className="flex items-center cursor-pointer group/req">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${field.required ? 'bg-primary text-white shadow-sm' : 'bg-slate-50 text-slate-200 border border-slate-100'}`}>
                      <Check className={`w-3.5 h-3.5 transition-transform ${field.required ? 'scale-100' : 'scale-0'}`} />
                    </div>
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => updateField(i, { required: e.target.checked })}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => removeField(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Select Options - Compact Style */}
              {field.type === "select" && (
                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 mr-1">
                    <Layers className="w-2.5 h-2.5 text-slate-300" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Choices:</span>
                  </div>
                  {field.options?.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-600">{opt}</span>
                      <button onClick={() => removeOption(i, oi)} className="text-slate-300 hover:text-rose-500">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {addingOption === i ? (
                    <div className="flex items-center gap-1 animate-in zoom-in-95 duration-200">
                      <input
                        value={newOption}
                        onChange={e => setNewOption(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addOption(i)}
                        className="px-2 py-1 bg-white border border-primary/20 rounded text-[10px] font-bold outline-none w-24 shadow-sm"
                        autoFocus
                      />
                      <button onClick={() => addOption(i)} className="p-1 bg-primary text-white rounded shadow-sm hover:opacity-90"><Check className="w-2.5 h-2.5" /></button>
                      <button onClick={() => setAddingOption(null)} className="p-1 text-slate-400"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingOption(i)}
                      className="text-[9px] font-bold text-primary hover:underline uppercase tracking-tighter"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {fields.length === 0 && (
        <div className="py-6 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-300">
          <Plus className="w-6 h-6 mb-2 opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest">No Inputs Defined</p>
        </div>
      )}
    </div>
  );
};

export default FieldBuilder;
