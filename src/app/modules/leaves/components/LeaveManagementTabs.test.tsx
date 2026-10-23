import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "../../../Redux/Reducers/userSlice";
import { LeaveManagementTabs } from "./LeaveManagementTabs";
import { Roles } from "../../../../utils/enums";

vi.mock("@mui/icons-material", () => ({
  AccountBalanceWallet: () => <span>Icon</span>,
  EditCalendar: () => <span>Icon</span>,
  HomeWork: () => <span>Icon</span>,
}));
vi.mock("@mui/icons-material/Policy", () => ({
  default: () => <span>Icon</span>,
  AccountBalanceWallet: () => <span>Icon</span>,
  EditCalendar: () => <span>Icon</span>,
  HomeWork: () => <span>Icon</span>,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

describe("LeaveManagementTabs component", () => {
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
    vi.clearAllMocks();
  });

  const renderWithPermissions = (modulePermission: string[]) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const store = configureStore({
      reducer: {
        user: userReducer,
      },
      preloadedState: {
        user: {
          userData: {
            userId: "user-1",
            companyId: "comp-1",
            roleType: Roles.Administrator,
            modulePermission,
            firstName: "Admin",
            lastName: "User",
            companyName: "Test Co",
          } as any,
        },
      },
    });

    act(() => {
      root?.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/leavemanagement"]}>
            <LeaveManagementTabs />
          </MemoryRouter>
        </Provider>
      );
    });

    return container;
  };

  it("shows Work from home tab when Work_From_Home module permission is granted", () => {
    const el = renderWithPermissions(["Leave_Management.View", "Work_From_Home.ViewOwn"]);
    expect(el.textContent).toContain("Work from home");
  });

  it("hides Work from home tab when Work_From_Home module is disabled", () => {
    const el = renderWithPermissions(["Leave_Management.View"]);
    expect(el.textContent).not.toContain("Work from home");
  });
});
