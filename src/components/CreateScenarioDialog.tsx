import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../utils";
import { SCENARIO_ICON_OPTIONS } from "../lib/scenarioIcons";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, icon?: string) => Promise<void>;
}

export function CreateScenarioDialog({ open, onClose, onCreate }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(SCENARIO_ICON_OPTIONS[0].key);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim(), description.trim() || undefined, icon);
      setName("");
      setDescription("");
      setIcon(SCENARIO_ICON_OPTIONS[0].key);
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
          <h2 className="text-lg font-semibold text-white">{t("scenario.create")}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-[#1A1A1A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">{t("scenario.name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("scenario.namePlaceholder")}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-600"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">{t("scenario.description")}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("scenario.descPlaceholder")}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{t("scenario.icon")}</label>
            <div className="grid grid-cols-5 gap-2">
              {SCENARIO_ICON_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = option.key === icon;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setIcon(option.key)}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-xl border bg-[#0A0A0A] transition-all",
                      selected
                        ? `${option.activeClass} ${option.colorClass}`
                        : "border-[#2A2A2A] text-zinc-500 hover:border-[#3A3A3A] hover:text-zinc-200"
                    )}
                    title={option.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A] transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500"
            >
              {loading ? t("common.loading") : t("common.create")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
