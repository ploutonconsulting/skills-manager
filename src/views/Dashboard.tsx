import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, CheckCircle2, Bot, Plus, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import * as api from "../lib/tauri";
import type { ManagedSkill } from "../lib/tauri";
import { getScenarioIconOption } from "../lib/scenarioIcons";

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeScenario, tools } = useApp();
  const [skills, setSkills] = useState<ManagedSkill[]>([]);

  const installed = tools.filter((t) => t.installed).length;
  const total = tools.length;
  const synced = skills.filter((s) => s.targets.length > 0).length;
  const scenarioIcon = getScenarioIconOption(activeScenario);
  const ScenarioIcon = scenarioIcon.icon;

  useEffect(() => {
    if (activeScenario) {
      api.getSkillsForScenario(activeScenario.id).then(setSkills).catch(() => { });
    }
  }, [activeScenario]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-[16px] font-semibold text-zinc-100 mb-1.5">
          {t("dashboard.greeting")}
        </h1>
        <p className="text-[13px] text-zinc-500 flex items-center gap-2 flex-wrap">
          {t("dashboard.currentScenario")}：
          <span
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[12px] font-medium ${scenarioIcon.activeClass} ${scenarioIcon.colorClass}`}
          >
            <ScenarioIcon className="h-3 w-3" />
            {activeScenario?.name || "—"}
          </span>
          <span className="text-zinc-700">·</span>
          <span>{t("dashboard.skillsEnabled", { count: skills.length })}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3.5">
        {[
          {
            title: t("dashboard.scenarioSkills"),
            value: String(skills.length),
            icon: Layers,
            color: "text-blue-400",
            bg: "bg-blue-500/[0.08]",
          },
          {
            title: t("dashboard.synced"),
            value: String(synced),
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/[0.08]",
          },
          {
            title: t("dashboard.supportedAgents"),
            value: `${installed}/${total}`,
            icon: Bot,
            color: "text-violet-400",
            bg: "bg-violet-500/[0.08]",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5 rounded-lg bg-[#131318] border border-[#1C1C24] hover:border-[#22222C] transition-colors"
            >
              <div>
                <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-1">
                  {stat.title}
                </p>
                <h3 className="text-xl font-semibold text-zinc-100 leading-none">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-md ${stat.bg} ${stat.color} border border-[#1C1C24]`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/install?tab=local")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-100 text-[#0C0C10] hover:bg-white text-[13px] font-medium transition-colors outline-none"
        >
          <Download className="w-4 h-4" />
          {t("dashboard.scanImport")}
        </button>
        <button
          onClick={() => navigate("/install")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#17171F] hover:bg-[#1E1E28] text-zinc-200 text-[13px] font-medium transition-colors border border-[#22222C] outline-none"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
          {t("dashboard.installNew")}
        </button>
      </div>

      {/* Recent skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-2.5">
            {t("dashboard.recentActivity")}
          </h2>
          <div className="bg-[#131318] border border-[#1C1C24] rounded-lg overflow-hidden divide-y divide-[#1C1C24]">
            {skills.slice(0, 5).map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#17171F] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-[4px] flex items-center justify-center text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 shrink-0">
                    {skill.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-[12px] text-zinc-200 font-medium flex items-center gap-1.5">
                      {skill.name}
                      <span className="text-[9px] px-1.5 py-px rounded bg-[#1C1C24] text-zinc-600 border border-[#22222C] font-normal">
                        {skill.source_type}
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-600 mt-px">
                      {skill.targets.length > 0
                        ? `${t("dashboard.synced")} → ${skill.targets.map((t) => t.tool).join(", ")}`
                        : "未同步"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
