import {
  alpha,
  Avatar,
  Box,
  Card,
  Container,
  Grid,
  lighten,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { FC } from "react";


import { EmployeeModel } from "../../../../../utils/common_types";
import { colors } from "../../../theme/MuiTheme";
import { getDateDiffInYears } from "../../../../../utils/common";

interface Props {
    employeeDetails:EmployeeModel
}
export const EmployeeProfileCard:FC<Props> =({employeeDetails})=> {
  const intl = useIntl();
  return (
    <>
      <Card
        sx={{
          width: "100%",
          bgcolor: colors.alpha.primary[500],
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        <Grid
          container
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          p={1}
          mt={1}
          sx={{
            height: "150px",
            width: "150px",
            border: "1px solid white",
            borderRadius: "50%",
            position: "relative",
            transition: "transform 0.3s ease-in-out",
            "&:hover img": {
              opacity: 0.2,
            },
          }}
          className="gridContainer"
        >
          <Avatar
            alt=""
            src={employeeDetails.fullProfileUrl}
            sx={{
              width: "100%",
              height: "100%",
            }}
          />
        </Grid>
        <Stack textAlign={"center"} alignItems={"center"}>
          <Typography variant="h5" color={"white"} mb={0.5}>
            {employeeDetails?.firstName + " " + employeeDetails?.lastName}
          </Typography>
          <Typography
            variant="body2"
            color={"white"}
            borderRadius={2}
            py={0.5}
            px={1}
            sx={{
              backgroundColor: alpha(
                lighten(colors.alpha.white[500], 0.2),
                0.2
              ),
            }}
          >
            {employeeDetails.jobRole || "NA"}
          </Typography>
        </Stack>
        <Stack
          display={"flex"}
          direction={"row"}
          justifyContent={"space-around"}
          textAlign={"center"}
          width={"100%"}
        >
          <Stack>
            <Typography variant="h2" color={"white"}>
              {getDateDiffInYears(employeeDetails.dateOfBirth!) || "NA"}
            </Typography>
            <Typography variant="body2" color={"white"}>
              {intl.formatMessage({ id: "USER.AGE" })}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h2" color={"white"}>
              {employeeDetails.bloodGroup || "NA"}
            </Typography>
            <Typography variant="body2" color={"white"}>
              {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
            </Typography>
          </Stack>
        </Stack>
      </Card>
     
    </>
  );
}
