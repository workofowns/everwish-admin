import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, ChevronDown, Check, X } from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  placeholder: string;
  required: boolean;
  options?: string[];
}

interface FieldBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const fieldTypes = ["text", "textarea", "date", "select"] as const;

const FieldBuilder = ({ fields, onChange }: FieldBuilderProps) => {
  const [addingOption, setAddingOption] = useState<number | null>(null);
  const [newOption, setNewOption] = useState("");

  const addField = () => {
    onChange([...fields, {
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      placeholder: "",
      required: false,
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Form Fields</h4>
        <button onClick={addField} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Field
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {fields.map((field, i) => (
          <motion.div
            key={`${field.name}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-muted/50 rounded-xl p-3 space-y-2"
          >
            <div className="flex items-start gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-2 flex-shrink-0 cursor-grab" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={field.label}
                    onChange={e => updateField(i, { label: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-card text-xs font-semibold outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Label"
                  />
                  <input
                    value={field.name}
                    onChange={e => updateField(i, { name: e.target.value })}
                    className="w-28 px-2 py-1.5 rounded-lg bg-card text-xs font-mono text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="key"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={field.type}
                    onChange={e => updateField(i, { type: e.target.value as FormField["type"] })}
                    className="px-2 py-1.5 rounded-lg bg-card text-xs outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                  >
                    {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    value={field.placeholder}
                    onChange={e => updateField(i, { placeholder: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-card text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Placeholder text"
                  />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => updateField(i, { required: e.target.checked })}
                      className="rounded accent-primary"
                    />
                    Req
                  </label>
                </div>

                {/* Select Options */}
                {field.type === "select" && (
                  <div className="pl-1 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Options</p>
                    {field.options?.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-1">
                        <span className="text-xs text-foreground bg-card px-2 py-1 rounded-lg flex-1">{opt}</span>
                        <button onClick={() => removeOption(i, oi)} className="p-0.5 text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {addingOption === i ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={newOption}
                          onChange={e => setNewOption(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addOption(i)}
                          className="flex-1 px-2 py-1 rounded-lg bg-card text-xs outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Option value"
                          autoFocus
                        />
                        <button onClick={() => addOption(i)} className="p-1 text-primary"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setAddingOption(null)} className="p-1 text-muted-foreground"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingOption(i)} className="text-[10px] font-semibold text-primary">
                        + Add Option
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => removeField(i)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors mt-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* JSON Preview */}
      {fields.length > 0 && (
        <details className="mt-3">
          <summary className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors">
            JSON Output
          </summary>
          <pre className="mt-2 p-3 rounded-xl bg-foreground/5 text-[10px] font-mono text-muted-foreground overflow-auto max-h-40">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default FieldBuilder;
