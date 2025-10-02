import {
  Add,
  CalendarToday,
  DeleteOutline,
  Edit,
  LocalActivity,
} from "@mui/icons-material";
import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  dateFormatter,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import AddUpdateCertification from "./AddUpdateCertification";
import {
  addEmployeeCertification,
  deleteEmployeeCertification,
  getEmployeeCertifications,
  updateEmployeeCertification,
} from "../../userservices";
import { toast } from "react-toastify";

import { AxiosError } from "axios";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useParams } from "react-router-dom";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { UserCertificationModel } from "../../models";

const initialValue: UserCertificationModel = {
  certificationTitle: "",
  organisationName: "",
  startDate: null,
  endDate: null,
  mode: "",
};

export const UserCertification = () => {
  const intl = useIntl();
  const [userCertifications, setUserCertifications] = useState<
    UserCertificationModel[]
  >([]);
  const [initialValues, setInitialValues] = useState(initialValue);
  const [isEdit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedCertificationId, setSelectedCertificationId] = useState<string | undefined>();
  const employeeId = useParams().employeeid;
  const userPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasEmployeeEditPermission = !employeeId || hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, userPermissions);

  async function handleAddUpdateCertification(
    values: UserCertificationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    values.userId = employeeId ?? "";
    try {
      if (isEdit) {
        const response = await updateEmployeeCertification(values);
        const { success, message } = response.data;
        if (success) {
          toast.success(intl.formatMessage({ id: "TOAST.SUCCESS.UPDATE_CERTIFICATION" }));
          setRefresh(!refresh);
        }
      } else {
        const response = await addEmployeeCertification(values);
        const { success, message } = response.data;
        if (success) {
          toast.success(intl.formatMessage({ id: "TOAST.SUCCESS.ADD_CERTIFICATION" }));
          setRefresh(!refresh);
        }
      }
    } catch (error) {
      toast.error((error as AxiosError).message);
    } finally {
      setSubmitting(false);
      handleClose();
    }
  }

  function handleCertificationEdit(certification: UserCertificationModel) {
    setEdit(true);
    setInitialValues({
      certificationTitle: certification.certificationTitle,
      certificationId: certification.certificationId,
      organisationName: certification.organisationName,
      startDate: certification.startDate,
      endDate: certification.endDate,
      mode: certification.mode,
      userId: certification.userId,
    });
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setInitialValues(initialValue);
    setEdit(false);
  };

  function closeConfirmationModal() {
    setSelectedCertificationId(undefined);
  }

  async function deleteCertification() {
    if (selectedCertificationId) {
      try {
        const response = await deleteEmployeeCertification(
          selectedCertificationId,
          employeeId
        );
        const { success, message } = response.data;
        if (success) {
          toast.success(intl.formatMessage({ id: "TOAST.SUCCESS.DELETE" }));
          closeConfirmationModal();
          setRefresh(!refresh);
        }
      } catch (error) {
        console.log((error as AxiosError).message);
      }
    }
  }

  useEffect(() => {
    getEmployeeCertifications(employeeId ?? "")
      .then((response) => {
        const { success, methodResults, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        setUserCertifications(methodResults);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [refresh]);


  return (
    <Card sx={{ p: 2 }}>
      <Stack className="flex-row justify-content-between mb-4" >
        <Typography variant="h5" >
          {intl.formatMessage({ id: "PROFILE.CERTIFICATION.TITLE" })}
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
        {userCertifications.length === 0 ? (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {intl.formatMessage({ id: "PROFILE.CERTIFICATION.NONE" })}
          </Typography>
        ) : (
          userCertifications.map((certification) => (
            <Stack
              key={certification.certificationId}
              className="flex-row justify-content-between align-items-center"
              spacing={1}
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Stack
                  className="flex-shrink-0 align-items-center justify-content-center"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "secondary.lighter",
                    color: "secondary.dark",
                    borderRadius: 1,
                  }}
                >
                  <LocalActivity />
                </Stack>

                <Stack>
                  <Typography variant="body1" >
                    {certification.certificationTitle}
                  </Typography>
                  <Stack
                    direction="row"
                    className="flex-wrap flex-row align-items-center"
                    spacing={{ xs: 0.5, sm: 2 }}
                  >
                    <Typography variant="body2" className="fw-bold">
                      {certification.organisationName},{certification.mode}
                    </Typography>
                    <Stack className="flex-row align-items-center gap-1">
                      <CalendarToday className="fs-16" />
                      <Typography variant="body2">
                        {dateFormatter(certification.startDate, "MMM YYYY")}
                        {" - "}
                        {dateFormatter(certification.endDate, "MMM YYYY")}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              {hasEmployeeEditPermission &&
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
                    handleClick={() => handleCertificationEdit(certification)}
                  />
                  <CustomIconButton
                    icon={<DeleteOutline />}
                    tooltip={intl.formatMessage({ id: "BUTTON.DELETE" })}
                    handleClick={() => {
                      setSelectedCertificationId(certification.certificationId);
                    }}
                  />
                </Stack>
              }
            </Stack>
          ))
        )}
      </Stack>
      {
        open && (
          <AddUpdateCertification
            isEdit={isEdit}
            open={open}
            initialValues={initialValues}
            handleAddUpdateCertification={handleAddUpdateCertification}
            handleClose={handleClose}
          />
        )
      }
      {
        Boolean(selectedCertificationId) && (
          <ConfirmationModal
            title={intl.formatMessage({ id: "CONFIRMATION.TITLE.DELETE_CERTIFICATION" })}
            content={intl.formatMessage({ id: "CONFIRMATION.CONTENT.DELETE_CERTIFICATION" })}
            open={true}
            handleClose={closeConfirmationModal}
            handleConfirmation={deleteCertification}
          />
        )
      }
    </Card >
  );
};
