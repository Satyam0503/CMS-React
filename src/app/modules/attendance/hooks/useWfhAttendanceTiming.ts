import { useCallback, useEffect, useRef, useState } from "react";
import { getRequest, postRequest } from "../../../../server/axios";

export type WfhAttendanceTiming = {
  isApprovedForToday: boolean;
  timeZoneId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  requiredHours: number;
  halfDayRequiredHours?: number;
  status?: string;
  isHalfDay?: boolean;
  isUnderHours?: boolean;
  isCheckInOpen?: boolean;
  checkInNotice?: string;
};

type TimingResponse = { methodResult?: WfhAttendanceTiming };
type MutationResponse = { success: boolean; message?: string };
type ClockResult = { success: boolean; error?: string };

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/** Shared timing state and clock mutation behavior for both employee WFH surfaces. */
export function useWfhAttendanceTiming() {
  const [timings, setTimings] = useState<Record<string, WfhAttendanceTiming>>({});
  const [timingErrors, setTimingErrors] = useState<Record<string, string>>({});
  const [clockingRequestId, setClockingRequestId] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const requestSequenceRef = useRef(new Map<string, number>());
  const clockingRef = useRef(new Set<string>());

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadTiming = useCallback(async (requestId: string): Promise<WfhAttendanceTiming> => {
    const sequence = (requestSequenceRef.current.get(requestId) ?? 0) + 1;
    requestSequenceRef.current.set(requestId, sequence);
    try {
      const { data } = await getRequest<TimingResponse>(`api/wfh/requests/${requestId}/timing`);
      if (!data.methodResult) throw new Error("Current WFH attendance timing was not returned.");
      if (mountedRef.current && requestSequenceRef.current.get(requestId) === sequence) {
        setTimings((current) => ({ ...current, [requestId]: data.methodResult! }));
        setTimingErrors((current) => {
          const next = { ...current };
          delete next[requestId];
          return next;
        });
      }
      return data.methodResult;
    } catch (error) {
      if (mountedRef.current && requestSequenceRef.current.get(requestId) === sequence) {
        setTimings((current) => {
          const next = { ...current };
          delete next[requestId];
          return next;
        });
        setTimingErrors((current) => ({
          ...current,
          [requestId]: getErrorMessage(error, "Unable to refresh WFH attendance timing."),
        }));
      }
      throw error;
    }
  }, []);

  const clearTiming = useCallback((requestId?: string) => {
    if (!mountedRef.current) return;
    if (!requestId) {
      setTimings({});
      setTimingErrors({});
      return;
    }
    setTimings((current) => {
      const next = { ...current };
      delete next[requestId];
      return next;
    });
    setTimingErrors((current) => {
      const next = { ...current };
      delete next[requestId];
      return next;
    });
  }, []);

  const clock = useCallback(async (requestId: string, action: "check-in" | "check-out", remarks?: string): Promise<ClockResult> => {
    if (clockingRef.current.has(requestId)) return { success: false, error: "A WFH clock action is already in progress." };
    clockingRef.current.add(requestId);
    setClockingRequestId(requestId);
    let mutationError: string | undefined;
    try {
      const payload = action === "check-out" ? { remarks: remarks ?? "" } : {};
      const { data } = await postRequest<typeof payload, MutationResponse>(`api/wfh/requests/${requestId}/${action}`, payload);
      if (!data.success) throw new Error(data.message || `WFH ${action} could not be recorded.`);
    } catch (error) {
      mutationError = getErrorMessage(error, `WFH ${action} could not be recorded.`);
    }

    try {
      await loadTiming(requestId);
    } catch {
      // loadTiming clears the stale value and records the visible refresh error.
    } finally {
      clockingRef.current.delete(requestId);
      if (mountedRef.current) setClockingRequestId((current) => current === requestId ? null : current);
    }
    return mutationError ? { success: false, error: mutationError } : { success: true };
  }, [loadTiming]);

  const clockIn = useCallback((requestId: string) => clock(requestId, "check-in"), [clock]);
  const clockOut = useCallback((requestId: string, remarks: string) => clock(requestId, "check-out", remarks), [clock]);

  return { timings, timingErrors, clockingRequestId, loadTiming, clearTiming, clockIn, clockOut };
}
