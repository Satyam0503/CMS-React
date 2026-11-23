import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HiringManagerReviewQueue from "./HiringManagerReviewQueue";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mockGetPending = vi.fn();
const mockReview = vi.fn();
vi.mock("./services", () => ({
  getPendingManagerReviews: (...args: any[]) => mockGetPending(...args),
  reviewRecruitmentHiringDecision: (...args: any[]) => mockReview(...args),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const item = {
  decisionId: "decision-1", applicantId: "candidate-1", applicantName: "Taylor Candidate",
  email: "taylor@example.test", vacancyId: "job-1", vacancyTitle: "Product Designer",
  recruiterNotes: "Strong portfolio and relevant experience", hiringManagerUserId: "manager-1",
  requestedAtUtc: "2026-11-17T10:00:00Z", version: 4,
};
let root: Root;
let container: HTMLDivElement;

describe("HiringManagerReviewQueue", () => {
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    mockGetPending.mockReset().mockResolvedValue({ data: { success: true, methodResult: [item] } });
    mockReview.mockReset().mockResolvedValue({ data: { success: true, message: "Candidate approved." } });
  });
  afterEach(() => { act(() => root.unmount()); document.body.replaceChildren(); });

  it("shows the assigned recommendation and sends the version on approval", async () => {
    await act(async () => { root.render(<HiringManagerReviewQueue />); await Promise.resolve(); });
    expect(container.textContent).toContain("Taylor Candidate");
    expect(container.textContent).toContain("Strong portfolio and relevant experience");
    const approve = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Approve");
    expect(approve).toBeTruthy();
    await act(async () => { approve!.dispatchEvent(new MouseEvent("click", { bubbles: true })); await Promise.resolve(); await Promise.resolve(); });
    expect(mockReview).toHaveBeenCalledWith(expect.objectContaining({ decisionId: "decision-1", decision: "Approve", expectedVersion: 4 }));
  });

  it("reuses the same idempotency key when a manager retries a failed submission", async () => {
    mockReview.mockRejectedValueOnce(new Error("Stage update is still being recovered."));
    await act(async () => { root.render(<HiringManagerReviewQueue />); await Promise.resolve(); });
    const approve = () => Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Approve");

    await act(async () => { approve()!.dispatchEvent(new MouseEvent("click", { bubbles: true })); await Promise.resolve(); await Promise.resolve(); });
    const firstKey = mockReview.mock.calls[0][0].idempotencyKey;
    await act(async () => { approve()!.dispatchEvent(new MouseEvent("click", { bubbles: true })); await Promise.resolve(); await Promise.resolve(); });

    expect(mockReview).toHaveBeenCalledTimes(2);
    expect(mockReview.mock.calls[1][0].idempotencyKey).toBe(firstKey);
  });

  it("requires a rejection reason before enabling the final rejection", async () => {
    await act(async () => { root.render(<HiringManagerReviewQueue />); await Promise.resolve(); });
    const reject = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Reject");
    await act(async () => { reject!.dispatchEvent(new MouseEvent("click", { bubbles: true })); await Promise.resolve(); });
    const confirm = Array.from(document.body.querySelectorAll("button")).find((button) => button.textContent?.includes("Confirm rejection"));
    expect(confirm?.hasAttribute("disabled")).toBe(true);
    expect(mockReview).not.toHaveBeenCalled();
  });
});
