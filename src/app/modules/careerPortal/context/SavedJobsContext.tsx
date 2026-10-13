import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useCareerVisitor } from "../hooks/useCareerVisitor";
import { getSavedJobs } from "../services/careerPortalService";

type SavedJobsContextValue = {
  savedIds: Set<string>;
  loading: boolean;
  setJobSaved: (publicJobId: string, saved: boolean) => void;
  refreshSavedJobs: () => Promise<void>;
};

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

export const SavedJobsProvider = ({ children }: { children: React.ReactNode }) => {
  const { visitorToken, sessionToken } = useCareerVisitor();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refreshSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getSavedJobs(visitorToken, sessionToken);
      setSavedIds(new Set((data.methodResults ?? []).map((job) => job.publicJobId)));
    } catch {
      // Saving remains available if this non-critical initial read cannot complete.
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [sessionToken, visitorToken]);

  useEffect(() => { void refreshSavedJobs(); }, [refreshSavedJobs]);

  const setJobSaved = useCallback((publicJobId: string, saved: boolean) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (saved) next.add(publicJobId);
      else next.delete(publicJobId);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ savedIds, loading, setJobSaved, refreshSavedJobs }), [loading, refreshSavedJobs, savedIds, setJobSaved]);
  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
};

export const useSavedJobs = () => {
  const context = useContext(SavedJobsContext);
  if (!context) throw new Error("useSavedJobs must be used within SavedJobsProvider.");
  return context;
};
