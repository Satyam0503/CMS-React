import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as muiMaterial from "@mui/material";
import { useIsDark } from "./useIsDark";

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>("@mui/material");
  return {
    ...actual,
    useColorScheme: vi.fn(),
  };
});

describe("useIsDark hook", () => {
  const mockedColorScheme = vi.mocked(muiMaterial.useColorScheme);
  let root: Root | undefined;
  let container: HTMLDivElement;

  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-bs-theme");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container?.remove();
    vi.clearAllMocks();
  });

  const getHookValue = async () => {
    let value = false;
    const TestComponent = () => {
      value = useIsDark();
      return <div data-testid="is-dark">{String(value)}</div>;
    };
    await act(async () => {
      root?.render(<TestComponent />);
    });
    return value;
  };

  it("returns true when useColorScheme resolves to dark", async () => {
    mockedColorScheme.mockReturnValue({
      mode: "dark",
      systemMode: "dark",
      setMode: vi.fn(),
    } as any);

    const result = await getHookValue();
    expect(result).toBe(true);
  });

  it("returns false when useColorScheme resolves to light", async () => {
    mockedColorScheme.mockReturnValue({
      mode: "light",
      systemMode: "light",
      setMode: vi.fn(),
    } as any);

    const result = await getHookValue();
    expect(result).toBe(false);
  });

  it("resolves system mode when mode is 'system'", async () => {
    mockedColorScheme.mockReturnValue({
      mode: "system",
      systemMode: "dark",
      setMode: vi.fn(),
    } as any);

    const result = await getHookValue();
    expect(result).toBe(true);
  });

  it("falls back to DOM class check if useColorScheme throws or is unconfigured", async () => {
    mockedColorScheme.mockImplementation(() => {
      throw new Error("outside provider");
    });

    document.documentElement.classList.add("dark");
    const result = await getHookValue();
    expect(result).toBe(true);
  });
});
