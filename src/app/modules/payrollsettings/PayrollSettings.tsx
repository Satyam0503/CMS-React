import { Card, Stack } from "@mui/material";
import { useState, useEffect } from "react";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { SearchInput } from "../../shared/components/SearchInput";
import { useAppSelector } from "../../Redux/hooks";
import { ModulesName, Permission } from "../../../utils/enums";
import { SalaryTable } from "./components/SalaryTable";
import { CompanySalaryResponseModel } from "./model";
import dayjs, { Dayjs } from "dayjs";
import { getCompanySalaries, processPayroll } from "./services";
import { AddUpdateEmployeeSalary } from "./components/AddUpdateEmployeeSalary";
import CustomisedDatePicker from "../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../shared/components/CustomisedButton";
import { ConfirmationModal } from "../../shared/components/ConfirmationModal";
import { toast } from "react-toastify";

export default function PayrollSettings() {
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const [search, setSearch] = useState("");
  const [salaryData, setSalaryData] = useState<CompanySalaryResponseModel[]>(
    [],
  );
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<CompanySalaryResponseModel | null>(null);
  const [processMonth, setProcessMonth] = useState<Dayjs | null>(dayjs());
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasProcessPermission = hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Create,
    userModulesPermissions,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
  };

  const handlePageRefresh = () => {
    setRefresh((prev) => !prev);
  };

  const handleRowClick = (row: CompanySalaryResponseModel) => {
    setSelectedEmployee(row);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleProcessMonthChange = (newValue: Dayjs | null) => {
    setProcessMonth(newValue);
  };

  useEffect(() => {
    setPageTitle(i({ id: "MODULES.PAYROLL_SETTINGS" }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCompanySalaries({ employeeName: search });
        if (data.success) {
          setSalaryData(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, [search, refresh]);

  const handleProcessSalary = async () => {
    if (!processMonth) return;
    setConfirmOpen(false);
    setIsProcessing(true);
    try {
      const { data } = await processPayroll({
        payMonth: processMonth.format("YYYY-MM-DD"),
      });
      if (data.success) {
        toast.success(data.message);
        handlePageRefresh();
      } else {
        toast.error(data.message || i({ id: "ERROR.500" }));
      }
    } catch (error) {
      toast.error(i({ id: "ERROR.500" }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
        <Stack className="flex-row justify-content-between align-items-center gap-4 flex-wrap-reverse">
          <SearchInput search={search} setSearch={handleSearchChange} />
          {hasProcessPermission && (
            <Stack
              direction="row"
              className="align-items-end flex-wrap gap-2"
            >
              <CustomisedDatePicker
                label={i({ id: "PAYROLL_SETTINGS.PROCESS_MONTH" })}
                views={["month", "year"]}
                value={processMonth}
                maxDate={dayjs()}
                setValue={handleProcessMonthChange}
              />
              <CustomisedButton
                label={i({ id: "PAYROLL_SETTINGS.PROCESS_SALARY" })}
                handleClick={() => setConfirmOpen(true)}
                disabled={!processMonth}
                loading={isProcessing}
              />
            </Stack>
          )}
        </Stack>
        <SalaryTable salaryData={salaryData} handleRowClick={handleRowClick} />
      </Card>
      {isModalOpen && selectedEmployee && (
        <AddUpdateEmployeeSalary
          open={isModalOpen}
          userId={selectedEmployee.userId}
          employeeId={selectedEmployee.employeeId}
          employeeName={selectedEmployee.employeeName}
          existingSalary={selectedEmployee.activeSalary}
          handleClose={handleModalClose}
          handlePageRefresh={handlePageRefresh}
        />
      )}
      {confirmOpen && (
        <ConfirmationModal
          open={confirmOpen}
          title={i({ id: "PAYROLL_SETTINGS.CONFIRM_PROCESS_TITLE" })}
          content={i(
            { id: "PAYROLL_SETTINGS.CONFIRM_PROCESS_BODY" },
            { month: processMonth?.format("MMMM YYYY") ?? "" },
          )}
          handleClose={() => setConfirmOpen(false)}
          handleConfirmation={handleProcessSalary}
          ok_btn
        />
      )}
    </>
  );
}
