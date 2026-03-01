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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          {t("dashboard.greeting")}
        </h1>
        <p className="text-zinc-400">
          {t("dashboard.currentScenario")}：
          <span
            className={`ml-1 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium ${scenarioIcon.activeClass} ${scenarioIcon.colorClass}`}
          >
            <ScenarioIcon className="h-3.5 w-3.5" />
            {activeScenario?.name || "—"}
          </span>{" "}
          ({t("dashboard.skillsEnabled", { count: skills.length })})
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: t("dashboard.scenarioSkills"),
            value: String(skills.length),
            icon: Layers,
            color: "text-blue-400",
            bg: "from-blue-500/10 to-transparent",
          },
          {
            title: t("dashboard.synced"),
            value: String(synced),
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "from-emerald-500/10 to-transparent",
          },
          {
            title: t("dashboard.supportedAgents"),
            value: `${installed}/${total}`,
            icon: Bot,
            color: "text-purple-400",
            bg: "from-purple-500/10 to-transparent",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg bg-[#121212] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
            >
              <div>
                <p className="text-zinc-500 text-[11px] font-semibold mb-1 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-semibold text-zinc-100">{stat.value}</h3>
              </div>
              <div className={`p-1.5 bg-[#1C1C1C] rounded-md ${stat.color} border border-[#2A2A2A]`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/install?tab=local")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-sm font-medium transition-colors outline-none"
        >
          <Download className="w-4 h-4 text-zinc-600" />
          {t("dashboard.scanImport")}
        </button>
        <button
          onClick={() => navigate("/install")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252528] text-white text-sm font-medium transition-colors border border-[#2A2A2A] outline-none"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
          {t("dashboard.installNew")}
        </button>
      </div>

      {skills.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-zinc-200 mb-4 flex items-center gap-2">
            {t("dashboard.recentActivity")}
          </h2>
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg overflow-hidden divide-y divide-[#1C1C1C]">
            {skills.slice(0, 5).map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#151515] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold bg-indigo-500/10 text-indigo-400">
                    {skill.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-zinc-200 text-sm font-medium mb-0.5 flex items-center gap-2">
                      {skill.name}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C1C] text-zinc-400 border border-[#2A2A2A] font-normal">
                        {skill.source_type}
                      </span>
                    </h4>
                    <p className="text-zinc-500 text-xs">
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
