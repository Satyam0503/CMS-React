import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { JobTitleRequestModel, JobTitleResponseModel } from "../../models";
import { transformAttributeObjectToList } from "../../../../../utils/common";
import {
  addUpdateJobTitles,
  deleteAttributeItem,
  getJobTitles,
} from "../../adminservices";
import { toast } from "react-toastify";
import { AttributeTable } from "./AttributeTable";
import { ServiceUrl } from "../../../../../utils/constant/Constant";

export const JobTitles = () => {
  const { formatMessage: i } = useIntl();
  const [jobTitleList, setJobTitleList] = useState<JobTitleResponseModel[]>([]);
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const handleJobTitleUpdate = async (jobTitles: JobTitleResponseModel[]) => {
    const payload: JobTitleRequestModel[] = jobTitles.map((item) => ({
      jobTitleId: item.jobTitleId,
      departmentId: null,
      isActive: item.isActive,
      titles: transformAttributeObjectToList(item.titles),
    }));
    try {
      const { data } = await addUpdateJobTitles(payload);
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        // Refresh the local list immediately from server to reflect persisted data
        try {
          const resp = await getJobTitles();
          if (resp.data?.success) {
            setJobTitleList(resp.data.methodResults);
          } else {
            handleRefresh();
          }
        } catch (err) {
          handleRefresh();
        }
      } else {
        toast.error(data.message || i({ id: "TOAST.FAILED.UPDATE" }));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || i({ id: "TOAST.FAILED.UPDATE" }));
    }
  };

  const handleDeleteJobTitle = async (jobTitleId: string) => {
    try {
      const response = await deleteAttributeItem(
        ServiceUrl.DELETE_JOB_TITLE,
        jobTitleId
      );
      const { success, message } = response.data;
      if (!success) {
        throw new Error(message);
      }
      toast.success(i({ id: "TOAST.SUCCESS.DELETE" }));
      handleRefresh();
    } catch (error) {
      console.error((error as Error).message);
    }
  };
  useEffect(() => {
    const getAllJobTitles = async () => {
      try {
        const response = await getJobTitles();
        const { success, methodResults } = response.data;
        if (success) {
          setJobTitleList(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllJobTitles();
  }, [refresh]);

  return (
    <AttributeTable
      attributeName={i({ id: "COMPANY_MASTER.TAB.JOB_TILES" })}
      attributeData={jobTitleList}
      keyName="jobTitleId"
      handleAttributeUpdate={handleJobTitleUpdate}
      handleDeleteAttribute={handleDeleteJobTitle}
    />
  );
};
