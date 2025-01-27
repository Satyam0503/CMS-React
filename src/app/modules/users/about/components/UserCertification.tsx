import {
  Add,
  CalendarMonth,
  DeleteOutline,
  Edit,
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
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import { useUserDetails } from "../../UserDataProvider";

const initialValue: UserCertificationModel = {
  certificationId: "",
  certificationTitle: "",
  organisationName: "",
  startDate: null,
  endDate: null,
  mode: "",
};


export const UserCertification= () => {
  const intl = useIntl();
  const {userDetails:{userCertifications},setRefresh,isRefresh}= useUserDetails();
  const [initialValues, setInitialValues] = useState(initialValue);
  const [isEdit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token!);

  async function handleAddUpdateCertification(
    values: UserCertificationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    if (isEdit) {
      const payload = {};
      // updateUserCertification()   // replace comment with updating certification logic
    } else {
      try {
        const response = await addEmployeeCertification(values, token);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        setSubmitting(false);
        toast.success(message);
        setRefresh(!isRefresh);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }

  function handleCertificationUpdate(certification: UserCertificationModel) {
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

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={2}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
        </Typography>
        <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} />
      </Stack>

      <Stack spacing={2}>
        {userCertifications.length === 0 ? (
          <Typography variant="body2">
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
            >
              <Stack direction="row" alignItems={"center"}>
                <School sx={{ marginInlineEnd: 4 }} />
                <Stack>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    color={colors.alpha.neutral[800]}
                  >
                    {certification.certificationTitle}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      display={"block"}
                      fontWeight={500}
                    >
                      {certification.organisationName},{certification.mode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ display: "block" }}
                      fontWeight={500}
                    >
                      <CalendarMonth sx={{ height: "14px" }} />

                      {dateFormatter(certification.startDate, "MMM YYYY")}
                      {" - "}
                      {dateFormatter(certification.endDate, "MMM YYYY")}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <CustomIconButton
                  icon={<Edit />}
                  handleClick={() => handleCertificationUpdate(certification)}
                />
                <CustomIconButton
                  icon={<DeleteOutline />}
                  //   handleClick={() =>
                  //     // deleteCertification(certification.certificationId)
                  //   }
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
    </Card>
  );
};
