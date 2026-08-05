import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { Departments } from "./components/Department";
import { Add, CorporateFare, Work, AccessTimeRounded } from "@mui/icons-material";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { checkIsActive } from "../../../../_themes/helpers";
import clsx from "clsx";
import { TabModel } from "../../../../utils/common_types";
import { JobTitles } from "./components/JobTitles";
import { CompanyCustomAttributeModel, OutletContextType } from "../models";
import {
  createNewCustomAttribute,
  getAllCustomAttributes,
} from "../adminservices";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { CustomAttributeWrapper } from "./components/CustomAttributeWrapper";
import { usePageData } from "../../../Context/PageDataProvider";
import { OfficeSchedule } from "./components/OfficeSchedule";

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
  {
    tabId: 3,
    to: "/admin/companymaster/office-schedule",
    title: "Office Schedule",
    icon: <AccessTimeRounded />,
  },
];

export const CompanyMasterTab = () => {
  return (
    <Routes>
      <Route element={<CompanyMaster />}>
        <Route index element={<Navigate to={"department"} />} />
        <Route path="department" element={<Departments />} />
        <Route path="jobtitle" element={<JobTitles />} />
        <Route path="office-schedule" element={<OfficeSchedule />} />
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
  const [companyCustomAttribute, setCompanyCustomAttribute] = useState<
    CompanyCustomAttributeModel[]
  >([]);
  const { currentLanguage } = useAppLang();

  const AddNewCustomAttribute = async () => {
    try {
      const { data } = await createNewCustomAttribute();
      if (data.success) {
        setCompanyCustomAttribute([
          ...companyCustomAttribute,
          data.methodResult,
        ]);
        navigate(`/admin/companymaster/customattribute/${data.methodResult.customAttributeId}`);
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const UpdateCustomAttributeValue = (customAttribute: CompanyCustomAttributeModel) => {
    setCompanyCustomAttribute(companyCustomAttribute.map(attribute => {
      if (attribute.customAttributeId === customAttribute.customAttributeId) {
        return {
          ...attribute,
          customAttributeTitle: customAttribute.customAttributeTitle
        }
      }
      return attribute;
    }));
  }

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.COMPANY_MASTER" }));
  }, [i, setPageTitle]);

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
    <Box component="div" className="d-flex flex-column flex-grow-1 gap-4">
      <Stack
        direction="row"
        spacing={0.5}
        className="tab-container"
        sx={{
          backgroundColor: "background.card",
        }}
      >
        {tabsRoutes.map((tab) => {
          return (
            <Box
              component="div"
              key={tab.tabId}
              className={clsx("tab-box", {
                tab_active: checkIsActive(location.pathname, tab.to),
              })}
              onClick={() => navigate(tab.to)}
              sx={{
                color: "text.secondary",
              }}
            >
              {tab.icon}
              {i({ id: tab.title })}
            </Box>
          );
        })}
        {/* display company custom attributes */}
        {companyCustomAttribute.length > 0 &&
          companyCustomAttribute.map((attribute) => (
            <Box
              key={attribute.customAttributeId}
              component="div"
              className={clsx("tab-box", {
                tab_active: checkIsActive(
                  location.pathname,
                  `/admin/companymaster/customattribute/${attribute.customAttributeId}`
                ),
              })}
              onClick={() => {
                navigate(
                  `/admin/companymaster/customattribute/${attribute.customAttributeId}`
                );
              }}
              sx={{
                color: "text.secondary",
              }}
            >
              {attribute.customAttributeTitle[currentLanguage] ??
                `${i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.TITLE" })} ${attribute.customAttributeNumber
                }`}
            </Box>
          ))}
        <Box
          component="div"
          className="tab-box"
          onClick={AddNewCustomAttribute}
          sx={{
            color: "text.secondary",
          }}
        >
          <Add />
          {i({
            id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.ADD_ATTRIBUTE",
          })}
        </Box>
      </Stack>
      <Box component="div" className="d-flex flex-column flex-grow-1">
        <Outlet context={{ updateAttribute: UpdateCustomAttributeValue } satisfies OutletContextType} />
      </Box>
    </Box>
  );
};

export { CompanyMaster };
