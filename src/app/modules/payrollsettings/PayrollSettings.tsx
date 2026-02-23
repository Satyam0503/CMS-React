import { Badge, Card, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";
import { FilterList, Add } from "@mui/icons-material";
import {
  countAppliedFilter,
  hasModuleFeaturePermission,
} from "../../../utils/common";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { SearchInput } from "../../shared/components/SearchInput";
import { useAppSelector } from "../../Redux/hooks";
import { ModulesName, Permission } from "../../../utils/enums";
import AddEditPayrollSettings from "./components/AddEditPayrollSettings";
import { PayRollDataModel, PayRollResponseModel } from "../payroll/models";
import { getEmployeePayRollData } from "../payroll/services";
import dayjs, { Dayjs } from "dayjs";
import { PayRollTable } from "../payroll/components/PayRollTable";
import { Nullable } from "../../../utils/common_types";

export const initialPayRollValues: Nullable<PayRollDataModel> & {
  payMonth: Dayjs;
} = {
  employeeId: "",
  basicPay: null,
  paidDays: null,
  bonus: null,
  hra: null,
  lta: null,
  otherAllowance: null,
  lossOfPayDays: null,
  lossOfPay: null,
  incomeTax: null,
  healthInsurance: null,
  payMonth: dayjs().subtract(1, "month"),
};

export default function PayrollSettings() {
  const { setPageTitle } = usePageData();
  const intl = useIntl();
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [payRollData, setPayRollData] = useState<PayRollResponseModel[]>([]);
  const [payMonth, setPayMonth] = useState<Dayjs | null>(
    dayjs().subtract(1, "month").startOf("day"),
  );
  const [initialValues, setInitialValues] =
    useState<typeof initialPayRollValues>(initialPayRollValues);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const hasAddPermission = hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Create,
    userModulesPermissions,
  );
  const hasEditPermission = hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Edit,
    userModulesPermissions,
  );

  function handleClose() {
    setOpenModal(false);
  }

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearch(value.trim());
  };

  React.useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "MODULES.PAYROLL_SETTINGS" }));
  }, []);

  const handleRowClick = (row: PayRollResponseModel) => {
    setInitialValues({
      ...row.payData,
      payMonth: payMonth!,
    });
    setIsEdit(true);
    setOpenModal(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getEmployeePayRollData({
          employeeName: search,
          payMonth: payMonth!,
        });
        if (data.success) {
          setPayRollData(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, [search, payMonth, refresh]);

  return (
    <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
      <Stack className="flex-row justify-content-between align-items-center gap-4 flex-wrap-reverse">
        <SearchInput search={search} setSearch={handleSearchChange} />
        <Stack direction="row" spacing={1}>
          <Badge
            anchorOrigin={{
              horizontal: "left",
              vertical: "top",
            }}
            color="primary"
            // badgeContent={countAppliedFilter(jobFilters)}
          >
            <CustomIconButton
              icon={<FilterList />}
              ariaLabel="job filter"
              // handleClick={handleFilterClick}
            />
          </Badge>
          {hasAddPermission && (
            <CustomIconButton
              icon={<Add />}
              handleClick={() => setOpenModal(true)}
            />
          )}
        </Stack>
      </Stack>
      <PayRollTable payRollData={payRollData} handleRowClick={handleRowClick} />

      <AddEditPayrollSettings open={openModal} handleClose={handleClose} />
    </Card>
  );
}
