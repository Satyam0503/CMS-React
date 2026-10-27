import { act } from "react-dom/test-utils";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRequest, postRequest } from "../../../../server/axios";
import { useWfhAttendanceTiming } from "./useWfhAttendanceTiming";

vi.mock("../../../../server/axios", () => ({ getRequest: vi.fn(), postRequest: vi.fn() }));

const mockGet = vi.mocked(getRequest as any);
const mockPost = vi.mocked(postRequest as any);

let root: Root | undefined;
let container: HTMLDivElement;

function Harness() {
  const state = useWfhAttendanceTiming();
  return <div>
    <output data-testid="timing">{JSON.stringify(state.timings.request1 ?? null)}</output>
    <output data-testid="error">{state.timingErrors.request1 ?? ""}</output>
    <output data-testid="clocking">{state.clockingRequestId ?? ""}</output>
    <button onClick={() => void state.loadTiming("request1").catch(() => undefined)}>load</button>
    <button onClick={() => void state.clockIn("request1")}>clock-in</button>
  </div>;
}

const response = (data: unknown) => ({ data, status: 200, statusText: "OK", headers: {}, config: { headers: {} } } as any);
const timing = { isApprovedForToday: true, requiredHours: 8, checkInTime: "2026-10-26T09:00:00Z" };

async function renderHarness() {
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => { root!.render(<Harness />); });
}

async function click(testId: string) {
  const button = container.querySelector<HTMLButtonElement>(`button:nth-of-type(${testId === "load" ? 1 : 2})`)!;
  await act(async () => { button.click(); await Promise.resolve(); await Promise.resolve(); });
}

describe("useWfhAttendanceTiming", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  afterEach(async () => {
    if (root) await act(async () => { root!.unmount(); });
    root = undefined;
  });

  it("clears stale timing when a refresh fails", async () => {
    mockGet.mockResolvedValueOnce(response({ methodResult: timing }));
    await renderHarness();
    await click("load");
    expect(container.querySelector('[data-testid="timing"]')?.textContent).toContain("checkInTime");

    mockGet.mockRejectedValueOnce(new Error("timing unavailable"));
    await click("load");
    expect(container.querySelector('[data-testid="timing"]')?.textContent).toBe("null");
    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe("timing unavailable");
  });

  it("refreshes timing after a failed clock mutation", async () => {
    mockGet.mockResolvedValue(response({ methodResult: timing }));
    mockPost.mockResolvedValueOnce(response({ success: false, message: "clock write rejected" }));
    await renderHarness();
    await click("clock-in");

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-testid="timing"]')?.textContent).toContain("checkInTime");
    expect(container.querySelector('[data-testid="clocking"]')?.textContent).toBe("");
  });

  it("prevents duplicate clock writes for the same request", async () => {
    let finishPost: ((value: unknown) => void) | undefined;
    mockPost.mockImplementationOnce(() => new Promise((resolve) => { finishPost = resolve; }));
    mockGet.mockResolvedValue(response({ methodResult: timing }));
    await renderHarness();

    const button = container.querySelector<HTMLButtonElement>("button:nth-of-type(2)")!;
    await act(async () => { button.click(); button.click(); await Promise.resolve(); });
    expect(mockPost).toHaveBeenCalledTimes(1);
    await act(async () => { finishPost!(response({ success: true })); await Promise.resolve(); await Promise.resolve(); });
    expect(container.querySelector('[data-testid="clocking"]')?.textContent).toBe("");
  });
});
