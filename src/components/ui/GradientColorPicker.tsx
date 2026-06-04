import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paintbrush, Sliders, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientColorPickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const SOLID_PRESETS = [
  "#6C41CF", // Primary brand purple
  "#FF8BC4", // Accent brand pink
  "#A37FF6", // Muted purple
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Fuchsia
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

const GRADIENT_PRESETS = [
  { name: "Brand Fusion", value: "linear-gradient(135deg, #6c41cf 0%, #ff8bc4 100%)" },
  { name: "Sunset Horizon", value: "linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)" },
  { name: "Ocean Splash", value: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" },
  { name: "Emerald Mint", value: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" },
  { name: "Royal Velvet", value: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" },
  { name: "Electric Fuchsia", value: "linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)" },
  { name: "Warm Peach", value: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" },
  { name: "Mystic Aurora", value: "linear-gradient(135deg, #1e3a8a 0%, #475569 100%)" },
];

function parseGradient(gradientStr: string) {
  const defaults = {
    angle: 135,
    startColor: "#6c41cf",
    endColor: "#ff8bc4"
  };

  if (!gradientStr) return defaults;

  if (!gradientStr.startsWith("linear-gradient")) {
    if (gradientStr.startsWith("#")) {
      return {
        angle: 135,
        startColor: gradientStr,
        endColor: gradientStr
      };
    }
    return defaults;
  }

  try {
    const angleMatch = gradientStr.match(/(\d+)deg/);
    const colorsMatch = gradientStr.match(/(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3})/g);

    return {
      angle: angleMatch ? parseInt(angleMatch[1], 10) : defaults.angle,
      startColor: colorsMatch && colorsMatch[0] ? colorsMatch[0] : defaults.startColor,
      endColor: colorsMatch && colorsMatch[1] ? colorsMatch[1] : (colorsMatch && colorsMatch[0] ? colorsMatch[0] : defaults.endColor)
    };
  } catch (e) {
    return defaults;
  }
}

export function GradientColorPicker({ value, onChange, className }: GradientColorPickerProps) {
  const isGradient = value && value.startsWith("linear-gradient");
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">(isGradient ? "gradient" : "solid");

  // Local state for custom gradient editor
  const parsed = parseGradient(value);
  const [startColor, setStartColor] = useState(parsed.startColor);
  const [endColor, setEndColor] = useState(parsed.endColor);
  const [angle, setAngle] = useState(parsed.angle);

  // Sync state if external value changes
  useEffect(() => {
    const updated = parseGradient(value);
    setStartColor(updated.startColor);
    setEndColor(updated.endColor);
    setAngle(updated.angle);
    setActiveTab(value && value.startsWith("linear-gradient") ? "gradient" : "solid");
  }, [value]);

  const handleCustomGradientChange = (newStart: string, newEnd: string, newAngle: number) => {
    setStartColor(newStart);
    setEndColor(newEnd);
    setAngle(newAngle);
    onChange(`linear-gradient(${newAngle}deg, ${newStart} 0%, ${newEnd} 100%)`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative w-full h-full rounded-xl border border-muted-foreground/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors shadow-sm",
            className
          )}
          style={{ background: value }}
          role="button"
          aria-label="Choose color or gradient"
        >
          {/* Transparent grid background helper for light/transparent colors */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-popover rounded-2xl shadow-xl border border-border flex flex-col gap-4 z-50">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="font-bold text-sm text-foreground">Color Settings</span>
          <div className="flex bg-muted/60 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("solid");
                // If switching to solid, pick the startColor or default preset
                onChange(startColor || SOLID_PRESETS[0]);
              }}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                activeTab === "solid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Paintbrush className="w-3.5 h-3.5" /> Solid
            </button>
            <button
              onClick={() => {
                setActiveTab("gradient");
                onChange(`linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`);
              }}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                activeTab === "gradient"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sliders className="w-3.5 h-3.5" /> Gradient
            </button>
          </div>
        </div>

        {activeTab === "solid" ? (
          <div className="flex flex-col gap-3">
            {/* Solid Custom Color Picker */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg border border-border overflow-hidden cursor-pointer">
                <input
                  type="color"
                  value={value && !value.startsWith("linear-gradient") ? value : startColor}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={value && !value.startsWith("linear-gradient") ? value : startColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("#") && val.length <= 9) {
                    onChange(val);
                  }
                }}
                placeholder="#HEX Color"
                className="flex-1 px-3 py-1.5 bg-muted rounded-lg text-xs font-mono font-medium border border-transparent focus:border-primary/50 focus:bg-background outline-none text-foreground"
              />
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Solid Presets</span>
              <div className="grid grid-cols-5 gap-2">
                {SOLID_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange(color)}
                    className="w-10 h-10 rounded-lg border border-border/50 hover:scale-105 hover:shadow-md transition-all relative flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {value === color && (
                      <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Custom Gradient Builder Controls */}
            <div className="flex items-center justify-between gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/30">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-[10px] font-bold text-muted-foreground">Start</span>
                <div className="relative w-8 h-8 rounded-md border border-border overflow-hidden">
                  <input
                    type="color"
                    value={startColor}
                    onChange={(e) => handleCustomGradientChange(e.target.value, endColor, angle)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer border-0 p-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 items-center">
                <span className="text-[10px] font-bold text-muted-foreground">End</span>
                <div className="relative w-8 h-8 rounded-md border border-border overflow-hidden">
                  <input
                    type="color"
                    value={endColor}
                    onChange={(e) => handleCustomGradientChange(startColor, e.target.value, angle)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer border-0 p-0"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1 pl-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                  <span>Angle</span>
                  <span className="font-mono">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => handleCustomGradientChange(startColor, endColor, parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Gradient Live Preview Box */}
            <div
              className="w-full h-10 rounded-lg border border-border shadow-inner flex items-center justify-center"
              style={{ background: `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)` }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Custom Gradient Preview</span>
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Gradient Presets</span>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onChange(preset.value)}
                    title={preset.name}
                    className="w-14 h-9 rounded-lg border border-border/50 hover:scale-105 hover:shadow-md transition-all relative flex items-center justify-center overflow-hidden"
                    style={{ background: preset.value }}
                  >
                    {value === preset.value && (
                      <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
