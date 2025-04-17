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
import { UserCertificationModel } from "../../../../../utils/common_types";
import { useIntl } from "react-intl";
import { colors } from "../../../theme/MuiTheme";
import { checkPermissionForModulesFeatureAccess, dateFormatter } from "../../../../../utils/common";
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
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCertificationId, setSelectedCertificationId] = useState<
    string | undefined
  >();
  const employeeId = useParams().employeeid;
  const userPermissions = useAppSelector(state =>state.user.userData?.modulePermission) ?? [];

  async function handleAddUpdateCertification(
    values: UserCertificationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) {   
    try {
      if (isEdit) {
        const response = await updateEmployeeCertification(values);
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          setRefresh(!refresh);
        }
      } else {
        const response = await addEmployeeCertification(values);
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
  }

  function handleCertificationEdit(certification: UserCertificationModel) {
    setEdit(true);
    setInitialValues({ ...certification });
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setInitialValues(initialValue);
    setEdit(false);
  };

  function closeConfirmationModal() {
    setSelectedCertificationId(undefined);
    setConfirmModalOpen(false);
  }

  async function deleteCertification() {
    if (selectedCertificationId) {
      try {
        const response = await deleteEmployeeCertification(
          selectedCertificationId
        );
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
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
        toast.error(error.message);
      });
  }, [refresh]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={2}
      >
        <Typography variant="h5" flexWrap={"wrap"}>
          {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
        </Typography>
        {
          (!employeeId ||
                    checkPermissionForModulesFeatureAccess(
                      `${ModulesName.Employees}.${Permission.Edit}`,
                      userPermissions
                    )) && 
        <CustomIconButton
        tooltip="Add"
        icon={<Add />}
        handleClick={() => setOpen(true)}
        />
      }
      </Stack>

      <Stack spacing={{ xs: 0.5, sm: 1 }}>
        {userCertifications.length === 0 ? (
          <Typography variant="body2" flexWrap={"wrap"}>
            {intl.formatMessage({ id: "ADD.CERTIFICATION" })}
          </Typography>
        ) : (
          userCertifications.map((certification) => (
            <Stack
              key={certification.certificationId}
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              spacing={1}
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Stack
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: colors.alpha.secondary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <Stack color={colors.alpha.secondary[500]}>
                    <LocalActivity />
                  </Stack>
                </Stack>

                <Stack>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    color={colors.alpha.neutral[800]}
                  >
                    {certification.certificationTitle}
                  </Typography>
                  <Stack
                    direction={{ sx: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "flex-end" }}
                  >
                    <Typography
                      variant="caption"
                      display={"block"}
                      fontWeight={500}
                    >
                      {certification.organisationName},{certification.mode}
                    </Typography>
                    <Typography variant="body2">
                      <CalendarToday
                        sx={{
                          height: "1rem",
                          width: "inherit",
                          mb: 0.4,
                          mr: 0.5,
                        }}
                      />

                      {dateFormatter(certification.startDate, "MMM YYYY")}
                      {" - "}
                      {dateFormatter(certification.endDate, "MMM YYYY")}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack
                direction={{ sx: "column", sm: "row" }}
                spacing={1}
                rowGap={0.5}
                sx={{
                  visibility: "hidden",
                  transition: "visibility 0.3s ease-in-out",
                }}
              >
                <CustomIconButton
                  icon={<Edit />}
                  tooltip="Edit"
                  handleClick={() => handleCertificationEdit(certification)}
                />
                <CustomIconButton
                  icon={<DeleteOutline />}
                  tooltip="Delete"
                  handleClick={() => {
                    setConfirmModalOpen(true);
                    setSelectedCertificationId(certification.certificationId);
                  }}
                />
              </Stack>
            </Stack>
          ))
        )}
      </Stack>
      {open && (
        <AddUpdateCertification
          isEdit={isEdit}
          open={open}
          initialValues={initialValues}
          handleAddUpdateCertification={handleAddUpdateCertification}
          handleClose={handleClose}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          title="Delete Certification"
          content="Are you sure you want to delete this Certification ?"
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={deleteCertification}
        />
      )}
    </Card>
  );
};
