import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import dayjs from "dayjs";
import { userReducer, setCurrentUser } from "../../../../Redux/Reducers/userSlice";
import { LeaveApplication } from "./LeaveApplication";

const mocks = vi.hoisted(() => ({ getRequest: vi.fn() }));

vi.mock("../../../../../server/axios", () => ({
  getRequest: mocks.getRequest,
  postRequest: vi.fn(),
  putRequest: vi.fn(),
  patchRequest: vi.fn(),
  deleteRequest: vi.fn(),
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

describe("LeaveApplication WFH policy loading", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) act(() => root?.unmount());
    root = null;
    container?.remove();
    container = null;
    vi.clearAllMocks();
  });

  it("shows eligible WFH when permissions hydrate even if no WFH leave-policy mapping is returned", async () => {
    let resolvePolicies!: (value: unknown) => void;
    const policyResponse = new Promise((resolve) => { resolvePolicies = resolve; });
    mocks.getRequest.mockImplementation((url: string) => {
      if (url === "api/LeaveManagement/me/policies") return policyResponse;
      if (url === "api/wfh/context") return Promise.resolve({ data: { methodResult: { isEligible: true, weeklyLimit: 1 } } });
      return Promise.resolve({ data: [] });
    });

    const store = configureStore({ reducer: { user: userReducer } });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root!.render(
        <Provider store={store}>
          <MemoryRouter>
            <LeaveApplication
              edit={false}
              open
              handleClose={vi.fn()}
              leaveTypeBalance={[]}
              initialValues={{
                userId: "employee-1",
                leavePolicyId: "",
                startDate: dayjs("2026-10-28"),
                endDate: dayjs("2026-10-28"),
                isHalfDay: false,
                reason: "",
              }}
            />
          </MemoryRouter>
        </Provider>
      );
    });

    await act(async () => {
      store.dispatch(setCurrentUser({
        userId: "employee-1",
        companyId: "company-1",
        // The role editor exposes these existing generic grants; WFH endpoints
        // must support them as self-only permissions for backwards compatibility.
        modulePermission: ["Work_From_Home.View", "Work_From_Home.Create"],
      } as any));
      resolvePolicies({ data: { methodResults: [] } });
      await Promise.resolve();
      await Promise.resolve();
    });

    const policySelect = document.body.querySelector('[role="combobox"]');
    expect(policySelect).not.toBeNull();
    await act(async () => {
      policySelect!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await Promise.resolve();
    });

    expect(document.body.textContent).toContain("Work from home");
  });
});
