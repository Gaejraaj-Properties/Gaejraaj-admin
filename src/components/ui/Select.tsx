import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  // Position the dropdown under the trigger
  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const dropdown = open
    ? createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            width: Math.max(coords.width, 160),
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 16,
            boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
            overflow: "hidden",
            animation: "fade-down 0.18s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm capitalize text-left transition-colors"
                style={{
                  backgroundColor: isSelected ? "#EEF3FB" : undefined,
                  color: isSelected ? "#1B3F72" : "#374151",
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1B3F72";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#374151";
                  }
                }}
              >
                <span className="flex-1">{opt.label}</span>
                {isSelected && (
                  <Check style={{ width: 13, height: 13, color: "#C8922A", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] transition-all hover:border-[#ADC8EE] min-w-[140px] w-full"
        style={{ color: selected ? "#0f172a" : "#9ca3af" }}
      >
        <span className="flex-1 text-left capitalize">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: "#94a3b8",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {dropdown}
    </div>
  );
}
