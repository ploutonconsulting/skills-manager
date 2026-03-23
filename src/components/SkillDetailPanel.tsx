import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Folder, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../utils";
import {
  getSkillDocument,
  type ManagedSkill,
  type SkillDocument,
  type SkillToolToggle,
} from "../lib/tauri";
import { SkillMarkdown } from "./SkillMarkdown";

interface Props {
  skill: ManagedSkill | null;
  onClose: () => void;
  toolToggles?: SkillToolToggle[] | null;
  togglingTool?: string | null;
  onToggleTool?: (tool: string, enabled: boolean) => void;
}

export function SkillDetailPanel({
  skill,
  onClose,
  toolToggles,
  togglingTool,
  onToggleTool,
}: Props) {
  const { t } = useTranslation();
  const [doc, setDoc] = useState<SkillDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!skill) return;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    // Loading state is intentionally toggled when input skill changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getSkillDocument(skill.id)
      .then((nextDoc) => {
        if (requestId === requestIdRef.current) {
          setDoc(nextDoc);
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setDoc(null);
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      });
  }, [skill]);

  if (!skill) return null;
  const activeDoc = doc?.skill_id === skill.id ? doc : null;

  return createPortal(
    <div className="fixed inset-y-0 right-0 left-[220px] z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full min-h-0 w-full flex-col border-l border-border-subtle bg-bg-secondary shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="border-b border-border-subtle px-6 pt-6 pb-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <h2 className="min-w-0 text-[30px] font-semibold leading-tight tracking-tight text-primary">
              <span className="block truncate">{skill.name}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-secondary p-1.5 rounded-[4px] hover:bg-surface-hover transition-colors outline-none shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {skill.description && (
            <p className="text-[15px] leading-7 text-secondary line-clamp-3">{skill.description}</p>
          )}
          <div className="mt-4 flex min-w-0 items-center gap-2 text-[13px] text-muted">
            <Folder className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono truncate" title={skill.central_path}>
              {skill.central_path}
            </span>
          </div>
        </div>

        {toolToggles && onToggleTool && (
          <div className="border-b border-border-subtle px-6 py-3">
            <div className="mb-2.5 flex items-center justify-between text-[13px]">
              <span className="font-medium text-secondary">{t("mySkills.agentTogglesTitle")}</span>
              <span className="rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[12px] text-muted">
                {t("mySkills.syncSummary", {
                  synced: toolToggles.filter((item) => item.enabled).length,
                  total: toolToggles.length,
                })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {toolToggles.map((toggle) => {
                const disabledReason = !toggle.installed
                  ? t("mySkills.agentToggleNotInstalled")
                  : !toggle.globally_enabled
                    ? t("mySkills.agentToggleDisabledGlobally")
                    : "";
                const disabled = !toggle.installed || !toggle.globally_enabled;
                const loadingToggle = togglingTool === toggle.tool;
                return (
                  <div
                    key={toggle.tool}
                    className={cn(
                      "flex items-center gap-2 rounded-[6px] border px-2.5 py-2 text-[12.5px]",
                      toggle.enabled ? "border-border bg-surface" : "border-border-subtle bg-bg-secondary",
                      disabled && "opacity-55"
                    )}
                    title={disabledReason}
                  >
                    <button
                      onClick={() => onToggleTool(toggle.tool, !toggle.enabled)}
                      disabled={disabled || loadingToggle}
                      className="shrink-0 outline-none"
                      title={toggle.enabled ? t("settings.disableAgent") : t("settings.enableAgent")}
                    >
                      {loadingToggle ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />
                      ) : toggle.enabled ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-secondary">
                        {toggle.display_name}
                      </div>
                      {disabledReason && <div className="truncate text-[12px] text-muted">{disabledReason}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 scrollbar-hide">
          {loading ? (
            <div className="text-[13px] text-muted text-center mt-12">{t("common.loading")}</div>
          ) : activeDoc ? (
            <SkillMarkdown content={activeDoc.content} />
          ) : (
            <div className="text-[13px] text-muted text-center mt-12">{t("common.documentMissing")}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
