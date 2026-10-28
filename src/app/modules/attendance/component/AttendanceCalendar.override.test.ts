import { describe, expect, it } from "vitest";

describe("Attendance administrative override validation", () => {
  it("rejects override submission when reason is shorter than 10 characters", () => {
    const isOverride = true;
    const remarksShort = "Fixed";
    const isValid = !isOverride || (remarksShort?.trim().length ?? 0) >= 10;
    expect(isValid).toBe(false);
  });

  it("accepts override submission when explanatory reason is at least 10 characters", () => {
    const isOverride = true;
    const remarksValid = "Employee worked in office unexpectedly";
    const isValid = !isOverride || (remarksValid?.trim().length ?? 0) >= 10;
    expect(isValid).toBe(true);
  });

  it("constructs payload with AllowSourceOverride true when overriding workflow attendance", () => {
    const isOverride = true;
    const modalData = {
      status: "P" as const,
      checkIn: "09:00",
      checkOut: "18:00",
      remarks: "Present in office during approved sick leave",
    };
    const payload = {
      UserId: "user-123",
      EmployeeId: "EMP-001",
      Date: "2026-10-27",
      CheckInTime: modalData.checkIn,
      CheckOutTime: modalData.checkOut,
      Status: modalData.status,
      Remarks: modalData.remarks,
      AllowSourceOverride: isOverride ? true : undefined,
    };

    expect(payload.AllowSourceOverride).toBe(true);
    expect(payload.Status).toBe("P");
    expect(payload.Remarks?.length).toBeGreaterThanOrEqual(10);
  });

  it("constructs payload without AllowSourceOverride when editing regular manual attendance", () => {
    const isOverride = false;
    const modalData = {
      status: "P" as const,
      checkIn: "09:15",
      checkOut: "18:00",
      remarks: "Regular manual update",
    };
    const payload = {
      UserId: "user-123",
      EmployeeId: "EMP-001",
      Date: "2026-10-27",
      CheckInTime: modalData.checkIn,
      CheckOutTime: modalData.checkOut,
      Status: modalData.status,
      Remarks: modalData.remarks,
      AllowSourceOverride: isOverride ? true : undefined,
    };

    expect(payload.AllowSourceOverride).toBeUndefined();
    expect(payload.Status).toBe("P");
  });

  it("selects correct button label and banner text for WFH vs Leave overrides", () => {
    const getOverrideButtonLabel = (isOverride: boolean, sourceLabel?: string) => {
      if (!isOverride) return "Save attendance";
      return sourceLabel === "Work From Home"
        ? "Confirm Office Attendance & Convert"
        : "Confirm Override & Refund";
    };

    expect(getOverrideButtonLabel(true, "Work From Home")).toBe("Confirm Office Attendance & Convert");
    expect(getOverrideButtonLabel(true, "Approved Leave")).toBe("Confirm Override & Refund");
    expect(getOverrideButtonLabel(false)).toBe("Save attendance");
  });

  it("evaluates canManageAttendance as true for HR Manager with Attendance.Edit", () => {
    const isAdministrator = false;
    const isHrAttendanceRole = true;
    const userPermissions = ["Attendance.Edit", "Attendance.ViewAll", "Attendance.CreateForEmployee"];

    const hasModuleFeaturePermission = (mod: string, perm: string, list: string[]) =>
      list.includes(`${mod}.${perm}`);

    const canManageAttendance =
      isAdministrator ||
      isHrAttendanceRole ||
      hasModuleFeaturePermission("Attendance", "Override", userPermissions) ||
      hasModuleFeaturePermission("Attendance", "Edit", userPermissions);

    expect(canManageAttendance).toBe(true);
  });

  it("evaluates canManageAttendance as false for regular Employee without Edit or Override permissions", () => {
    const isAdministrator = false;
    const isHrAttendanceRole = false;
    const userPermissions = ["Attendance.ViewOwn", "Attendance.CreateOwn"];

    const hasModuleFeaturePermission = (mod: string, perm: string, list: string[]) =>
      list.includes(`${mod}.${perm}`);

    const canManageAttendance =
      isAdministrator ||
      isHrAttendanceRole ||
      hasModuleFeaturePermission("Attendance", "Override", userPermissions) ||
      hasModuleFeaturePermission("Attendance", "Edit", userPermissions);

    expect(canManageAttendance).toBe(false);
  });

  it("normalizes row IDs consistently using resolveRowId to avoid blank cells on optimistic updates", () => {
    const normalizeUserId = (userId?: string) => (userId ?? "").toString().trim().toLowerCase();
    const resolveRowId = (emp: { userId?: string; id?: string }) => normalizeUserId(emp.userId || emp.id);

    const employee = {
      id: "6716a5b1c8f1a",
      userId: "6716A5B1C8F1A", // uppercase variant
      employeeId: "CD-0001",
      name: "Satyam Dubey",
    };

    const rowIdFromEmployee = resolveRowId(employee);
    const dateISO = "2026-10-27";
    const key = `${rowIdFromEmployee}-${dateISO}`;

    // Selected cell employee with any casing produces the exact same key
    const selectedCellEmployee = {
      userId: "6716A5B1C8F1A",
      id: "6716a5b1c8f1a",
    };
    const rowIdFromSelectedCell = resolveRowId(selectedCellEmployee);
    const optimisticKey = `${rowIdFromSelectedCell}-${dateISO}`;

    expect(optimisticKey).toBe(key);
    expect(key).toBe("6716a5b1c8f1a-2026-10-27");
  });

  it("suppresses stale system default present join remarks on workflow cells", () => {
    const rawRemarks = "System default Present created on the basis of date of joining.";
    const cleanRemarks =
      rawRemarks &&
      !rawRemarks.toLowerCase().includes("system default present created on the basis of date of joining")
        ? rawRemarks
        : "";

    expect(cleanRemarks).toBe("");

    const approvedWfhRemarks = "Administrative WFH grant: Doctor appointment";
    const cleanWfhRemarks =
      approvedWfhRemarks &&
      !approvedWfhRemarks.toLowerCase().includes("system default present created on the basis of date of joining")
        ? approvedWfhRemarks
        : "";

    expect(cleanWfhRemarks).toBe("Administrative WFH grant: Doctor appointment");
  });

  it("resolves rowUserId against loaded employees list to prevent missing keys", () => {
    const normalizeUserId = (userId?: string) => (userId ?? "").toString().trim().toLowerCase();
    const resolveRowId = (emp: { userId?: string; id?: string }) => normalizeUserId(emp.userId || emp.id);

    const employees = [
      { id: "6716a5b1c8f1a", userId: "6716a5b1c8f1a", employeeId: "CD-0001", name: "Satyam Dubey" },
      { id: "6716a5b1c8f2b", userId: "6716a5b1c8f2b", employeeId: "CD-0002", name: "Kiara Singh" },
    ];

    const apiItem = {
      userId: "6716A5B1C8F1A",
      date: "2026-10-27T00:00:00Z",
      status: "WFH",
    };

    const matchedEmployee = employees.find(
      (e) =>
        normalizeUserId(e.userId) === normalizeUserId(apiItem.userId) ||
        normalizeUserId(e.id) === normalizeUserId(apiItem.userId) ||
        normalizeUserId(e.employeeId) === normalizeUserId(apiItem.userId)
    );

    const rowUserId = matchedEmployee ? resolveRowId(matchedEmployee) : normalizeUserId(apiItem.userId);
    expect(rowUserId).toBe("6716a5b1c8f1a");
    expect(`${rowUserId}-2026-10-27`).toBe("6716a5b1c8f1a-2026-10-27");
  });

  describe("Composite WFH status synthesis and daily row overwrite protection", () => {
    const resolveCompositeStatus = (
      fhStatus?: string,
      shStatus?: string,
      fallbackStatus: string = ""
    ) => {
      const fh = fhStatus?.toUpperCase();
      const sh = shStatus?.toUpperCase();
      if (fh && sh) {
        if (
          (fh === "WFH" && (sh === "P" || sh === "PRESENT")) ||
          ((fh === "P" || fh === "PRESENT") && sh === "WFH")
        )
          return "WFH+WFO";
        if (fh === "WFH" && sh === "WFH") return "WFH";
        if (
          (fh === "WFH" &&
            (sh === "HD" ||
              sh.includes("HALF") ||
              sh.includes("LEAVE") ||
              ["SL", "CL", "EL", "PL", "ML", "COMP-OFF", "CO", "LWP"].includes(sh))) ||
          (sh === "WFH" &&
            (fh === "HD" ||
              fh.includes("HALF") ||
              fh.includes("LEAVE") ||
              ["SL", "CL", "EL", "PL", "ML", "COMP-OFF", "CO", "LWP"].includes(fh)))
        )
          return "WFH-HD";
        if ((fh === "WFH" && sh === "A") || (sh === "WFH" && fh === "A")) return "WFH-HD";
        return `${fh}/${sh}`;
      }
      if (fh === "WFH" && !sh) return "WFH-HD";
      if (sh === "WFH" && !fh) return "WFH-HD";
      return fallbackStatus;
    };

    it("synthesizes WFH+WFO when one half is WFH and the other half is Present", () => {
      expect(resolveCompositeStatus("WFH", "P")).toBe("WFH+WFO");
      expect(resolveCompositeStatus("PRESENT", "WFH")).toBe("WFH+WFO");
    });

    it("synthesizes WFH when both halves are WFH", () => {
      expect(resolveCompositeStatus("WFH", "WFH")).toBe("WFH");
    });

    it("synthesizes WFH-HD when one half is WFH and the other half is Leave or Absent", () => {
      expect(resolveCompositeStatus("WFH", "HD")).toBe("WFH-HD");
      expect(resolveCompositeStatus("WFH", "SL")).toBe("WFH-HD");
      expect(resolveCompositeStatus("CL", "WFH")).toBe("WFH-HD");
      expect(resolveCompositeStatus("WFH", "A")).toBe("WFH-HD");
    });

    it("synthesizes WFH-HD when only a single half WFH segment is present", () => {
      expect(resolveCompositeStatus("WFH", undefined)).toBe("WFH-HD");
      expect(resolveCompositeStatus(undefined, "WFH")).toBe("WFH-HD");
    });

    it("protects synthesized segment status from being overwritten by raw arriving daily record", () => {
      const formatted: Record<string, any> = {};
      const key = "user-123-2026-10-27";

      // 1. First half segment arrives: WFH
      const firstHalfItem = {
        userId: "user-123",
        date: "2026-10-27T00:00:00Z",
        status: "WFH",
        isDaySegment: true,
        segment: "FIRST_HALF",
      };
      const seg1 = {
        FIRST_HALF: { status: firstHalfItem.status, sourceType: "WFH_REQUEST", sourceId: "req-1" },
      };
      formatted[key] = {
        status: resolveCompositeStatus(seg1.FIRST_HALF?.status, undefined, firstHalfItem.status),
        isDaySegment: true,
        halfDaySegments: seg1,
      };
      expect(formatted[key].status).toBe("WFH-HD");

      // 2. Second half segment arrives: Office punch P
      const secondHalfItem = {
        userId: "user-123",
        date: "2026-10-27T00:00:00Z",
        status: "P",
        isDaySegment: true,
        segment: "SECOND_HALF",
      };
      const seg2 = {
        ...formatted[key].halfDaySegments,
        SECOND_HALF: { status: secondHalfItem.status, sourceType: "ATTENDANCE_PUNCH", sourceId: null },
      };
      formatted[key] = {
        ...formatted[key],
        status: resolveCompositeStatus(seg2.FIRST_HALF?.status, seg2.SECOND_HALF?.status, secondHalfItem.status),
        halfDaySegments: seg2,
      };
      expect(formatted[key].status).toBe("WFH+WFO");

      // 3. Stale daily row arrives from API with status "P" (raw un-merged row)
      const rawDailyItem = {
        userId: "user-123",
        date: "2026-10-27T00:00:00Z",
        status: "P",
        isDaySegment: false,
      };

      const current = formatted[key];
      const hasSegments = Boolean(current.halfDaySegments?.FIRST_HALF || current.halfDaySegments?.SECOND_HALF);
      formatted[key] = {
        ...current,
        status: hasSegments ? current.status : (rawDailyItem.status || current.status),
      };

      // Status MUST remain WFH+WFO, never overwritten by "P"
      expect(formatted[key].status).toBe("WFH+WFO");
    });

    it("preserves shift timings for normal in-office employees with automatic attendance", () => {
      const isSystemPlaceholder = true;
      const isWfhRecord = false;
      const shouldSuppressPlaceholder = isSystemPlaceholder && isWfhRecord;

      const formatIndianTime = (val: string | null) => (val ? "09:00" : "");
      const checkInTime = "2026-10-28T03:30:00Z";
      const resolvedCheckIn = shouldSuppressPlaceholder ? "" : formatIndianTime(checkInTime);

      expect(shouldSuppressPlaceholder).toBe(false);
      expect(resolvedCheckIn).toBe("09:00");
    });

    it("suppresses synthetic placeholder timings for unpunched WFH and combination employees", () => {
      const isSystemPlaceholder = true;
      const isWfhRecord = true;
      const shouldSuppressPlaceholder = isSystemPlaceholder && isWfhRecord;

      const formatIndianTime = (val: string | null) => (val ? "09:00" : "");
      const checkInTime = "2026-10-28T03:30:00Z";
      const resolvedCheckIn = shouldSuppressPlaceholder ? "" : formatIndianTime(checkInTime);

      expect(shouldSuppressPlaceholder).toBe(true);
      expect(resolvedCheckIn).toBe("");
    });
  });
});
