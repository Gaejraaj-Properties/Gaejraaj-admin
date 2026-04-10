import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
  children?: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  onConfirm,
  confirmText = "Confirm",
  confirmVariant = "primary",
  loading = false,
  children,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !loading) onClose();
  };

  const isDanger = confirmVariant === "danger";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(10,25,41,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            {isDanger && (
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle style={{ width: 17, height: 17, color: "#dc2626" }} />
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">{title}</h3>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 -mt-0.5 -mr-0.5"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* Body */}
        <div className="px-6 py-4 text-[13.5px] text-gray-600 leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2.5 px-6 py-4"
          style={{ borderTop: "1px solid #f1f5f9" }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                  : "active:scale-[0.99]"
              }`}
              style={isDanger ? {} : { background: loading ? "#4a6fa5" : "#1B3F72" }}
              onMouseEnter={(e) => {
                if (!isDanger && !loading)
                  (e.currentTarget as HTMLButtonElement).style.background = "#142f55";
              }}
              onMouseLeave={(e) => {
                if (!isDanger && !loading)
                  (e.currentTarget as HTMLButtonElement).style.background = "#1B3F72";
              }}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              )}
              {loading ? "Processing…" : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
