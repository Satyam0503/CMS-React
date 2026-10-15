import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import CalendarHeader from "./CalendarHeader";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("CalendarHeader layout", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders controls and ensures calendar-controls has nowrap layout", () => {
    const handleDateChange = vi.fn();
    const handleCategoryChange = vi.fn();
    const onImport = vi.fn();

    act(() => {
      root.render(
        <IntlProvider
          locale="en"
          messages={{
            "OCCASION.TYPES.CATEGORY": "Category",
            "OCCASION.TYPES.ALL": "All",
            "OCCASION.TYPES.HOLIDAY": "Holiday",
            "OCCASION.TYPES.EVENT": "Event",
            "OCCASION.TYPES.BIRTHDAY": "Birthday",
            "OCCASION.TYPES.ANNIVERSARY": "Anniversary",
          }}
        >
          <CalendarHeader
            selectedDate={dayjs("2026-10-15")}
            handleSelectedDateChange={handleDateChange}
            category={0}
            handleCategoryChange={handleCategoryChange}
            onImport={onImport}
          />
        </IntlProvider>
      );
    });

    const controls = container.querySelector(".calendar-controls") as HTMLElement;
    expect(controls).not.toBeNull();
    // Verify flex-wrap: nowrap is present to ensure datepicker and nav buttons stay on a single line
    expect(controls.style.flexWrap).toBe("nowrap");

    // Verify navigation and today button are rendered
    const todayBtn = container.querySelector(".calendar-today-button") as HTMLButtonElement;
    expect(todayBtn).not.toBeNull();
    expect(todayBtn.textContent).toContain("Today");

    // Click today button
    act(() => {
      todayBtn.click();
    });
    expect(handleDateChange).toHaveBeenCalled();

    // Verify import button is rendered
    const importBtn = container.querySelector(".calendar-import-button") as HTMLButtonElement;
    expect(importBtn).not.toBeNull();
    expect(importBtn.textContent).toContain("Import year");

    // Verify category label and select are rendered inline in calendar-filter
    const categoryLabel = container.querySelector(".calendar-filter-label") as HTMLElement;
    expect(categoryLabel).not.toBeNull();
    expect(categoryLabel.textContent).toContain("Category:");

    const categorySelect = container.querySelector(".calendar-filter-select") as HTMLElement;
    expect(categorySelect).not.toBeNull();
  });
});

