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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#121212] border border-[#2A2A2A] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            {t("common.confirm")}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-zinc-300 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A] transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-500"
          >
            {loading ? t("common.loading") : t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
