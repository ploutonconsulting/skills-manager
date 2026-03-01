import { type CSSProperties } from "react";
import { Search, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";

export function Topbar() {
  const { t } = useTranslation();
  const { activeScenario, managedSkills } = useApp();
  const enabled = activeScenario?.skill_count ?? 0;
  const total = managedSkills.length;

  return (
    <div
      className="h-[52px] border-b border-[#1C1C24] flex items-end pb-2.5 justify-between px-5 bg-[#0C0C10]/90 backdrop-blur-md sticky top-0 z-20 shrink-0"
      style={{ WebkitAppRegion: "drag" } as CSSProperties}
    >
      <div className="relative group" style={{ WebkitAppRegion: "no-drag" } as CSSProperties}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-zinc-400 transition-colors pointer-events-none" />
        <input
          type="text"
          className="w-[220px] h-[30px] pl-8 pr-9 rounded-[5px] border border-[#1C1C24] bg-[#131318] text-[12px] text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-[#22222C] transition-colors"
          placeholder={t("mySkills.searchPlaceholder")}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 bg-[#181820] px-1 py-px rounded border border-[#22222C] pointer-events-none">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3.5" style={{ WebkitAppRegion: "no-drag" } as CSSProperties}>
        <div className="flex items-center gap-2">
          <div className="relative flex h-[8px] w-[8px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-25" />
            <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-emerald-500" />
          </div>
          <span className="text-[12px] text-zinc-500">
            <span className="text-zinc-600 text-[11px] mr-1.5">{t("topbar.supportedSkills")}</span>
            <span className="text-zinc-300 font-medium">{enabled}</span>
            <span className="text-zinc-700 mx-0.5">/</span>
            <span>{total}</span>
          </span>
        </div>

        <button className="text-zinc-600 hover:text-zinc-400 transition-colors p-1.5 rounded outline-none">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
