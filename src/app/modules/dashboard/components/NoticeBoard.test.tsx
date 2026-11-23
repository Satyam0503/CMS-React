import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NoticeBoard from "./NoticeBoard";

const mockGetAllNotices = vi.fn();
vi.mock("../../noticeboard/services", () => ({
  getAllNotices: (...args: unknown[]) => mockGetAllNotices(...args),
}));

vi.mock("../../noticeboard/components/NoticeViewModel", () => ({
  NoticeViewModel: () => <div data-testid="notice-modal" />,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) => defaultMessage ?? id,
  }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = () => {
  container = document.createElement("div");
  root = createRoot(container);
  act(() => {
    root!.render(
      <MemoryRouter>
        <NoticeBoard />
      </MemoryRouter>,
    );
  });
};

describe("NoticeBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container = null;
  });

  it("renders loading state with dashboard card heading intact", async () => {
    mockGetAllNotices.mockReturnValue(new Promise(() => {})); // Never resolves
    render();

    expect(container?.textContent).toContain("PAGE.NOTICE_BOARD");
    expect(container?.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("renders empty state when no notices exist", async () => {
    mockGetAllNotices.mockResolvedValue({
      data: { success: true, methodResults: [] },
    });

    await act(async () => {
      render();
    });

    expect(container?.textContent).toContain("NOTICE.TITLES.NO_NOTICE");
  });

  it("renders notice items and view all action when notices exist", async () => {
    mockGetAllNotices.mockResolvedValue({
      data: {
        success: true,
        methodResults: [
          {
            noticeId: "n-1",
            userName: "Jane Smith",
            noticeTitle: "Annual Company Picnic",
            createdDateTime: "2026-11-15T09:00:00Z",
            viewedStatus: false,
          },
        ],
      },
    });

    await act(async () => {
      render();
    });

    expect(container?.textContent).toContain("Jane Smith");
    expect(container?.textContent).toContain("Annual Company Picnic");
    expect(container?.textContent).toContain("DASHBOARD.VIEW_ALL");
    const viewButton = container?.querySelector('button[type="button"]');
    expect(viewButton?.textContent).toBe("BUTTON.VIEW");
  });
});

