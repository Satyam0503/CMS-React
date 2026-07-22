import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import {
  Add,
  CalendarToday,
  DeleteOutline,
  Edit,
  School,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  dateFormatter,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import AddUpdateEducation from "./AddUpdateEducation";
import {
  deleteEmployeeEducation,
  getEmployeeEducations,
} from "../../userservices";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useParams } from "react-router-dom";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { UserEducationModel } from "../../models";

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

  const handleRefresh = () => {
    setRefresh(!refresh);
  }

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

  const handleDeleteEducation = async () => {
    if (selectedEducationId) {
      try {
        const response = await deleteEmployeeEducation(
          selectedEducationId,
          employeeId
        );
        const { success } = response.data;
        if (success) {
          toast.success(intl.formatMessage({ id: "TOAST.SUCCESS.DELETE" }));
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
        console.error((error as Error).message);
      });
  }, [employeeId, refresh]);

  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 8px 24px rgba(0,0,0,.05)" }}>
      <Stack className="flex-row justify-content-between" sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {intl.formatMessage({ id: "PROFILE.EDUCATION.TITLE" })}
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
            {intl.formatMessage({ id: "PROFILE.EDUCATION.NONE" })}
          </Typography>
        ) : (
          userEducations.map((education) => (
            <Stack
              key={education.educationId}
              className="flex-row justify-content-between align-items-center"
              spacing={1}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                transition: "transform .2s ease, border-color .2s ease, background-color .2s ease",
                "&:hover": { transform: "translateX(3px)", borderColor: "primary.light", bgcolor: "action.hover" },
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" spacing={1} sx={{
                alignItems: "center"
              }}>
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
                      <CalendarToday className="fs-16" />
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
          refresh={handleRefresh}
          open={open}
          handleClose={handleClose}
        />
      )}
      {selectedEducationId && (
        <ConfirmationModal
          title={intl.formatMessage({ id: "CONFIRMATION.TITLE.DELETE_EDUCATION" })}
          content={intl.formatMessage({ id: "CONFIRMATION.CONTENT.DELETE_EDUCATION" })}
          open={true}
          handleClose={handleCloseConfirmation}
          handleConfirmation={handleDeleteEducation}
        />
      )}
    </Card>
  );
};
