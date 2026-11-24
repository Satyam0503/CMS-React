import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RecruitmentTalentPoolCard from "./RecruitmentTalentPoolCard";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const { getRecruitmentTalentPoolMembers } = vi.hoisted(() => ({
  getRecruitmentTalentPoolMembers: vi.fn(),
}));

vi.mock("../../services", () => ({
  getRecruitmentTalentPoolMembers: (...args: unknown[]) => getRecruitmentTalentPoolMembers(...args),
}));

const roots: Root[] = [];

describe("RecruitmentTalentPoolCard", () => {
  const mockMembers = [
    {
      memberId: "mem-1",
      applicantId: "app-101",
      poolName: "Silver Medalists",
      tags: ["React", "TypeScript"],
      notes: "Strong candidate for future frontend lead role",
      status: "Active" as const,
      version: 1,
    },
    {
      memberId: "mem-2",
      applicantId: "app-102",
      poolName: "Campus",
      tags: ["Python", "AI"],
      notes: null,
      status: "Archived" as const,
      version: 1,
    },
  ];

  const mockLookup = {
    "app-101": {
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      vacancyName: "Senior Frontend Engineer",
    },
    "app-102": {
      fullName: "John Smith",
      email: "john.smith@example.com",
      vacancyName: "Graduate AI Engineer",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      while (roots.length) roots.pop()?.unmount();
    });
    document.body.innerHTML = "";
  });

  const renderComponent = async (props: {
    applicantLookup?: typeof mockLookup;
    onApplicantSelect?: (applicantId: string) => void;
  } = {}) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(
        <RecruitmentTalentPoolCard
          applicantLookup={props.applicantLookup}
          onApplicantSelect={props.onApplicantSelect}
        />
      );
    });

    return container;
  };

  it("renders title, badges, and candidate cards from talent pool", async () => {
    getRecruitmentTalentPoolMembers.mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        message: "",
        methodResult: mockMembers,
      },
    });

    const container = await renderComponent({ applicantLookup: mockLookup });

    expect(container.textContent).toContain("Talent Pool & Rediscovery");
    expect(container.textContent).toContain("Jane Doe");
    expect(container.textContent).toContain("Silver Medalists");
    expect(container.textContent).toContain("React");
    expect(container.textContent).toContain("TypeScript");
    expect(container.textContent).toContain("2 Total");
    expect(container.textContent).toContain("1 Active");
    expect(container.textContent).toContain("1 Archived");
  });

  it("filters candidates when user types in search input", async () => {
    getRecruitmentTalentPoolMembers.mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        message: "",
        methodResult: mockMembers,
      },
    });

    const container = await renderComponent({ applicantLookup: mockLookup });

    expect(container.textContent).toContain("Jane Doe");
    expect(container.textContent).toContain("John Smith");

    const searchInput = container.querySelector("input[placeholder*='Search by name']") as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      nativeSetter?.call(searchInput, "Jane");
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      searchInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.textContent).toContain("Jane Doe");
    expect(container.textContent).not.toContain("John Smith");
  });

  it("invokes onApplicantSelect when View button is clicked", async () => {
    const onSelect = vi.fn();
    getRecruitmentTalentPoolMembers.mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        message: "",
        methodResult: [mockMembers[0]],
      },
    });

    const container = await renderComponent({ applicantLookup: mockLookup, onApplicantSelect: onSelect });

    expect(container.textContent).toContain("Jane Doe");

    const viewButton = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("View"));
    expect(viewButton).toBeDefined();

    await act(async () => {
      viewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSelect).toHaveBeenCalledWith("app-101");
  });

  it("displays empty state message when no candidates exist", async () => {
    getRecruitmentTalentPoolMembers.mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        message: "",
        methodResult: [],
      },
    });

    const container = await renderComponent({ applicantLookup: mockLookup });

    expect(container.textContent).toContain(
      "No candidate records found in the talent pool for the selected criteria."
    );
  });
});
