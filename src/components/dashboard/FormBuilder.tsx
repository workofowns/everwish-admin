import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import FieldBuilder, { FormField } from "./FieldBuilder";

export interface FormStep {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormBuilderProps {
  steps: FormStep[];
  onChange: (steps: FormStep[]) => void;
}

const FormBuilder = ({ steps, onChange }: FormBuilderProps) => {
  const addStep = () => {
    onChange([
      ...steps,
      {
        id: `step_${Date.now()}`,
        title: `Step ${steps.length + 1}`,
        fields: []
      }
    ]);
  };

  const updateStepTitle = (index: number, title: string) => {
    const newSteps = [...steps];
    newSteps[index].title = title;
    onChange(newSteps);
  };

  const updateStepFields = (index: number, fields: FormField[]) => {
    const newSteps = [...steps];
    newSteps[index].fields = fields;
    onChange(newSteps);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {steps.map((step, stepIndex) => (
        <div key={step.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <input 
              value={step.title}
              onChange={(e) => updateStepTitle(stepIndex, e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-primary/50"
              placeholder="Step Title (e.g. Personal Details)"
            />
            <button
              onClick={() => removeStep(stepIndex)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove Step"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="pl-4 border-l-2 border-slate-200">
            <FieldBuilder 
              fields={step.fields} 
              onChange={(fields) => updateStepFields(stepIndex, fields)} 
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Form Step
      </button>
    </div>
  );
};

export default FormBuilder;
