import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Formik } from "formik";
import { CurrencyInput } from "./CurrencyInput";

vi.mock("react-intl", () => ({ useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }) }));
vi.mock("../ui", () => ({
  AppTextField: ({ slotProps }: { slotProps?: { input?: { startAdornment?: React.ReactNode; endAdornment?: React.ReactNode } } }) => (
    <div>
      <div data-testid="start-adornment">{slotProps?.input?.startAdornment}</div>
      <div data-testid="input-adornment">{slotProps?.input?.endAdornment}</div>
    </div>
  ),
}));

describe("CurrencyInput value units", () => {
  let root: Root | undefined;
  let container: HTMLDivElement;

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container?.remove();
  });

  it("shows a percent suffix and preserves any existing input adornment", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root?.render(
      <Formik initialValues={{ allowance: 20 }} onSubmit={() => undefined}>
        <CurrencyInput
          label="Allowance rate"
          name="allowance"
          valueUnit="%"
          InputProps={{ endAdornment: <span>existing</span> }}
        />
      </Formik>,
    ));

    expect(container.querySelector('[data-testid="input-adornment"]')?.textContent).toContain("existing");
    expect(container.querySelector('[data-testid="input-adornment"]')?.textContent).toContain("%");
  });

  it("shows default currency symbol and does not duplicate if startAdornment is provided", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root?.render(
      <Formik initialValues={{ basicPay: 50000 }} onSubmit={() => undefined}>
        <CurrencyInput
          label="Basic Pay"
          name="basicPay"
        />
      </Formik>,
    ));

    expect(container.querySelector('[data-testid="start-adornment"]')?.textContent).toContain("₹");

    // Re-render with explicit startAdornment to verify it overrides rather than duplicates
    await act(async () => root?.render(
      <Formik initialValues={{ basicPay: 50000 }} onSubmit={() => undefined}>
        <CurrencyInput
          label="Basic Pay"
          name="basicPay"
          InputProps={{ startAdornment: <span>custom-prefix</span> }}
        />
      </Formik>,
    ));

    expect(container.querySelector('[data-testid="start-adornment"]')?.textContent).toContain("custom-prefix");
    expect(container.querySelector('[data-testid="start-adornment"]')?.textContent).not.toContain("₹");
  });
});
