import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextEditor, { type TextEditorToken } from "./TextEditor";
import { IntlProvider } from "react-intl";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Polyfill Range.prototype.getBoundingClientRect for JSDOM
if (typeof Range !== "undefined" && !Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    toJSON: () => {},
  });
  Range.prototype.getClientRects = () =>
    ([] as unknown as DOMRectList);
}

vi.mock("../../modules/theme/useIsDark", () => ({
  useIsDark: () => false,
}));

const roots: Root[] = [];

describe("TextEditor Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      while (roots.length > 0) {
        roots.pop()?.unmount();
      }
    });
    document.body.innerHTML = "";
  });

  const renderComponent = async (props: {
    value: string;
    setValue: (val: string) => void;
    label?: string;
    helperText?: string;
    tokens?: TextEditorToken[];
    allowHtmlMode?: boolean;
    onResetDefault?: () => void;
    resetDefaultLabel?: string;
  }) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    await act(async () => {
      root.render(
        <IntlProvider locale="en" messages={{}}>
          <TextEditor {...props} />
        </IntlProvider>
      );
    });

    return container;
  };

  it("renders label, helper text, and editor surface", async () => {
    const setValue = vi.fn();
    const container = await renderComponent({
      value: "<p>Hello World</p>",
      setValue,
      label: "Custom Body",
      helperText: "Tokens are merged automatically.",
    });

    expect(container.textContent).toContain("Custom Body");
    expect(container.textContent).toContain("Tokens are merged automatically.");
    expect(container.querySelector(".text-editor")).not.toBeNull();
  });

  it("renders tokens and allows token insertion", async () => {
    const setValue = vi.fn();
    const tokens: TextEditorToken[] = [
      { token: "[CandidateName]", label: "Candidate Name" },
      { token: "[JobTitle]", label: "Job Title" },
    ];

    const container = await renderComponent({
      value: "<p>Dear </p>",
      setValue,
      tokens,
    });

    expect(container.textContent).toContain("Candidate Name");
    expect(container.textContent).toContain("Job Title");

    // Click CandidateName chip
    const candidateChip = Array.from(
      container.querySelectorAll(".MuiChip-root")
    ).find((el) => el.textContent?.includes("Candidate Name")) as HTMLElement;

    expect(candidateChip).toBeDefined();

    await act(async () => {
      candidateChip.click();
    });

    expect(setValue).toHaveBeenCalled();
  });

  it("toggles HTML mode and displays textarea when allowHtmlMode is true", async () => {
    const setValue = vi.fn();
    const container = await renderComponent({
      value: "<p>Visual Mode</p>",
      setValue,
      allowHtmlMode: true,
    });

    const htmlModeButton = Array.from(
      container.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("HTML"));

    expect(htmlModeButton).toBeDefined();

    await act(async () => {
      htmlModeButton?.click();
    });

    const textarea = container.querySelector("textarea");
    expect(textarea).not.toBeNull();
    expect(textarea?.value).toContain("<p>Visual Mode</p>");
  });

  it("renders reset button and triggers onResetDefault callback", async () => {
    const setValue = vi.fn();
    const onReset = vi.fn();
    const container = await renderComponent({
      value: "<p>Custom Text</p>",
      setValue,
      onResetDefault: onReset,
      resetDefaultLabel: "Restore template",
    });

    const resetBtn = Array.from(
      container.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("Restore template"));

    expect(resetBtn).toBeDefined();

    await act(async () => {
      resetBtn?.click();
    });

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
