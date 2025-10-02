import { Box, Card } from "@mui/material";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import {
  deleteAttributeItem,
  getAllDepartments,
  updateDepartment,
} from "../../adminservices";
import { DepartmentModel, DepartmentRequestModel } from "../../models";

import { useAppSelector } from "../../../../Redux/hooks";
import { AttributeTable } from "./AttributeTable";
import { transformAttributeObjectToList } from "../../../../../utils/common";
import { toast } from "react-toastify";
import { ServiceUrl } from "../../../../../utils/constant/Constant";

const Departments = () => {
  const { formatMessage: i } = useIntl();
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const currentLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage!
  );

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const handleDepartmentUpdate = async (departments: DepartmentModel[]) => {
    const payload: DepartmentRequestModel[] = [];
    departments.forEach((department) => {
      payload.push({
        ...department,
        titles: transformAttributeObjectToList(department.titles),
      });
    });
    try {
      const { data } = await updateDepartment(payload);
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        handleRefresh();
      } else {
        toast.error(i({ id: "TOAST.FAILED.UPDATE" }));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      const response = await deleteAttributeItem(
        ServiceUrl.DELETE_DEPARTMENT,
        departmentId
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
    const getAllDeps = async () => {
      try {
        const response = await getAllDepartments();
        const { success, methodResults } = response.data;
        if (success) {
          setDepartmentList(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllDeps();
  }, [refresh]);

  return (
    <AttributeTable
      attributeName={i({ id: "COMPANY_MASTER.TAB.DEPARTMENTS" })}
      handleDeleteAttribute={handleDeleteDepartment}
      attributeData={departmentList}
      keyName="departmentId"
      handleAttributeUpdate={handleDepartmentUpdate}
    />
  );
};

export { Departments };
