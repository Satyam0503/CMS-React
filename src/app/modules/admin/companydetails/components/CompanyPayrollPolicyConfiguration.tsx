import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../../../server/axios";
import { useAppSelector } from "../../../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import {
  PayrollPolicyConfigCard,
  PayrollDivisorPolicyConfig,
} from "../../../payrollsettings/components/PayrollPolicyConfigCard";

const defaultPolicy = (): PayrollDivisorPolicyConfig => ({
  payrollMode: "Standard",
  divisorPolicy: "CALENDAR_DAYS",
  lopCalculationBase: "FIXED_GROSS",
  epfMode: "CAPPED_CEILING",
  epfWageCeiling: 15000,
  esicMode: "STATUTORY",
  tdsMode: "AUTO_NEW_REGIME",
  requireAttendanceLock: true,
  effectiveFrom: dayjs().startOf("month").format("YYYY-MM-01"),
  isActive: true,
  version: 1,
});

export function CompanyPayrollPolicyConfiguration() {
  const userData = useAppSelector((state) => state.user.userData);
  const permissions = userData?.modulePermission ?? [];
  const canSavePolicy = userData?.roleType === Roles.Administrator || hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Edit,
    permissions,
  );
  const [policyConfig, setPolicyConfig] = useState<PayrollDivisorPolicyConfig>(defaultPolicy);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  useEffect(() => {
    let active = true;
    const month = dayjs().startOf("month").format("YYYY-MM-01");
    getRequest<PayrollDivisorPolicyConfig>("api/payroll/divisor-policy", { params: { month } })
      .then(({ data }) => {
        if (active && data) setPolicyConfig({ ...defaultPolicy(), ...data });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const applyCompanyTierPreset = (mode: "Startup" | "Standard" | "Enterprise") => {
    setPolicyConfig((current) => ({
      ...current,
      payrollMode: mode,
      divisorPolicy: mode === "Enterprise" ? "WORKING_DAYS" : "CALENDAR_DAYS",
      epfMode: mode === "Startup" ? "EXEMPT" : mode === "Enterprise" ? "ACTUAL_BASIC_12" : "CAPPED_CEILING",
      esicMode: mode === "Startup" ? "EXEMPT" : "STATUTORY",
      requireAttendanceLock: mode !== "Startup",
    }));
  };

  const handleSavePolicyConfig = async () => {
    setIsSavingPolicy(true);
    try {
      const { data } = await postRequest<PayrollDivisorPolicyConfig, { success: boolean; message?: string }>(
        "api/payroll/divisor-policy",
        { ...policyConfig, effectiveFrom: dayjs().startOf("month").format("YYYY-MM-01"), isActive: true },
      );
      if (data.success) toast.success("Company payroll policy saved.");
      else toast.error(data.message || "Unable to save payroll policy.");
    } catch { toast.error("Unable to save payroll policy."); }
    finally { setIsSavingPolicy(false); }
  };

  return (
    <PayrollPolicyConfigCard
      policyConfig={policyConfig}
      setPolicyConfig={setPolicyConfig}
      policyExpanded={policyExpanded}
      setPolicyExpanded={setPolicyExpanded}
      applyCompanyTierPreset={applyCompanyTierPreset}
      handleSavePolicyConfig={handleSavePolicyConfig}
      isSavingPolicy={isSavingPolicy}
      canSavePolicy={canSavePolicy}
    />
  );
}