import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import RecruitmentResumeScanHealthCard from "./RecruitmentResumeScanHealthCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const { getRecruitmentResumeScanHealth } = vi.hoisted(() => ({ getRecruitmentResumeScanHealth: vi.fn() }));
vi.mock("../../services", () => ({ getRecruitmentResumeScanHealth: (...args: unknown[]) => getRecruitmentResumeScanHealth(...args) }));

const roots: Root[] = [];

describe("RecruitmentResumeScanHealthCard", () => {
  afterEach(() => {
    act(() => {
      while (roots.length) roots.pop()?.unmount();
    });
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("shows tenant-wide scan backlog counts and clarifies configuration status", async () => {
    getRecruitmentResumeScanHealth.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          generatedAtUtc: "2026-11-19T00:00:00Z",
          scannerConfigured: true,
          scannerReachable: true,
          applicantsWithResume: 12,
          pendingInitialScans: 2,
          scannerUnavailable: 1,
          infectedAwaitingQuarantine: 1,
          staleCleanScans: 3,
        },
      },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentResumeScanHealthCard />));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(container.textContent).toContain("Scanner reachable");
    expect(container.textContent).toContain("signature freshness is not checked");
    expect(container.textContent).toContain("Awaiting first scan");
    expect(container.textContent).toContain("Quarantine pending");
    expect(container.textContent).toContain("12 candidate records have a resume reference");
  });

  it("distinguishes a configured scanner that does not respond", async () => {
    getRecruitmentResumeScanHealth.mockResolvedValue({
      data: { success: true, methodResult: { generatedAtUtc: "2026-11-19T00:00:00Z", scannerConfigured: true, scannerReachable: false, applicantsWithResume: 0, pendingInitialScans: 0, scannerUnavailable: 0, infectedAwaitingQuarantine: 0, staleCleanScans: 0 } },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentResumeScanHealthCard />));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(container.textContent).toContain("Scanner unreachable");
    expect(container.textContent).toContain("did not respond to its health check");
  });

  it("shows a retry message when operational status is unavailable", async () => {
    getRecruitmentResumeScanHealth.mockRejectedValue(new Error("network unavailable"));
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => root.render(<RecruitmentResumeScanHealthCard />));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(container.textContent).toContain("Resume scanning status could not be loaded");
    expect(container.textContent).toContain("this does not change application decisions");
  });
});
