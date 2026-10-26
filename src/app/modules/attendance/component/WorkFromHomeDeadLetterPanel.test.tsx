import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getRequest: vi.fn(), postRequest: vi.fn(), toastError: vi.fn(), toastSuccess: vi.fn() }));

vi.mock("../../../../server/axios", () => ({ getRequest: mocks.getRequest, postRequest: mocks.postRequest }));
vi.mock("react-toastify", () => ({ toast: { error: mocks.toastError, success: mocks.toastSuccess } }));
vi.mock("@mui/icons-material", () => ({ Refresh: () => null, Replay: () => null }));
vi.mock("../../../shared/components/ui", () => ({
  AppButton: ({ children, onClick, disabled }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button disabled={disabled} onClick={onClick}>{children}</button>,
  AppTextField: ({ multiline, onChange, value }: { multiline?: boolean; onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>; value?: string }) =>
    multiline ? <textarea value={value} onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>} /> : <input value={value} onChange={onChange as React.ChangeEventHandler<HTMLInputElement>} />,
}));

import WorkFromHomeDeadLetterPanel from "./WorkFromHomeDeadLetterPanel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];
const event = {
  eventId: "event-123",
  requestId: "request-456",
  eventType: "NOTIFICATION",
  createdDate: "2026-10-26T08:00:00Z",
  availableAtUtc: "2026-10-26T09:00:00Z",
  attemptCount: 10,
  replayCount: 0,
};

describe("WorkFromHomeDeadLetterPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRequest.mockResolvedValue({ data: { success: true, methodResults: [event], totalRecords: 1 } });
    mocks.postRequest.mockResolvedValue({ data: { success: true } });
  });

  afterEach(async () => {
    await act(async () => roots.splice(0).forEach((root) => root.unmount()));
    document.body.innerHTML = "";
  });

  it("loads tenant-scoped failures and records a reason when queueing a retry", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    roots.push(root);

    await act(async () => root.render(<WorkFromHomeDeadLetterPanel />));
    expect(mocks.getRequest).toHaveBeenCalledWith("api/wfh/outbox/dead-letter?pageNo=1&pageSize=10");
    expect(document.body.textContent).toContain("event-123");
    expect(document.body.textContent).toContain("request-456");

    const retryButton = Array.from(document.body.querySelectorAll("button")).find((button) => button.textContent?.includes("Retry with reason"));
    expect(retryButton).toBeTruthy();
    await act(async () => retryButton!.click());
    const textarea = document.body.querySelector("textarea");
    expect(textarea).toBeTruthy();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      setter?.call(textarea, "Verified delivery recovery");
      textarea!.dispatchEvent(new Event("input", { bubbles: true }));
      textarea!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const queueButton = Array.from(document.body.querySelectorAll("button")).find((button) => button.textContent?.includes("Queue retry"));
    expect(queueButton).toBeTruthy();
    await act(async () => queueButton!.click());

    expect(mocks.postRequest).toHaveBeenCalledWith("api/wfh/outbox/dead-letter/event-123/replay", { reason: "Verified delivery recovery" });
    expect(mocks.toastSuccess).toHaveBeenCalled();
    expect(mocks.getRequest).toHaveBeenCalledTimes(2);
  });
});
