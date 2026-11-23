import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicApplicationStatus } from "../../applynow/publicCareerService";
import { PublicApplicationStatusPage } from "./PublicApplicationStatusPage";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("../../applynow/publicCareerService", () => ({ getPublicApplicationStatus: vi.fn() }));
vi.mock("../components/CareerHeader", () => ({ CareerHeader: () => null }));
vi.mock("react-router-dom", () => ({ Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a> }));

const mockGetStatus = vi.mocked(getPublicApplicationStatus);
let root: Root | undefined;
let container: HTMLDivElement;

async function renderPage() {
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => { root!.render(<PublicApplicationStatusPage />); });
}

async function submit(reference: string, email: string) {
  const fields = container.querySelectorAll("input");
  const referenceField = fields[0];
  const emailField = fields[1];
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(referenceField, reference);
    referenceField.dispatchEvent(new Event("input", { bubbles: true }));
    setter?.call(emailField, email);
    emailField.dispatchEvent(new Event("input", { bubbles: true }));
    container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe("PublicApplicationStatusPage", () => {
  beforeEach(() => mockGetStatus.mockReset());

  afterEach(async () => {
    if (root) await act(async () => { root!.unmount(); });
    root = undefined;
  });

  it("shows only the broad progress result after a valid lookup", async () => {
    mockGetStatus.mockResolvedValue({ data: { success: true, methodResult: {
      status: "Interview process", jobTitle: "QA Engineer", companyName: "Codeji", lastUpdatedAtUtc: "2026-11-18T00:00:00Z",
    } } } as any);
    await renderPage();
    await submit("42e38c01-3c7c-4c5a-965c-7be18481e4c0", "candidate@example.com");

    expect(mockGetStatus).toHaveBeenCalledWith("42e38c01-3c7c-4c5a-965c-7be18481e4c0", "candidate@example.com");
    expect(container.textContent).toContain("Interview process");
    expect(container.textContent).toContain("QA Engineer · Codeji");
    expect(container.querySelector('[aria-live="polite"]')?.textContent).not.toContain("notes");
  });

  it("shows a generic lookup error without rendering application details", async () => {
    mockGetStatus.mockResolvedValue({ data: { success: false, message: "We couldn't find an application with those details. Check them and try again." } } as any);
    await renderPage();
    await submit("00000000-0000-0000-0000-000000000000", "candidate@example.com");

    expect(container.textContent).toContain("We couldn't find an application with those details.");
    expect(container.textContent).not.toContain("Applied role");
  });
});
