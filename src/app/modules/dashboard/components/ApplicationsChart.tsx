import { useIntl } from "react-intl";
import { CustomCard } from "../../components/CustomCard";
import { BarChart } from "../../components/BarChart";
import { useCallback, useEffect, useState } from "react";
import { Applicant } from "../../../../utils/common_types";
import { getAllApplicantList } from "../../recruitment/services";
import { AxiosError } from "axios";
import { applicationStatusMapper } from "../../../../utils/common";

export const ApplicationsChart = () => {
  const intl = useIntl();
  const [applicationList, setApplicationList] = useState<Applicant[]>([]);
  useEffect(() => {
    async function getAllApplications() {
      try {
        const response = await getAllApplicantList();
        const { success, methodResults } = response.data;
        if (success) {
          setApplicationList(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
    }
    getAllApplications();
  }, []);
 
  const getCountOfApplicationStatus = useCallback(() => {
    const status: Record<string, number> = {};
    applicationList.forEach((application) => {
      if (applicationStatusMapper[application.activityType] in status) {
        status[applicationStatusMapper[application.activityType]] += 1;
      } else {
        status[applicationStatusMapper[application.activityType]] = 1;
      }
    });
    return status;
  }, [applicationList]);

  const labels = Object.keys(getCountOfApplicationStatus());
  const series = Object.values(getCountOfApplicationStatus());
  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.TOTAL_APP" })}
      value={applicationList.length}
    >
      <BarChart labels={labels} series={series} legendOption={{show:true}} />
    </CustomCard>
  );
};
