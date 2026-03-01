import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../utils";
import { SCENARIO_ICON_OPTIONS } from "../lib/scenarioIcons";

interface Props {
  open: boolean;
  currentName: string;
  currentIcon?: string | null;
  onClose: () => void;
  onRename: (newName: string, icon?: string) => Promise<void>;
}

export function RenameScenarioDialog({
  open,
  currentName,
  currentIcon,
  onClose,
  onRename,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(currentName);
  const [icon, setIcon] = useState(currentIcon || SCENARIO_ICON_OPTIONS[0].key);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setIcon(currentIcon || SCENARIO_ICON_OPTIONS[0].key);
    }
  }, [open, currentIcon, currentName]);

  if (!open) return null;

  const handleRename = async () => {
    if (!name.trim() || (name.trim() === currentName && icon === (currentIcon || SCENARIO_ICON_OPTIONS[0].key))) {
      return;
    }
    setLoading(true);
    try {
      await onRename(name.trim(), icon);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#0C0C10] border border-[#1C1C24] rounded-[4px] px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-[#22222C] transition-all placeholder-zinc-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#131318] border border-[#22222C] rounded-xl w-full max-w-[400px] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-zinc-100">{t("common.rename")}</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 p-1 rounded transition-colors outline-none">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1">{t("scenario.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("scenario.namePlaceholder")}
              className={inputClass}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 mb-1.5">{t("scenario.icon")}</label>
            <div className="grid grid-cols-5 gap-1.5">
              {SCENARIO_ICON_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = option.key === icon;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setIcon(option.key)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg border bg-[#0C0C10] transition-all outline-none",
                      selected
                        ? `${option.activeClass} ${option.colorClass}`
                        : "border-[#1C1C24] text-zinc-600 hover:border-[#22222C] hover:text-zinc-300"
                    )}
                    title={option.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-[4px] text-[12px] font-medium text-zinc-500 hover:text-zinc-200 hover:bg-[#1C1C24] transition-colors outline-none"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleRename}
              disabled={
                !name.trim() ||
                (name.trim() === currentName && icon === (currentIcon || SCENARIO_ICON_OPTIONS[0].key)) ||
                loading
              }
              className="px-3 py-1.5 rounded-[4px] bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/50 outline-none"
            >
              {loading ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
