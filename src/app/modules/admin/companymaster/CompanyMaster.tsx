import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { alpha, Box, ButtonBase, Card, Stack, Typography } from "@mui/material";
import { Departments } from "./components/Department";
import { Add, CorporateFare, Work, LabelOutlined } from "@mui/icons-material";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { checkIsActive } from "../../../../_themes/helpers";
import { TabModel } from "../../../../utils/common_types";
import { JobTitles } from "./components/JobTitles";
import { CompanyCustomAttributeModel, OutletContextType } from "../models";
import {
  createNewCustomAttribute,
  getAllCustomAttributes,
} from "../adminservices";
import { CustomAttributeWrapper } from "./components/CustomAttributeWrapper";
import { usePageData } from "../../../Context/PageDataProvider";
import { toast } from "react-toastify";
import { AppButton } from "../../../shared/components/ui";

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "/admin/companymaster/department",
    title: "COMPANY_MASTER.TAB.DEPARTMENTS",
    icon: <CorporateFare />,
  },
  {
    tabId: 2,
    to: "/admin/companymaster/jobtitle",
    title: "COMPANY_MASTER.TAB.JOB_TILES",
    icon: <Work />,
  },
];

const getCustomAttributeTitle = (attribute: CompanyCustomAttributeModel) =>
  Object.values(attribute.customAttributeTitle ?? {}).find((title) => title.trim().length > 0) ??
  `Custom Attribute ${attribute.customAttributeNumber}`;

export const CompanyMasterTab = () => {
  return (
    <Routes>
      <Route element={<CompanyMaster />}>
        <Route index element={<Navigate to={"department"} />} />
        <Route path="department" element={<Departments />} />
        <Route path="jobtitle" element={<JobTitles />} />
        <Route path="office-schedule" element={<Navigate to="/admin/companydetails/office-schedule" replace />} />
        <Route
          path="customattribute/:customAttributeId"
          element={<CustomAttributeWrapper />}
        />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};


const CompanyMaster = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const [companyCustomAttribute, setCompanyCustomAttribute] = useState<
    CompanyCustomAttributeModel[]
  >([]);

  const AddNewCustomAttribute = async () => {
    const existingDraft = companyCustomAttribute.find((attribute) =>
      !Object.values(attribute.customAttributeTitle ?? {}).some((title) =>
        title.trim().length > 0,
      ),
    );
    if (existingDraft) {
      toast.info("Finish naming the existing draft custom attribute before adding another one.");
      navigate(`/admin/companymaster/customattribute/${existingDraft.customAttributeId}`);
      return;
    }
    try {
      const { data } = await createNewCustomAttribute();
      if (data.success) {
        setCompanyCustomAttribute((current) => [...current, data.methodResult]);
        navigate(`/admin/companymaster/customattribute/${data.methodResult.customAttributeId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Custom attribute could not be created.");
    }
  };

  const UpdateCustomAttributeValue = (customAttribute: CompanyCustomAttributeModel) => {
    setCompanyCustomAttribute((current) => {
      const exists = current.some((attribute) => attribute.customAttributeId === customAttribute.customAttributeId);
      return exists
        ? current.map((attribute) => attribute.customAttributeId === customAttribute.customAttributeId
          ? { ...attribute, customAttributeTitle: customAttribute.customAttributeTitle }
          : attribute)
        : [...current, customAttribute];
    });
  };

  const RemoveCustomAttribute = (customAttributeId: string) => {
    setCompanyCustomAttribute((current) =>
      current.filter((attribute) => attribute.customAttributeId !== customAttributeId),
    );
  };

  const namedCustomAttributes = companyCustomAttribute.filter((attribute) =>
    Object.values(attribute.customAttributeTitle ?? {}).some((title) => title.trim().length > 0),
  );

  useEffect(() => {
    setPageTitle("Company Master");
  }, [setPageTitle]);

  useEffect(() => {
    // fetch company custom attributes
    (async () => {
      try {
        const { data } = await getAllCustomAttributes();
        if (data.success) {
          setCompanyCustomAttribute(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, []);

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ minWidth: 0 }}>
      <Card variant="outlined" sx={{ borderRadius: 3, p: 0.75, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} alignItems={{ sm: "center" }}>
          <Stack direction="row" spacing={0.75} sx={{ flex: 1, minWidth: 0, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
            {tabsRoutes.map((tab) => {
              const active = checkIsActive(location.pathname, tab.to);
              return (
                <ButtonBase
                  key={tab.tabId}
                  onClick={() => navigate(tab.to)}
                  sx={{
                    flex: "0 0 auto", minHeight: 46, px: { xs: 1.25, sm: 1.75 }, borderRadius: 2,
                    display: "inline-flex", gap: 1, color: active ? "primary.main" : "text.secondary", fontWeight: active ? 800 : 700,
                    bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.12) : "transparent",
                    border: "1px solid", borderColor: active ? (theme) => alpha(theme.palette.primary.main, 0.35) : "transparent",
                    "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) },
                  }}
                >
                  {tab.icon}
                  <Typography component="span" fontSize={14} fontWeight="inherit" whiteSpace="nowrap">{i({ id: tab.title })}</Typography>
                </ButtonBase>
              );
            })}
            {namedCustomAttributes.map((attribute) => {
              const path = `/admin/companymaster/customattribute/${attribute.customAttributeId}`;
              const active = checkIsActive(location.pathname, path);
              return (
                <ButtonBase
                  key={attribute.customAttributeId}
                  onClick={() => navigate(path)}
                  sx={{
                    flex: "0 0 auto", minHeight: 46, px: { xs: 1.25, sm: 1.75 }, borderRadius: 2,
                    display: "inline-flex", gap: 1, color: active ? "primary.main" : "text.secondary", fontWeight: active ? 800 : 700,
                    bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.12) : "transparent",
                    border: "1px solid", borderColor: active ? (theme) => alpha(theme.palette.primary.main, 0.35) : "transparent",
                    "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) },
                  }}
                >
                  <LabelOutlined fontSize="small" />
                  <Typography component="span" fontSize={14} fontWeight="inherit" whiteSpace="nowrap">{getCustomAttributeTitle(attribute)}</Typography>
                </ButtonBase>
              );
            })}
          </Stack>
          <AppButton variant="contained" startIcon={<Add />} onClick={AddNewCustomAttribute} sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "auto" }, px: 2.25 }}>
            Add custom attribute
          </AppButton>
        </Stack>
      </Card>

      <Box component="div" className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0 }}>
        <Outlet context={{ updateAttribute: UpdateCustomAttributeValue, removeAttribute: RemoveCustomAttribute } satisfies OutletContextType} />
      </Box>
    </Stack>
  );
};

export { CompanyMaster };
