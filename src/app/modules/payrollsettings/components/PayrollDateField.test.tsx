import type { ReactElement } from "react";
import type { Dayjs } from "dayjs";
import { describe, expect, it, vi } from "vitest";
import { PayrollDateField } from "./PayrollDateField";

vi.mock("../../../shared/components/C_DatePicker", () => ({ default: () => null }));

describe("PayrollDateField", () => {
  it("adapts ISO date strings and date bounds to the shared picker without changing API values", () => {
    const onChange = vi.fn();
    const picker = PayrollDateField({
      label: "Effective to",
      value: "2026-11-01",
      onChange,
      minDate: "2026-10-01",
    }) as ReactElement<{ value: Dayjs | null; minDate?: Dayjs; setValue: (value: Dayjs | null) => void }>;

    expect(picker.props.value?.format("YYYY-MM-DD")).toBe("2026-11-01");
    expect(picker.props.minDate?.format("YYYY-MM-DD")).toBe("2026-10-01");
    picker.props.setValue(null);
    expect(onChange).toHaveBeenCalledWith("");
    picker.props.setValue(picker.props.value);
    expect(onChange).toHaveBeenLastCalledWith("2026-11-01");
  });
});
