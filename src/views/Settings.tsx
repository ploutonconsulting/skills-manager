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
    api.getSettings("sync_mode").then((v) => {
      if (v) setSyncMode(v);
    });
    api.getSettings("default_scenario").then((v) => {
      if (v) setDefaultScenario(v);
    });
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
    toast.success(t("scenario.switched", { name: scenarios.find((scenario) => scenario.id === id)?.name || "" }));
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

  return (
    <div className="max-w-[1000px] mx-auto h-full flex flex-col animate-in fade-in duration-500 pb-12">
      <div className="mb-8 border-b border-[#1C1C1C] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <Settings2 className="w-6 h-6 text-indigo-400" />
          {t("settings.title")}
        </h1>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">
              {t("settings.supportedAgents")} ({tools.filter((t) => t.installed).length}/{tools.length})
            </h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {t("settings.refresh")}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tools.map((agent, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  agent.installed
                    ? "bg-[#121212] border-[#2A2A2A] hover:border-[#3A3A3A]"
                    : "bg-[#0A0A0A] border-[#1C1C1C] opacity-60 grayscale"
                )}
              >
                <div className="flex items-center gap-3">
                  {agent.installed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-600" />
                  )}
                  <div>
                    <h3
                      className={cn(
                        "text-sm font-medium",
                        agent.installed ? "text-zinc-200" : "text-zinc-500"
                      )}
                    >
                      {agent.display_name}
                    </h3>
                    <p className="text-[10px] text-zinc-600 truncate max-w-[120px]" title={agent.skills_dir}>
                      {agent.installed ? agent.skills_dir.replace(/\/Users\/[^/]+/, "~") : t("settings.notInstalled")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">{t("settings.globalConfig")}</h2>
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg overflow-hidden divide-y divide-[#1C1C1C]">
            <div className="px-4 py-3.5 flex items-start justify-between">
              <div>
                <h3 className="text-zinc-200 text-sm font-medium mb-1">{t("settings.repoPath")}</h3>
                <p className="text-zinc-500 text-xs mb-2">{t("settings.repoPathDesc")}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-md px-2.5 py-1">
                    <Folder className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-300">~/.skills-manager/</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenRepoInFinder}
                    disabled={openingRepo}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all outline-none",
                      "border-indigo-500/25 bg-indigo-500/10 text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                      "hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-indigo-200",
                      "focus-visible:border-indigo-400/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20",
                      openingRepo && "cursor-wait opacity-70"
                    )}
                  >
                    {openingRepo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5" />
                    )}
                    {t("settings.openInFinder")}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-zinc-200 text-sm font-medium mb-1">{t("settings.syncMode")}</h3>
                <p className="text-zinc-500 text-xs">{t("settings.syncModeDesc")}</p>
              </div>
              <div className="flex bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-1">
                <button
                  onClick={() => handleSyncModeChange("symlink")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    syncMode === "symlink"
                      ? "bg-[#252528] text-zinc-200 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> {t("settings.symlink")}
                </button>
                <button
                  onClick={() => handleSyncModeChange("copy")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    syncMode === "copy"
                      ? "bg-[#252528] text-zinc-200 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <Copy className="w-3.5 h-3.5" /> {t("settings.copy")}
                </button>
              </div>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-zinc-200 text-sm font-medium mb-1">{t("settings.currentScenario")}</h3>
                <p className="text-zinc-500 text-xs">{t("settings.currentScenarioDesc")}</p>
              </div>
              <select
                value={activeScenario?.id || ""}
                onChange={(e) => handleActiveScenarioChange(e.target.value)}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="" disabled>
                  —
                </option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-zinc-200 text-sm font-medium mb-1">{t("settings.defaultScenario")}</h3>
                <p className="text-zinc-500 text-xs">{t("settings.defaultScenarioDesc")}</p>
              </div>
              <select
                value={defaultScenario}
                onChange={(e) => handleDefaultScenarioChange(e.target.value)}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">—</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-zinc-200 text-sm font-medium mb-1">{t("settings.language")}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-500" />
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="zh">简体中文 (zh-CN)</option>
                  <option value="en">English (en-US)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{t("settings.version")}</h3>
                <p className="text-zinc-500 text-xs">{t("settings.tagline")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1C1C1C] hover:bg-[#252528] text-zinc-300 text-xs font-medium transition-colors border border-[#2A2A2A]">
                <Github className="w-3.5 h-3.5" /> GitHub
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1C1C1C] hover:bg-[#252528] text-zinc-300 text-xs font-medium transition-colors border border-[#2A2A2A]">
                <MessageSquare className="w-3.5 h-3.5" /> Feedback
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
