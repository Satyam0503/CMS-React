import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
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

import { AppButton } from "../../../shared/components/ui";
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
  const paySlipControlColor = theme.palette.common.white;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setDate(date);
  };

  const lifecycleBadges = [
  userDetails?.employmentStatus &&
    userDetails.employmentStatus !== "Active" &&
    {
      label: userDetails.employmentStatus,
      color: "warning" as const,
      ariaLabel: `Employment status: ${userDetails.employmentStatus}`,
    },
  userDetails?.availabilityStatus &&
    userDetails.availabilityStatus !== "Working" &&
    {
      label: userDetails.availabilityStatus.replace(
        /([a-z])([A-Z])/g,
        "$1 $2",
      ),
      color: "info" as const,
      ariaLabel: `Availability status: ${userDetails.availabilityStatus}`,
    },
].filter(
  (badge): badge is {
    label: string;
    color: "warning" | "info";
    ariaLabel: string;
  } => Boolean(badge),
);

  const viewPaySlip = async () => {
    if (!date) {
      toast.info(i({ id: "PAYROLL.SELECT_PAY_MONTH", defaultMessage: "Please select pay month" }));
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
        {lifecycleBadges.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center">
            {lifecycleBadges.map((badge) => (
              <Chip
                key={badge.ariaLabel}
                size="small"
                color={badge.color}
                label={badge.label}
                aria-label={badge.ariaLabel}
              />
            ))}
          </Stack>
        )}
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
            spacing={1.25}
            sx={{
              width: "100%",
              mt: 1.5,
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#ffffff !important",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.01em",
                  mb: 0.75,
                  display: "block",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
                }}
              >
                {i({ id: "PROFILE.PI.DOWNLOAD_PAY_SLIP" })}
              </Typography>
              <CustomisedDatePicker
                className="profile-payslip-datepicker"
                views={["month", "year"]}
                value={date}
                maxDate={dayjs().subtract(1, "month")}
                setValue={handleDateChange}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
                    height: 40,
                    backgroundColor: "#ffffff !important",
                    borderRadius: "8px !important",
                    color: "#0f172a !important",
                    WebkitTextFillColor: "#0f172a !important",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                    "& *": {
                      color: "#0f172a !important",
                      WebkitTextFillColor: "#0f172a !important",
                    },
                    "& fieldset, & .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(15, 23, 42, 0.16) !important",
                    },
                    "&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(15, 23, 42, 0.35) !important",
                    },
                    "&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4F46E5 !important",
                      borderWidth: "2px !important",
                    },
                    "& input, & .MuiInputBase-input": {
                      color: "#0f172a !important",
                      WebkitTextFillColor: "#0f172a !important",
                      fontWeight: 600,
                    },
                    "& input::placeholder, & .MuiPickersSectionList-placeholder": {
                      color: "#475569 !important",
                      WebkitTextFillColor: "#475569 !important",
                      opacity: "1 !important",
                      fontWeight: 500,
                    },
                    "& .MuiPickersSectionList-root, & .MuiPickersSectionList-sectionContent, & .MuiPickersSectionList-sectionSeparator": {
                      color: "#0f172a !important",
                      WebkitTextFillColor: "#0f172a !important",
                      fontWeight: 600,
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#1e1b4b !important",
                      fill: "#1e1b4b !important",
                    },
                  },
                }}
              />
            </Box>
            <AppButton
              aria-label="View payslip"
              className="profile-payslip-button"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#1E1B4B !important" }} />
                ) : (
                  <Visibility sx={{ color: "#1E1B4B !important", fill: "#1E1B4B !important" }} />
                )
              }
              fullWidth
              sx={{
                height: 40,
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.875rem",
                letterSpacing: "0.01em",
                backgroundColor: "#ffffff !important",
                color: "#1E1B4B !important",
                WebkitTextFillColor: "#1E1B4B !important",
                border: "none !important",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.18)",
                transition: "all 0.18s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f1f5f9 !important",
                  color: "#1E1B4B !important",
                  WebkitTextFillColor: "#1E1B4B !important",
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
              variant="contained"
              onClick={viewPaySlip}
            >
              {loading ? "Generating..." : "View Pay Slip"}
            </AppButton>
          </Stack>
        )}
      </Card>
      {open && <PictureUpdateModal open={open} handleClose={handleClose} />}
    </>
  );
}
