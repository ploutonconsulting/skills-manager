import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ManagedSkill, Scenario, ToolInfo } from "../lib/tauri";
import * as api from "../lib/tauri";

interface AppState {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  tools: ToolInfo[];
  managedSkills: ManagedSkill[];
  loading: boolean;
  refreshScenarios: () => Promise<void>;
  refreshTools: () => Promise<void>;
  refreshManagedSkills: () => Promise<void>;
  switchScenario: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [managedSkills, setManagedSkills] = useState<ManagedSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshScenarios = useCallback(async () => {
    try {
      const [s, active] = await Promise.all([
        api.getScenarios(),
        api.getActiveScenario(),
      ]);
      setScenarios(s);
      setActiveScenario(active);
    } catch (e) {
      console.error("Failed to load scenarios:", e);
    }
  }, []);

  const refreshTools = useCallback(async () => {
    try {
      const t = await api.getToolStatus();
      setTools(t);
    } catch (e) {
      console.error("Failed to load tools:", e);
    }
  }, []);

  const refreshManagedSkills = useCallback(async () => {
    try {
      const skills = await api.getManagedSkills();
      setManagedSkills(skills);
    } catch (e) {
      console.error("Failed to load managed skills:", e);
    }
  }, []);

  const handleSwitchScenario = useCallback(
    async (id: string) => {
      try {
        await api.switchScenario(id);
        await refreshScenarios();
      } catch (e) {
        console.error("Failed to switch scenario:", e);
      }
    },
    [refreshScenarios]
  );

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([refreshScenarios(), refreshTools(), refreshManagedSkills()]);
      setLoading(false);
    }
    init();
  }, [refreshManagedSkills, refreshScenarios, refreshTools]);

  return (
    <AppContext.Provider
      value={{
        scenarios,
        activeScenario,
        tools,
        managedSkills,
        loading,
        refreshScenarios,
        refreshTools,
        refreshManagedSkills,
        switchScenario: handleSwitchScenario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
