import { useState, useEffect } from "react";
import {
  Folder,
  RefreshCw,
  CheckCircle2,
  Circle,
  Globe,
  Link as LinkIcon,
  Copy,
  Settings2,
  Github,
  MessageSquare,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "../utils";
import { useApp } from "../context/AppContext";
import * as api from "../lib/tauri";

export function Settings() {
  const { t, i18n } = useTranslation();
  const { tools, scenarios, activeScenario, refreshTools, switchScenario } = useApp();
  const [syncMode, setSyncMode] = useState("symlink");
  const [defaultScenario, setDefaultScenario] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [openingRepo, setOpeningRepo] = useState(false);

  useEffect(() => {
    api.getSettings("sync_mode").then((v) => { if (v) setSyncMode(v); });
    api.getSettings("default_scenario").then((v) => { if (v) setDefaultScenario(v); });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTools();
    setRefreshing(false);
    toast.success(t("common.success"));
  };

  const handleSyncModeChange = async (mode: string) => {
    setSyncMode(mode);
    await api.setSettings("sync_mode", mode);
  };

  const handleDefaultScenarioChange = async (id: string) => {
    setDefaultScenario(id);
    await api.setSettings("default_scenario", id);
  };

  const handleActiveScenarioChange = async (id: string) => {
    if (!id) return;
    await switchScenario(id);
    toast.success(t("scenario.switched", { name: scenarios.find((s) => s.id === id)?.name || "" }));
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    api.setSettings("language", lng);
  };

  const handleOpenRepoInFinder = async () => {
    try {
      setOpeningRepo(true);
      await api.openCentralRepoInFinder();
    } catch (error) {
      console.error("Failed to open central repository in Finder", error);
      toast.error(t("common.error"));
    } finally {
      setOpeningRepo(false);
    }
  };

  const selectClass = "bg-[#0C0C10] border border-[#1C1C24] rounded-[4px] px-3 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-[#22222C] transition-colors";

  return (
    <div className="max-w-[1000px] mx-auto h-full flex flex-col animate-in fade-in duration-400 pb-8">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-[#1C1C24]">
        <h1 className="text-[15px] font-semibold text-zinc-100 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          {t("settings.title")}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Agent status */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em]">
              {t("settings.supportedAgents")} ({tools.filter((t) => t.installed).length}/{tools.length})
            </h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium outline-none"
            >
              {refreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {t("settings.refresh")}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {tools.map((agent, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-[4px] border transition-colors",
                  agent.installed
                    ? "bg-[#131318] border-[#1C1C24] hover:border-[#22222C]"
                    : "bg-[#0F0F14] border-[#1C1C24] opacity-50"
                )}
              >
                {agent.installed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className={cn("text-[11px] font-medium truncate", agent.installed ? "text-zinc-300" : "text-zinc-600")}>
                    {agent.display_name}
                  </h3>
                  <p className="text-[9px] text-zinc-700 truncate" title={agent.skills_dir}>
                    {agent.installed ? agent.skills_dir.replace(/\/Users\/[^/]+/, "~") : t("settings.notInstalled")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global config */}
        <section>
          <h2 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-3">
            {t("settings.globalConfig")}
          </h2>
          <div className="bg-[#131318] border border-[#1C1C24] rounded-lg overflow-hidden divide-y divide-[#1C1C24]">
            {/* Repo path */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[12px] text-zinc-200 font-medium mb-0.5">{t("settings.repoPath")}</h3>
                <p className="text-[11px] text-zinc-600">{t("settings.repoPathDesc")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-[#0C0C10] border border-[#1C1C24] rounded-[4px] px-2 py-1">
                  <Folder className="w-3 h-3 text-zinc-600" />
                  <span className="text-[11px] font-mono text-zinc-400">~/.skills-manager/</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenRepoInFinder}
                  disabled={openingRepo}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-[11px] font-medium transition-all outline-none",
                    "border-indigo-500/25 bg-indigo-500/8 text-indigo-400",
                    "hover:border-indigo-400/40 hover:bg-indigo-500/12",
                    openingRepo && "cursor-wait opacity-70"
                  )}
                >
                  {openingRepo ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3 h-3" />
                  )}
                  {t("settings.openInFinder")}
                </button>
              </div>
            </div>

            {/* Sync mode */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[12px] text-zinc-200 font-medium mb-0.5">{t("settings.syncMode")}</h3>
                <p className="text-[11px] text-zinc-600">{t("settings.syncModeDesc")}</p>
              </div>
              <div className="flex bg-[#0C0C10] border border-[#1C1C24] rounded-[4px] p-px shrink-0">
                <button
                  onClick={() => handleSyncModeChange("symlink")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium transition-colors outline-none",
                    syncMode === "symlink" ? "bg-[#1E1E2A] text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  <LinkIcon className="w-3 h-3" /> {t("settings.symlink")}
                </button>
                <button
                  onClick={() => handleSyncModeChange("copy")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium transition-colors outline-none",
                    syncMode === "copy" ? "bg-[#1E1E2A] text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  <Copy className="w-3 h-3" /> {t("settings.copy")}
                </button>
              </div>
            </div>

            {/* Current scenario */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[12px] text-zinc-200 font-medium mb-0.5">{t("settings.currentScenario")}</h3>
                <p className="text-[11px] text-zinc-600">{t("settings.currentScenarioDesc")}</p>
              </div>
              <select
                value={activeScenario?.id || ""}
                onChange={(e) => handleActiveScenarioChange(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>—</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Default scenario */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[12px] text-zinc-200 font-medium mb-0.5">{t("settings.defaultScenario")}</h3>
                <p className="text-[11px] text-zinc-600">{t("settings.defaultScenarioDesc")}</p>
              </div>
              <select
                value={defaultScenario}
                onChange={(e) => handleDefaultScenarioChange(e.target.value)}
                className={selectClass}
              >
                <option value="">—</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[12px] text-zinc-200 font-medium">{t("settings.language")}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-zinc-600" />
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="zh">简体中文 (zh-CN)</option>
                  <option value="en">English (en-US)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <div className="bg-[#131318] border border-[#1C1C24] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1C1C24] border border-[#22222C] flex items-center justify-center">
                <Settings2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-zinc-100">{t("settings.version")}</h3>
                <p className="text-zinc-600 text-[11px]">{t("settings.tagline")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#1C1C24] hover:bg-[#1E1E2A] text-zinc-400 text-[11px] font-medium transition-colors border border-[#22222C] outline-none">
                <Github className="w-3 h-3" /> GitHub
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#1C1C24] hover:bg-[#1E1E2A] text-zinc-400 text-[11px] font-medium transition-colors border border-[#22222C] outline-none">
                <MessageSquare className="w-3 h-3" /> Feedback
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
