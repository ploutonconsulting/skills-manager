import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({ open, message, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#131318] border border-[#22222C] rounded-xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {t("common.confirm")}
          </h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 p-1 rounded transition-colors outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[12px] text-zinc-400 mb-5">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-[4px] text-[12px] font-medium text-zinc-500 hover:text-zinc-200 hover:bg-[#1C1C24] transition-colors outline-none"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-3 py-1.5 rounded-[4px] bg-red-600/90 hover:bg-red-500 text-white text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/50 outline-none"
          >
            {loading ? t("common.loading") : t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
