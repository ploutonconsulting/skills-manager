import { useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Hammer,
  LayoutDashboard,
  Layers,
  Download,
  Settings,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "../utils";
import { useApp } from "../context/AppContext";
import { CreateScenarioDialog } from "./CreateScenarioDialog";
import { RenameScenarioDialog } from "./RenameScenarioDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import * as api from "../lib/tauri";
import { getScenarioIconOption } from "../lib/scenarioIcons";

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { scenarios, activeScenario, switchScenario, refreshScenarios } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; icon?: string | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const NAV_ITEMS = [
    { name: t("sidebar.dashboard"), path: "/", icon: LayoutDashboard },
    { name: t("sidebar.mySkills"), path: "/my-skills", icon: Layers },
    { name: t("sidebar.installSkills"), path: "/install", icon: Download },
  ];

  const handleSwitchScenario = async (id: string) => {
    await switchScenario(id);
    const s = scenarios.find((s) => s.id === id);
    if (location.pathname === "/settings") {
      navigate("/my-skills");
    }
    if (s) toast.success(t("scenario.switched", { name: s.name }));
  };

  const handleCreateScenario = async (name: string, description?: string, icon?: string) => {
    await api.createScenario(name, description, icon);
    await refreshScenarios();
    toast.success(t("scenario.created"));
  };

  const handleRenameScenario = async (newName: string, icon?: string) => {
    if (!renameTarget) return;
    const scenario = scenarios.find((s) => s.id === renameTarget.id);
    if (!scenario) return;

    await api.updateScenario(
      renameTarget.id,
      newName,
      scenario.description || undefined,
      icon || scenario.icon || undefined
    );
    await refreshScenarios();
    toast.success(t("scenario.renamed"));
  };

  const handleDeleteScenario = async () => {
    if (!deleteTarget) return;

    await api.deleteScenario(deleteTarget.id);
    await refreshScenarios();

    if (location.pathname === "/settings") {
      navigate("/my-skills");
    }

    toast.success(t("scenario.deleted"));
  };

  const handleRenameClick = (
    event: React.MouseEvent,
    scenario: { id: string; name: string; icon?: string | null }
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setRenameTarget(scenario);
  };

  const handleDeleteClick = (event: React.MouseEvent, scenario: { id: string; name: string }) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteTarget(scenario);
  };

  return (
    <>
      <div className="w-[220px] flex-shrink-0 bg-[#0F0F0F] border-r border-[#1C1C1C] h-full flex flex-col select-none relative z-10">
        <div className="h-8 w-full" style={{ WebkitAppRegion: "drag" } as CSSProperties} />

        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 mb-5 text-zinc-300 font-semibold text-sm">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Hammer className="w-3 h-3 text-white" />
            </div>
            {t("app.name")}
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors outline-none",
                    isActive
                      ? "bg-[#252528] text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-indigo-400" : "text-zinc-500")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-3 py-2 flex-1 overflow-y-auto scrollbar-hide">
          <div className="text-[10px] font-semibold text-zinc-500 mb-1.5 px-2 tracking-wider">
            {t("sidebar.scenarios").toUpperCase()}
          </div>
          <div className="space-y-[1px]">
            {scenarios.map((scenario) => {
              const isActive = activeScenario?.id === scenario.id;
              const scenarioIcon = getScenarioIconOption(scenario);
              const ScenarioIcon = scenarioIcon.icon;
              return (
                <div
                  key={scenario.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-md transition-colors",
                    isActive
                      ? "bg-[#252528]"
                      : "hover:bg-[#1A1A1A]"
                  )}
                >
                  <button
                    onClick={() => handleSwitchScenario(scenario.id)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-xs outline-none",
                      isActive
                        ? "font-medium text-white"
                        : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        isActive
                          ? `${scenarioIcon.activeClass} ${scenarioIcon.colorClass}`
                          : "border-[#232325] bg-[#151515] text-zinc-500 group-hover:border-[#2E2E33] group-hover:text-zinc-300"
                      )}
                    >
                      <ScenarioIcon className="h-3 w-3" />
                    </span>
                    <span className="flex-1 truncate">{scenario.name}</span>
                    {scenario.skill_count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[9px]",
                          isActive
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-[#1C1C1C] text-zinc-500 group-hover:bg-[#252528]"
                        )}
                      >
                        {scenario.skill_count}
                      </span>
                    )}
                  </button>

                  <div className="mr-1 flex items-center opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={(event) => handleRenameClick(event, scenario)}
                      className={cn(
                        "rounded p-1 text-zinc-600 transition hover:bg-[#1C1C1C] hover:text-zinc-300",
                        isActive && "text-zinc-400"
                      )}
                      title={t("common.rename")}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(event) => handleDeleteClick(event, scenario)}
                      className={cn(
                        "rounded p-1 text-zinc-600 transition hover:bg-[#1C1C1C] hover:text-red-400",
                        isActive && "text-zinc-400"
                      )}
                      title={t("common.delete")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-2 py-1.5 mt-1 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:bg-[#1A1A1A] transition-colors w-full outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("sidebar.newScenario")}
          </button>
        </div>

        <div className="p-3 mt-auto border-t border-[#1C1C1C]">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors outline-none",
              location.pathname === "/settings"
                ? "bg-[#252528] text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1A1A1A]"
            )}
          >
            <Settings
              className={cn(
                "w-3.5 h-3.5",
                location.pathname === "/settings" ? "text-indigo-400" : "text-zinc-500"
              )}
            />
            {t("sidebar.settings")}
          </Link>
        </div>
      </div>

      <CreateScenarioDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateScenario}
      />

      <RenameScenarioDialog
        open={renameTarget !== null}
        currentName={renameTarget?.name || ""}
        currentIcon={renameTarget?.icon}
        onClose={() => setRenameTarget(null)}
        onRename={handleRenameScenario}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        message={t("scenario.deleteConfirm", { name: deleteTarget?.name || "" })}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteScenario}
      />
    </>
  );
}
