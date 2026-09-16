import {
  Avatar,
  Box,
  Card,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Edit, Visibility } from "@mui/icons-material";
import { useState } from "react";
import { useUserDetails } from "../UserDataProvider";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import {
  getDateDiffInYears,
  getStatusCodeString,
} from "../../../../utils/common";
import { PictureUpdateModal } from "./ProfileUpdateModal";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { PayslipPayload } from "../../payroll/models";
import { generatePaySlip } from "../../payroll/services";
import { AxiosError } from "axios";
import { LANGUAGE } from "../../../../utils/enums";

import { AppIconButton } from "../../../shared/components/ui";
export default function ProfileCard() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { formatMessage: i } = useIntl();
  const { userDetails } = useUserDetails();
  const profileImage =
    useAppSelector((state) => state.user.userData?.profileImage) ??
    DEFAULT_USER_AVATAR;
  const employeeId = useParams().employeeid;
  const { currentLanguage } = useAppLang();
  const defaultLanguage =
    useAppSelector((state) => state.user.userData?.defaultLanguage) ??
    LANGUAGE.ENGLISH;
  const [date, setDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const paySlipControlColor = theme.palette.mode === "light"
    ? theme.palette.primary.dark
    : theme.palette.common.white;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setDate(date);
  };

  const viewPaySlip = async () => {
    if (!date) {
      return;
    }
    setLoading(true);
    try {
      const payload: PayslipPayload = {
        month: date.month() + 1,
        year: date.year(),
      };
      const response = await generatePaySlip(payload);
      // open in a new tab - the browser's native PDF viewer lets the user
      // download it themselves from there if they want to keep a copy
      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, "_blank");
    } catch (error) {
      const response = (error as AxiosError).response;
      if (
        (response?.headers["content-type"] as string).includes(
          "application/json",
        )
      ) {
        const errorData = await (response?.data as Blob).text();
        const errorJson = JSON.parse(errorData); // Parse JSON from the response text
        if (errorJson.status) {
          toast.error(i({ id: getStatusCodeString(errorJson.status) }));
        }
      }
    } finally {
      setLoading(false);
      setDate(null);
    }
  };

  return (
    <>
      <Card className="profile-picture-card">
        <Box className="profile-picture">
          <Avatar
            src={
              employeeId
                ? userDetails.profileUrl || DEFAULT_USER_AVATAR
                : profileImage
            }
            className="w-100 h-100"
          />
          {!employeeId && (
            <Stack
              className="profile-picture-cover"
              direction={"row"}
              sx={{
                gap: 1,
              }}
            >
              <CustomIconButton
                handleClick={() => setOpen(true)}
                tooltip={i({ id: "PROFILE.IMAGE.UPLOAD_PICTURE" })}
                icon={
                  <Edit
                    sx={{
                      color: "common.white",
                    }}
                  />
                }
              />
            </Stack>
          )}
        </Box>
        <Stack className="text-center align-items-center" spacing={1}>
          <Typography
            variant="h5"
            sx={{
              color: "common.white",
            }}
          >
            {userDetails?.firstName + " " + userDetails?.lastName}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              bgcolor: "common.white",
              color: "primary.main",
              fontWeight: 600,
            }}
            className="px-4 py-1 rounded-pill"
          >
            {!userDetails?.jobRoleTitle || userDetails.jobRoleTitle === null ? (
              <FormattedMessage id="NOT_AVAILABLE" />
            ) : (
              userDetails.jobRoleTitle[currentLanguage] ||
              userDetails.jobRoleTitle[defaultLanguage]
            )}
          </Typography>
        </Stack>
        <Stack direction="row" className="justify-content-around text-center">
          <Stack>
            <Typography
              variant="h2"
              sx={{
                color: "common.white",
              }}
            >
              {getDateDiffInYears(userDetails.dateOfBirth!) || "NA"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "common.white",
              }}
            >
              {i({ id: "USER.AGE" })}
            </Typography>
          </Stack>
          <Stack>
            <Typography
              variant="h2"
              sx={{
                color: "common.white",
              }}
            >
              {userDetails.bloodGroup || (
                <FormattedMessage id="NOT_AVAILABLE" />
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "common.white",
              }}
            >
              {i({ id: "USER.BLOOD_GROUP" })}
            </Typography>
          </Stack>
        </Stack>
        {!employeeId && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-end"
            sx={{
              width: "100%",
              mt: 1.5,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <CustomisedDatePicker
                label={i({ id: "PROFILE.PI.DOWNLOAD_PAY_SLIP" })}
                views={["month", "year"]}
                value={date}
                maxDate={dayjs().subtract(1, "month")}
                setValue={handleDateChange}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(paySlipControlColor, 0.1),
                    "& fieldset": { borderColor: alpha(paySlipControlColor, 0.82) },
                    "&:hover:not(.Mui-focused)": {
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: paySlipControlColor },
                    },
                    "&.Mui-focused fieldset": { borderColor: paySlipControlColor },
                    color: paySlipControlColor,
                  },
                  "& .MuiInputLabel-root": { color: paySlipControlColor },
                  "& .MuiInputLabel-root.Mui-focused": { color: paySlipControlColor },
                  "& .MuiSvgIcon-root": { color: paySlipControlColor },
                }}
              />
            </Box>
            <AppIconButton
              aria-label="View payslip"
              sx={{
                height: 36,
                width: 36,
                flexShrink: 0,
                borderRadius: 1,
                border: "1px solid",
                borderColor: alpha(paySlipControlColor, 0.82),
                backgroundColor: alpha(paySlipControlColor, 0.1),
                "&:hover": { backgroundColor: alpha(paySlipControlColor, 0.2) },
              }}
              onClick={viewPaySlip}
              disabled={loading}
            >
              {loading ? <span className="loader" /> : <Visibility sx={{ color: paySlipControlColor }} />}
            </AppIconButton>
          </Stack>
        )}
      </Card>
      {open && <PictureUpdateModal open={open} handleClose={handleClose} />}
    </>
  );
}
