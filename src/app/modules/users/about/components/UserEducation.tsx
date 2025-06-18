import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import {
  Add,
  CalendarToday,
  DeleteOutline,
  Edit,
  School,
} from "@mui/icons-material";
import { UserEducationModel } from "../../../../../utils/common_types";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  checkPermissionForModulesFeatureAccess,
  dateFormatter,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import AddUpdateEducation from "./AddUpdateEducation";
import {
  addEmployeeEducation,
  deleteEmployeeEducation,
  getEmployeeEducations,
  updateEmployeeEducation,
} from "../../userservices";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useParams } from "react-router-dom";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";

const initialValue: UserEducationModel = {
  userId: "",
  educationTitle: "",
  collegeName: "",
  startDate: null,
  endDate: null,
  type: "",
};
export const UserEducation = () => {
  const intl = useIntl();
  const [userEducations, setUserEducations] = useState<UserEducationModel[]>(
    []
  );
  const [educationInitialValues, setEducationInitialValues] =
    useState(initialValue);
  const [isEdit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEducationId, setSeletedEducationId] = useState<string | undefined>();
  const [refresh, setRefresh] = useState(false);
  const employeeId = useParams().employeeid;
  const userPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasEmployeeEditPermission = !employeeId || hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, userPermissions)

  const handleClose = () => {
    setEducationInitialValues(initialValue);
    setOpen(false);
    setEdit(false);
  };

  const handleCloseConfirmation = () => {
    setSeletedEducationId(undefined);
  };

  function handleEducationEdit(education: UserEducationModel) {
    setEdit(true);
    setEducationInitialValues({
      educationId: education.educationId,
      userId: education.userId,
      educationTitle: education.educationTitle,
      collegeName: education.collegeName,
      startDate: education.startDate,
      endDate: education.endDate,
      type: education.type,
    });
    setOpen(true);
  }

  const handleAddUpdateEducation = async (
    values: UserEducationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    values.userId = employeeId ?? "";
    try {
      if (isEdit) {
        const response = await updateEmployeeEducation(values);
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          setRefresh(!refresh);
        }
      } else {
        const response = await addEmployeeEducation(values);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setRefresh(!refresh);
      }
    } catch (error) {
      toast.error((error as AxiosError).message);
    } finally {
      setSubmitting(false);
      handleClose();
    }
  };

  const handleDeleteEducation = async () => {
    if (selectedEducationId) {
      try {
        const response = await deleteEmployeeEducation(
          selectedEducationId,
          employeeId
        );
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          handleCloseConfirmation();
          setRefresh(!refresh);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
    }
  };

  useEffect(() => {
    getEmployeeEducations(employeeId ?? "")
      .then((response) => {
        const { success, message, methodResults } = response.data;
        if (!success) {
          throw new Error(message);
        }
        setUserEducations(methodResults);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, [refresh]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack className="flex-row justify-content-between mb-4">
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
        </Typography>
        {
          hasEmployeeEditPermission &&
          <CustomIconButton
            tooltip={intl.formatMessage({ id: "BUTTON.ADD" })}
            icon={<Add />}
            handleClick={() => setOpen(true)}
          />
        }
      </Stack>
      <Stack spacing={2}>
        {userEducations.length === 0 ? (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {intl.formatMessage({ id: "ADD.EDUCATION" })}
          </Typography>
        ) : (
          userEducations.map((education) => (
            <Stack
              key={education.educationId}
              className="flex-row justify-content-between align-items-center"
              spacing={1}
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Stack
                  className="flex-shrink-0 align-items-center justify-content-center"
                  sx={{
                    color: "primary.main",
                    width: 48,
                    height: 48,
                    bgcolor: "primary.lighter",
                    borderRadius: 1,
                  }}
                >
                  <School />
                </Stack>
                <Stack  >
                  <Typography variant="body1" >
                    {education.educationTitle}
                  </Typography>
                  <Stack
                    direction="row"
                    className="flex-wrap flex-row "
                    spacing={{ xs: 0.5, sm: 2 }}
                  >
                    <Typography variant="body2" className="fw-bold">
                      {education.collegeName}
                    </Typography>
                    <Stack className="flex-row align-items-center gap-1">
                      <CalendarToday className="icon-fs-16" />
                      <Typography variant="body2">
                        {dateFormatter(education.startDate, "MMM YYYY")} -{" "}
                        {dateFormatter(education.endDate, "MMM YYYY")}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              {
                hasEmployeeEditPermission &&
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    visibility: "hidden",
                    transition: "visibility 0.3s ease-in-out",
                  }}
                >
                  <CustomIconButton
                    icon={<Edit />}
                    tooltip={intl.formatMessage({ id: "BUTTON.EDIT" })}
                    handleClick={() => handleEducationEdit(education)}
                  />
                  <CustomIconButton
                    icon={<DeleteOutline />}
                    tooltip={intl.formatMessage({ id: "BUTTON.DELETE" })}
                    handleClick={() => {
                      setSeletedEducationId(education.educationId);
                    }}
                  />
                </Stack>
              }
            </Stack>
          ))
        )}
      </Stack>
      {open && (
        <AddUpdateEducation
          isEdit={isEdit}
          initialValues={educationInitialValues}
          open={open}
          handleAddUpdateEducation={handleAddUpdateEducation}
          handleClose={handleClose}
        />
      )}
      {selectedEducationId && (
        <ConfirmationModal
          title={intl.formatMessage({ id: "Confirmation.Title.Emp_Education" })}
          content={intl.formatMessage({ id: "Confirmation.Content.Emp_Education" })}
          open={true}
          handleClose={handleCloseConfirmation}
          handleConfirmation={handleDeleteEducation}
        />
      )}
    </Card>
  );
};
