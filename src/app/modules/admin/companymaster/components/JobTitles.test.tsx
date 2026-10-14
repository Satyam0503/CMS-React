import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JobTitles } from "./JobTitles";
import * as adminServices from "../../adminservices";

let lastAttributeTableProps: any = null;

vi.mock("@mui/icons-material", () => ({}));

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./AttributeTable", () => ({
  AttributeTable: (props: any) => {
    lastAttributeTableProps = props;
    return <div data-testid="attribute-table">{props.attributeName}</div>;
  },
}));

vi.mock("../../adminservices", () => ({
  getJobTitles: vi.fn(),
  addUpdateJobTitles: vi.fn(),
  deleteAttributeItem: vi.fn(),
  getAllDepartments: vi.fn(),
}));

describe("JobTitles Component", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    lastAttributeTableProps = null;
    vi.clearAllMocks();
  });

  it("fetches job titles on mount without fetching departments", async () => {
    const mockTitles = [
      {
        jobTitleId: "jt-1",
        isActive: true,
        titles: { en: "Software Engineer" },
      },
    ];

    vi.mocked(adminServices.getJobTitles).mockResolvedValue({
      data: {
        success: true,
        methodResults: mockTitles,
        statusCode: 200,
        message: "",
        errors: [],
        totalRecords: 1,
      },
    } as any);

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<JobTitles />);
    });

    expect(adminServices.getJobTitles).toHaveBeenCalledTimes(1);
    expect(adminServices.getAllDepartments).not.toHaveBeenCalled();

    expect(lastAttributeTableProps).not.toBeNull();
    expect(lastAttributeTableProps.selectField).toBeUndefined();
    expect(lastAttributeTableProps.selectLabel).toBeUndefined();
    expect(lastAttributeTableProps.selectOptions).toBeUndefined();
    expect(lastAttributeTableProps.attributeData).toEqual(mockTitles);
  });

  it("sends departmentId as null when saving job titles", async () => {
    vi.mocked(adminServices.getJobTitles).mockResolvedValue({
      data: {
        success: true,
        methodResults: [],
        statusCode: 200,
        message: "",
        errors: [],
        totalRecords: 0,
      },
    } as any);

    vi.mocked(adminServices.addUpdateJobTitles).mockResolvedValue({
      data: {
        success: true,
        statusCode: 200,
        message: "Updated",
        errors: [],
      },
    } as any);

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(<JobTitles />);
    });

    expect(lastAttributeTableProps).toBeDefined();

    // Trigger update
    await act(async () => {
      await lastAttributeTableProps.handleAttributeUpdate([
        {
          jobTitleId: "jt-1",
          isActive: true,
          titles: { en: "Engineering Lead" },
        },
      ]);
    });

    expect(adminServices.addUpdateJobTitles).toHaveBeenCalledWith([
      {
        jobTitleId: "jt-1",
        departmentId: null,
        isActive: true,
        titles: [{ language: "en", label: "Engineering Lead" }],
      },
    ]);
  });
});

