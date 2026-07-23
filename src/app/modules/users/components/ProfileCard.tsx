import {
  Avatar,
  Box,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Edit, Visibility } from "@mui/icons-material";
import { useState } from "react";
import { useUserDetails } from "../UserDataProvider";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import {
  getDateDiffInYears,
  getStatusCodeString,
} from "../../../../utils/common";
import { PictureUpdateModal } from "./ProfileUpdateModal";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { PayslipPayload } from "../../payroll/models";
import { generatePaySlip } from "../../payroll/services";
import { AxiosError } from "axios";
import { LANGUAGE } from "../../../../utils/enums";

import { AppIconButton } from "../../../shared/components/ui";
export default function ProfileCard() {
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
            className="gap-2 align-items-end justify-content-center"
          >
            <CustomisedDatePicker
              label={i({ id: "PROFILE.PI.DOWNLOAD_PAY_SLIP" })}
              views={["month", "year"]}
              value={date}
              maxDate={dayjs().subtract(1, "month")}
              setValue={handleDateChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "common.white",
                  },
                  "&:hover:not(.Mui-focused)": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "common.white",
                    },
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "common.white",
                  },
                  color: "common.white",
                },
                "& .MuiInputLabel-root": {
                  color: "common.white",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "common.white",
                },
                "& .MuiSvgIcon-root": {
                  color: "common.white",
                },
              }}
            />
            <AppIconButton
              className="border-1 border-white"
              sx={{ height: 36, width: 36, borderRadius: 1 }}
              onClick={viewPaySlip}
              disabled={loading}
            >
              {loading ? (
                <span className="loader" />
              ) : (
                <Visibility sx={{ color: "#fff" }} />
              )}
            </AppIconButton>
          </Stack>
        )}
      </Card>
      {open && <PictureUpdateModal open={open} handleClose={handleClose} />}
    </>
  );
}
