import { Card, Stack, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";
import { Add } from "@mui/icons-material";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { SearchInput } from "../../shared/components/SearchInput";
import { useAppSelector } from "../../Redux/hooks";
import { ModulesName, Permission } from "../../../utils/enums";
import { PayRollTableData } from "./components/PayRollSettingtable";
import { PayRollDataModel, PayRollResponseModel } from "../payroll/models";
import { Nullable } from "../../../utils/common_types";
import dayjs, { Dayjs } from "dayjs";
import { getEmployeePayRollData } from "../payroll/services";
import { AddUpdateEmployeePayRoll } from "../payroll/AddUpdateEmployeePayRoll";
import { UploadPayRollData } from "../payroll/components/UploadPayRollData";
import CustomisedDatePicker from "../../shared/components/CustomisedDatePicker";

export const initialPayRollValues: Nullable<PayRollDataModel> & {
  payMonth: Dayjs;
} = {
  employeeId: "",
  paidDate: null,
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
  const { formatMessage: i } = useIntl();
  const [search, setSearch] = useState("");
  const [payMonth, setPayMonth] = useState<Dayjs | null>(
    dayjs().startOf("day"),
  );
  const [payRollData, setPayRollData] = useState<PayRollResponseModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [initialValues, setInitialValues] =
    useState<typeof initialPayRollValues>(initialPayRollValues);
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

  const handleDateChange = (newValue: Dayjs | null) => {
    setPayMonth(newValue);
  };
  const handlePageRefresh = () => {
    setRefresh(!refresh);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setInitialValues(initialPayRollValues);
  };

  const handleRowClick = (row: PayRollResponseModel) => {
    setInitialValues({
      ...row.payData,
      // the API returns paidDate as a plain ISO string, not a Dayjs instance
      paidDate: row.payData.paidDate ? dayjs(row.payData.paidDate as unknown as string) : null,
      payMonth: payMonth!,
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };
  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearch(value.trim());
  };

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "MODULES.PAYROLL_SETTINGS" }));
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
    <>
      <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
        <Stack className="flex-row justify-content-between align-items-center gap-4 flex-wrap-reverse">
          <SearchInput search={search} setSearch={handleSearchChange} />
          <Stack direction="row" className="align-items-end flex-wrap gap-2">
            <CustomisedDatePicker
              label={i({ id: "PAYROLL.SELECT_PAY_MONTH" })}
              views={["month", "year"]}
              value={payMonth}
              setValue={handleDateChange}
              disabled
            />
          </Stack>
        </Stack>
        <PayRollTableData
          payRollData={payRollData}
          handleRowClick={handleRowClick}
        />
      </Card>
      {isModalOpen && (
        <AddUpdateEmployeePayRoll
          edit={isEdit}
          open={isModalOpen}
          initialValues={initialValues}
          handleClose={handleModalClose}
          handlePageRefresh={handlePageRefresh}
        />
      )}
    </>
  );
}
