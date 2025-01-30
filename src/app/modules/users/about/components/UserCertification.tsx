import {
  Add,
  CalendarMonth,
  CalendarToday,
  DeleteOutline,
  Edit,
  LocalActivity,
  School,
} from "@mui/icons-material";
import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { FC, useEffect, useState } from "react";
import { UserCertificationModel } from "../../../../../utils/common_types";
import { useIntl } from "react-intl";
import { colors } from "../../../theme/MuiTheme";
import { dateFormatter } from "../../../../../utils/common";
import dayjs from "dayjs";
import AddUpdateCertification from "./AddUpdateCertification";
import { addEmployeeCertification } from "../../userservices";
import { toast } from "react-toastify";
import { useUserDetails } from "../../UserDataProvider";
import { ConfirmationModal } from "../../../components/ConfirmationModal";

const initialValue: UserCertificationModel = {
  certificationId: "",
  certificationTitle: "",
  organisationName: "",
  startDate: null,
  endDate: null,
  mode: "",
};

export const UserCertification = () => {
  const intl = useIntl();
  const {
    userDetails: { userCertifications },
    setRefresh,
    isRefresh,
  } = useUserDetails();
  const [initialValues, setInitialValues] = useState(initialValue);
  const [isEdit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedCertification, setSelectedCertification] =
    useState<UserCertificationModel | null>(null);

  async function handleAddUpdateCertification(
    values: UserCertificationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    if (isEdit) {
      const payload = {};
      // updateUserCertification()   // replace comment with updating certification logic
    } else {
      try {
        const response = await addEmployeeCertification(values);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setRefresh(!isRefresh);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
      }
      finally{
        setSubmitting(false);
      }
    }
  }

  function handleCertificationEdit(certification: UserCertificationModel) {
    setEdit(true);
    const value = {
      certificationTitle: certification.certificationTitle,
      startDate: dayjs(certification.startDate),
      endDate: dayjs(certification.endDate),
      organisationName: certification.organisationName,
      mode: certification.mode,
      certificationId: certification.certificationId,
    };
    setInitialValues(value);
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setInitialValues(initialValue);
    setEdit(false);
  };

  function closeConfirmationModal() {
    setConfirmModal(false);
    setSelectedCertification(null);
  }

  function deleteCertification(res: string) {
    if (!selectedCertification) {
      toast.error("Request Failed");
    }
    // handle delete logic
  }

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
        <CustomIconButton
          tooltip="Add"
          icon={<Add />}
          handleClick={() => setOpen(true)}
        />
      </Stack>

      <Stack spacing={{ xs: 0.5, sm: 1 }}>
        {userCertifications.length === 0 ? (
          <Typography variant="body2" flexWrap={"wrap"}>
            {intl.formatMessage({ id: "ADD.CERTIFICATION" })}
          </Typography>
        ) : (
          userCertifications.map((certification, index) => (
            <Stack
              // key={certification.certificationId}
              key={index}
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              spacing={1}
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
                  <Stack direction={{ sx: "column", sm: "row" }} spacing={1}>
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
                    setConfirmModal(true);
                    setSelectedCertification(certification);
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
      {confirmModal && (
        <ConfirmationModal
          title="Delete Certification"
          content="Are you sure you want to delete this Certification ?"
          open={confirmModal}
          handleClose={closeConfirmationModal}
          handleConfirmation={deleteCertification}
        />
      )}
    </Card>
  );
};
