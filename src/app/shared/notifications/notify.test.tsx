import { beforeEach, describe, expect, it, vi } from "vitest";

const toast = Object.assign(vi.fn(), {
  isActive: vi.fn(), loading: vi.fn(), update: vi.fn(),
});
vi.mock("react-toastify", () => ({ toast }));
vi.mock("./notificationConfig", () => ({ readNotificationConfig: () => ({ autoClose: 3500 }) }));

describe("notifications facade", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deduplicates a visible message with the same key", async () => {
    toast.mockReturnValue("toast-1");
    const { notifications } = await import("./notify");
    notifications.info("Saved", { dedupeKey: "save" });
    toast.isActive.mockReturnValue(true);
    notifications.info("Saved", { dedupeKey: "save" });
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it("replaces a loading toast using its stable ID", async () => {
    const { notifications } = await import("./notify");
    notifications.resolve("toast-7", "success", "Saved");
    expect(toast.update).toHaveBeenCalledWith("toast-7", expect.objectContaining({ isLoading: false, type: "success" }));
  });
});
