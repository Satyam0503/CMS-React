import { Stack, Typography, Grid, Card, Avatar, Button } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { AttendanceChart } from "../components/AttendanceChart";
import { colors } from "../theme/MuiTheme";
import CustomisedButton from "../components/CustomisedButton";
import { ContactEmergency, ContactPage, Message } from "@mui/icons-material";
export default function DynamicContent() {
  const intl = useIntl();
  return (
    <>
      <Grid container gap={3}>
        <AttendanceChart
          className="card-xxl-stretch mb-xl-3"
          chartColor="primary"
          chartHeight="170px"
        />

        <Stack direction={"column"} gap={3} width={"100%"}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              {intl.formatMessage({ id: "MENU.LEAVE" })}
            </Typography>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Deepak Chaurasiya</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  5-Dec to 25-Dec
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Satish Singh</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  Today
                </Typography>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              {intl.formatMessage({ id: "MENU.TOP_PUNCTUAL" })}
            </Typography>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Deepak Chaurasiya</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  1st
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Mohan Singh</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  2nd
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Mohan Singh</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  3rd
                </Typography>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              {intl.formatMessage({ id: "MENU.BIRTHDAY" })}
            </Typography>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Deepak Chaurasiya</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  Today
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Mohan Singh</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  5-Jan
                </Typography>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              {intl.formatMessage({ id: "MENU.EMP_OF_MONTH" })}
            </Typography>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Deepak Chaurasiya</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  1st
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              mb={1}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Mohan Singh</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  2nd
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Ramesh Singh</Typography>
                  <Typography variant="body2" color={colors.alpha.neutral[400]}>
                    {intl.formatMessage({ id: "POSITION.QA" })}
                  </Typography>
                </Stack>
              </Stack>
              <Stack>
                <Typography
                  variant="subtitle2"
                  color={colors.alpha.primary[500]}
                >
                  3rd
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Stack>

        <Card sx={{ p: 2 }}>
          <Typography variant="h6">
            {intl.formatMessage({ id: "MENU.HELP" })}
          </Typography>
          <Typography variant="body2" color={colors.alpha.neutral[400]} my={1}>
            {intl.formatMessage({ id: "MENU.HELP_INFO" })}
          </Typography>
          <CustomisedButton
            variant="contained"
            label="Contact"
            Icon={<Message />}
            iconPosition="start"
          />
        </Card>
      </Grid>
    </>
  );
}
