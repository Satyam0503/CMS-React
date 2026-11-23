import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CandidateOfferResponse from "./CandidateOfferResponse";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockRecordOfferView = vi.fn();
const mockRespondOffer = vi.fn();
let mockSearch = "?token=valid-test-token-123";

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams(mockSearch)],
}));

vi.mock("../services", () => ({
  recordRecruitmentOfferView: (...args: any[]) => mockRecordOfferView(...args),
  respondToRecruitmentOffer: (...args: any[]) => mockRespondOffer(...args),
}));

const roots: Root[] = [];

describe("CandidateOfferResponse Component with E-Signature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "?token=valid-test-token-123";

    mockRecordOfferView.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          offerId: "off-101",
          version: 2,
          candidateName: "Priya Sharma",
          jobTitle: "Senior Software Engineer",
          currency: "INR",
          salary: 2400000,
          totalCtc: 2600000,
          startDateUtc: "2026-12-01T00:00:00Z",
          status: "Sent",
          actionType: "AcceptOffer",
        },
      },
    });

    mockRespondOffer.mockResolvedValue({
      data: {
        success: true,
        methodResult: "Offer accepted successfully",
        message: "Offer accepted successfully",
      },
    });
  });

  afterEach(() => {
    while (roots.length > 0) {
      const root = roots.pop();
      act(() => {
        root?.unmount();
      });
    }
    document.body.innerHTML = "";
  });

  it("displays missing token error when no token parameter is supplied", async () => {
    mockSearch = "";
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<CandidateOfferResponse />);
    });

    expect(container.textContent).toContain("This offer link is missing its secure token.");
  });

  it("loads and displays candidate offer details and signature interface", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<CandidateOfferResponse />);
    });

    expect(mockRecordOfferView).toHaveBeenCalledWith("valid-test-token-123");
    expect(container.textContent).toContain("Priya Sharma");
    expect(container.textContent).toContain("Senior Software Engineer");
    expect(container.textContent).toContain("Draw Signature");
    expect(container.textContent).toContain("Type Signature");
    expect(container.textContent).toContain("Sign & Accept Offer");
  });

  it("shows the saved response and removes decision controls after a consumed-link reload", async () => {
    mockRecordOfferView.mockResolvedValueOnce({
      data: {
        success: true,
        methodResult: {
          offerId: "off-101",
          version: 3,
          candidateName: "Priya Sharma",
          jobTitle: "Senior Software Engineer",
          currency: "INR",
          totalCtc: 2600000,
          status: "Accepted",
          actionType: "AcceptOffer",
        },
      },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<CandidateOfferResponse />);
    });

    expect(container.textContent).toContain("Your response has already been recorded as Accepted");
    expect(container.textContent).not.toContain("Sign & Accept Offer");
    expect(container.querySelector("select")).toBeNull();
    expect(mockRespondOffer).not.toHaveBeenCalled();
  });

  it("offers a safe reload retry when committed response follow-up work is unavailable", async () => {
    mockRecordOfferView.mockResolvedValueOnce({
      data: {
        success: false,
        statusCode: 503,
        message: "Your response is saved, but follow-up processing is still preparing.",
      },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<CandidateOfferResponse />);
    });

    expect(container.textContent).toContain("Your response is saved, but follow-up processing is still preparing.");
    expect(container.textContent).toContain("Retry response recovery");
  });

  it("requires legal consent and signature before submitting acceptance", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<CandidateOfferResponse />);
    });

    // Attempt to submit without drawing or consenting
    const submitBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sign & Accept Offer")
    );
    expect(submitBtn).toBeDefined();

    await act(async () => {
      submitBtn?.click();
    });

    // Should not have submitted to the backend API yet
    expect(mockRespondOffer).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Please draw or type your digital signature before accepting.");
  });

  it("successfully signs and accepts offer when signature and consent are provided", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(<CandidateOfferResponse />);
    });

    // Switch to type tab
    const typeTab = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Type Signature")
    );
    expect(typeTab).toBeDefined();

    await act(async () => {
      typeTab?.click();
    });

    // Toggle consent checkbox
    const checkbox = container.querySelector("input[type='checkbox']") as HTMLInputElement | null;
    expect(checkbox).toBeDefined();

    await act(async () => {
      checkbox?.click();
    });

    // Click submit
    const submitBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Sign & Accept Offer")
    );

    await act(async () => {
      submitBtn?.click();
    });

    expect(mockRespondOffer).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "valid-test-token-123",
        decision: "Accepted",
        idempotencyKey: expect.any(String),
        signerLegalName: "Priya Sharma",
        legalConsent: true,
      })
    );
    expect(container.textContent).toContain("Response Successfully Submitted");
    expect(container.textContent).toContain("Electronic signature saved for Priya Sharma with this offer response.");
    expect(container.textContent).not.toContain("cryptographic signature");
  });
});
