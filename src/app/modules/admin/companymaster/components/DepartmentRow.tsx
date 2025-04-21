import { Box, IconButton, Switch, TextField, Typography } from "@mui/material";
import React, { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { DepartmentModel } from "../../models";
import { ClearRounded, Delete, Edit } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useIntl } from "react-intl";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import clsx from "clsx";

type Props = {
  departmentData: DepartmentModel;
  handleDepartmentEdit: (department: DepartmentModel | null) => void;
  currentEditDepartment: string | null;
  setCurrentEditDepartment: React.Dispatch<React.SetStateAction<string | null>>;
  translationLanguage: string;
};

export const DepartmentRow: FC<Props> = React.memo(
  ({
    departmentData,
    handleDepartmentEdit,
    currentEditDepartment,
    setCurrentEditDepartment,
    translationLanguage,
  }) => {
    const { formatMessage } = useIntl();
    const [department, setDepartment] =
      useState<DepartmentModel>(departmentData);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);

    const translatedTitle =  department.titles.find((title) => title.language === translationLanguage)?.label ?? "";

    console.log(translatedTitle);
    

    const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (e.target.name === "departmentTitle") {
        const updatedDepartment = {
          ...department,
          titles:
            department.titles.length === 0
              ? [{ language: translationLanguage, label: e.target.value }]
              : department.titles.map((title) => {
                  if (title.language === translationLanguage) {
                    return {
                      ...title,
                      label: e.target.value,
                    };
                  }
                  return title;
                }),
        };       
        setDepartment(updatedDepartment);
      }
      if(e.target.name === "departmentName"){
        setDepartment({
          ...department,
          [e.target.name]: e.target.value,
        });
      }
    };

    const handleDepartmentDelete = () => {
      console.log(department.departmentId);
    };

    const handleEditCancel = () => {
      setEdit(false);
      setDepartment(departmentData);
      setCurrentEditDepartment(null);
      handleDepartmentEdit(null);
    };

    const handleEdit = () => {
      setEdit(true);
      setCurrentEditDepartment(departmentData.departmentId!);
      handleDepartmentEdit(null);
    };

    const handleSwitchChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      checked: boolean
    ) => {
      setDepartment({
        ...department,
        isActive: checked,
      });
    };

    useEffect(() => {
      setEdit(currentEditDepartment === departmentData.departmentId);
      if (currentEditDepartment !== departmentData.departmentId) {
        setDepartment(departmentData);
      }
    }, [currentEditDepartment]);

    return (
      <>
        <Box className="department-row">
          {isEdit ? (
            <>
              <TextField
                value={department.departmentName}
                onChange={handleChange}
                name="departmentName"
                onBlur={() => handleDepartmentEdit(department)}
              />
              <TextField
                value={translatedTitle ?? ""}
                onChange={handleChange}
                name="departmentTitle"
                onBlur={() => handleDepartmentEdit(department)}
              />
              <Switch
                checked={department.isActive}
                onChange={handleSwitchChange}
              />
            </>
          ) : (
            <>
              <Typography variant="body1">
                {department.departmentName}
              </Typography>
              <Typography variant="body1">
                {translatedTitle ?? formatMessage({ id: "NOT_AVAILABLE" })}
              </Typography>
              <StyleStatus
                label={
                  department.isActive ? "STATUS.ACTIVE" : "STATUS.INACTIVE"
                }
                className={clsx({
                  success: department.isActive,
                  danger: !department.isActive,
                })}
              />
            </>
          )}
          <div className="d-flex align-items-center">
            {!isEdit ? (
              <IconButton onClick={handleEdit} className="border-0">
                <Edit />
              </IconButton>
            ) : (
              <IconButton onClick={handleEditCancel} className="border-0">
                <ClearRounded />
              </IconButton>
            )}
            <IconButton
              onClick={() => setConfirmModalOpen(true)}
              className="border-0"
            >
              <Delete color="error" />
            </IconButton>
          </div>
        </Box>
        {isConfirmModalOpen && (
          <ConfirmationModal
            open={isConfirmModalOpen}
            title={formatMessage({ id: "Department.Delete" })}
            content={formatMessage({ id: "Department.Delete.Alert" })}
            handleClose={() => setConfirmModalOpen(false)}
            handleConfirmation={handleDepartmentDelete}
          />
        )}
      </>
    );
  }
);
