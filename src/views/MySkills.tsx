import { useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
  Github,
  HardDrive,
  Globe,
  Trash2,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "../utils";
import { useApp } from "../context/AppContext";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SkillDetailPanel } from "../components/SkillDetailPanel";
import * as api from "../lib/tauri";
import type { ManagedSkill } from "../lib/tauri";

export function MySkills() {
  const { t } = useTranslation();
  const { activeScenario, tools, managedSkills: skills, refreshScenarios, refreshManagedSkills } = useApp();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterMode, setFilterMode] = useState<"all" | "enabled" | "available">("all");
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<ManagedSkill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedSkill | null>(null);

  const installedTools = tools.filter((tool) => tool.installed);
  const activeScenarioName = activeScenario?.name || t("mySkills.currentScenarioFallback");

  const enabledCount = activeScenario
    ? skills.filter((skill) => skill.scenario_ids.includes(activeScenario.id)).length
    : 0;

  const filtered = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      (skill.description || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (!activeScenario) return true;

    const enabledInScenario = skill.scenario_ids.includes(activeScenario.id);
    if (filterMode === "enabled") return enabledInScenario;
    if (filterMode === "available") return !enabledInScenario;
    return true;
  });

  const handleSync = async (skill: ManagedSkill) => {
    for (const tool of installedTools) {
      if (!skill.targets.find((target) => target.tool === tool.key)) {
        await api.syncSkillToTool(skill.id, tool.key);
      }
    }
    toast.success(`${skill.name} ${t("mySkills.synced")}`);
    await refreshManagedSkills();
  };

  const handleUnsync = async (skill: ManagedSkill) => {
    for (const target of skill.targets) {
      await api.unsyncSkillFromTool(skill.id, target.tool);
    }
    toast.success(`${skill.name} ${t("mySkills.unsync")}`);
    await refreshManagedSkills();
  };

  const handleDeleteManagedSkill = async () => {
    if (!deleteTarget) return;
    await api.deleteManagedSkill(deleteTarget.id);
    if (selectedSkill?.id === deleteTarget.id) setSelectedSkill(null);
    toast.success(`${deleteTarget.name} ${t("mySkills.deleted")}`);
    setDeleteTarget(null);
    await Promise.all([refreshManagedSkills(), refreshScenarios()]);
  };

  const handleToggleScenario = async (skill: ManagedSkill) => {
    if (!activeScenario) return;
    const enabledInScenario = skill.scenario_ids.includes(activeScenario.id);
    if (enabledInScenario) {
      await api.removeSkillFromScenario(skill.id, activeScenario.id);
      toast.success(`${skill.name} ${t("mySkills.disabledInScenario")}`);
    } else {
      await api.addSkillToScenario(skill.id, activeScenario.id);
      toast.success(`${skill.name} ${t("mySkills.enabledInScenario")}`);
    }
    await Promise.all([refreshManagedSkills(), refreshScenarios()]);
  };

  const sourceIcon = (type: string) => {
    switch (type) {
      case "git":
      case "skillssh":
        return <Github className="w-3 h-3" />;
      case "local":
      case "import":
        return <HardDrive className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-[1200px] flex-col animate-in fade-in duration-400">
      {/* Header */}
      <div className="mb-5 pr-2">
        <h1 className="flex items-center gap-2.5 text-[16px] font-semibold text-zinc-100">
          {t("mySkills.title")}
          <span className="rounded-full border border-[#22222C] bg-[#1C1C24] px-2.5 py-0.5 text-[12px] font-medium text-zinc-500">
            {skills.length}
          </span>
        </h1>
        <p className="mt-1.5 text-[13px] text-zinc-600">
          {activeScenario
            ? t("mySkills.subtitle", { scenario: activeScenario.name, count: enabledCount })
            : t("mySkills.noScenario")}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-[260px] w-full">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("mySkills.searchPlaceholder")}
              className="w-full rounded-[5px] border border-[#1C1C24] bg-[#131318] h-[34px] pl-9 pr-3 text-[13px] font-medium text-zinc-200 placeholder-zinc-700 transition-all focus:border-[#22222C] focus:outline-none"
            />
          </div>

          <div className="flex rounded-[5px] border border-[#1C1C24] bg-[#131318] p-0.5">
            {(["all", "enabled", "available"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={cn(
                  "rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition-colors outline-none",
                  filterMode === mode
                    ? "bg-[#1E1E2A] text-zinc-200"
                    : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                {t(`mySkills.filters.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex rounded-[5px] border border-[#1C1C24] bg-[#131318] p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-[4px] p-2 transition-colors outline-none",
              viewMode === "grid" ? "bg-[#1E1E2A] text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-[4px] p-2 transition-colors outline-none",
              viewMode === "list" ? "bg-[#1E1E2A] text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
          <Layers className="mb-4 h-12 w-12 text-zinc-800" />
          <h3 className="mb-1.5 text-[14px] font-semibold text-zinc-500">{t("mySkills.noSkills")}</h3>
          <p className="text-[13px] text-zinc-700">
            {skills.length === 0 ? t("mySkills.addFirst") : t("mySkills.noMatch")}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "pb-8",
            viewMode === "grid"
              ? "grid grid-cols-2 gap-3 lg:grid-cols-3"
              : "flex flex-col gap-0.5"
          )}
        >
          {filtered.map((skill) => {
            const isSynced = skill.targets.length > 0;
            const enabledInScenario = activeScenario
              ? skill.scenario_ids.includes(activeScenario.id)
              : false;
            const sourceTypeLabel =
              skill.source_type === "skillssh" ? "skills.sh" : skill.source_type;

            /* ── Grid Card ── */
            if (viewMode === "grid") {
              return (
                <div
                  key={skill.id}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-[#1C1C24] bg-[#131318] transition-all hover:border-[#2A2A38] hover:bg-[#17171F]"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-1.5">
                    {isSynced ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                    )}
                    <h3
                      className="flex-1 truncate text-[14px] font-semibold text-zinc-100 cursor-pointer hover:text-white"
                      onClick={() => setSelectedSkill(skill)}
                      title={skill.name}
                    >
                      {skill.name}
                    </h3>
                    <button
                      onClick={() => setDeleteTarget(skill)}
                      className="shrink-0 rounded p-1 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                      title={t("mySkills.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="px-3.5 text-[12px] leading-[18px] text-zinc-600 truncate">
                    {skill.description || "—"}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#1C1C24] px-3.5 py-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-700 shrink-0">
                        {sourceIcon(skill.source_type)}
                        {sourceTypeLabel}
                      </span>
                      <span className="text-zinc-800">·</span>
                      <span
                        className={cn(
                          "text-[11px] font-medium truncate",
                          enabledInScenario ? "text-amber-400/80" : "text-zinc-700"
                        )}
                      >
                        {enabledInScenario ? activeScenarioName : t("mySkills.notInScenario")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleScenario(skill)}
                        disabled={!activeScenario}
                        className={cn(
                          "rounded px-2 py-1 text-[12px] font-medium transition-colors outline-none",
                          enabledInScenario
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-zinc-600 hover:bg-[#1C1C24] hover:text-zinc-300"
                        )}
                      >
                        {enabledInScenario ? t("mySkills.disable") : (
                          <span className="inline-flex items-center gap-0.5">
                            <Plus className="h-3 w-3" />
                            {t("mySkills.enable")}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => (isSynced ? handleUnsync(skill) : handleSync(skill))}
                        className={cn(
                          "rounded px-2 py-1 text-[12px] font-medium transition-colors outline-none",
                          isSynced
                            ? "text-zinc-500 hover:bg-[#1C1C24] hover:text-red-400"
                            : "text-indigo-400 hover:bg-indigo-500/10"
                        )}
                      >
                        {isSynced ? t("mySkills.synced") : t("mySkills.sync")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            /* ── List Row ── */
            return (
              <div
                key={skill.id}
                className="group flex items-center gap-3.5 rounded-[5px] border border-transparent bg-[#131318] px-3.5 py-2.5 transition-all hover:border-[#22222C] hover:bg-[#17171F]"
              >
                {isSynced ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                )}

                <h3
                  className="w-[180px] shrink-0 truncate text-[14px] font-semibold text-zinc-200 cursor-pointer hover:text-white"
                  onClick={() => setSelectedSkill(skill)}
                  title={skill.name}
                >
                  {skill.name}
                </h3>

                <p className="min-w-0 flex-1 truncate text-[12px] text-zinc-600">
                  {skill.description || "—"}
                </p>

                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-700">
                    {sourceIcon(skill.source_type)}
                    {sourceTypeLabel}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      enabledInScenario ? "text-amber-400/80" : "text-zinc-700"
                    )}
                  >
                    {enabledInScenario ? activeScenarioName : t("mySkills.notInScenario")}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleToggleScenario(skill)}
                    disabled={!activeScenario}
                    className={cn(
                      "rounded px-2 py-1 text-[12px] font-medium transition-colors outline-none",
                      enabledInScenario
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-zinc-600 hover:bg-[#1C1C24] hover:text-zinc-300"
                    )}
                  >
                    {enabledInScenario ? t("mySkills.disable") : t("mySkills.enable")}
                  </button>
                  <button
                    onClick={() => (isSynced ? handleUnsync(skill) : handleSync(skill))}
                    className={cn(
                      "rounded px-2 py-1 text-[12px] font-medium transition-colors outline-none",
                      isSynced
                        ? "text-zinc-500 hover:text-red-400"
                        : "text-indigo-400 hover:bg-indigo-500/10"
                    )}
                  >
                    {isSynced ? t("mySkills.synced") : t("mySkills.sync")}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(skill)}
                    className="rounded p-1 text-zinc-700 transition-colors hover:text-red-400"
                    title={t("mySkills.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SkillDetailPanel skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      <ConfirmDialog
        open={deleteTarget !== null}
        message={t("mySkills.deleteConfirm", { name: deleteTarget?.name || "" })}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteManagedSkill}
      />
    </div>
  );
}
