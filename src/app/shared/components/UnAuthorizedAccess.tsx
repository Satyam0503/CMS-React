import { Box, Stack, Typography } from "@mui/material";
import CustomisedButton from "./CustomisedButton";
import { Home } from "@mui/icons-material";
import { FC } from "react";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { colors } from "../../modules/theme/MuiTheme";

interface PropsTypes {
  type: "error" | "unauthorise";
}

export const UnAuthorizedAccess: FC<PropsTypes> = ({ type }) => {
  // const navigate = useNavigate();
  return (
    <Box component={"div"} className="align-child-center">
      <Stack spacing={3} sx={{ alignItems: "center" }}>
        {type === "unauthorise" ? (
          <>
            <Box
              component={"div"}
              sx={{ maxWidth: "250px", height: "auto", marginInline: "auto" }}
            >
              <img
                src={toAbsoluteUrl("media/auth/access-denied.svg")}
                width={"100%"}
                height={"100%"}
              />
            </Box>
            <Typography variant="h3">Unauthorized Access</Typography>
            <Typography variant="h4"></Typography>
          </>
        ) : (
          <>
            <Box
              component={"div"}
              sx={{ maxWidth: "250px", height: "auto", marginInline: "auto" }}
            >
              <img
                src={toAbsoluteUrl("media/auth/cancel.svg")}
                width={"100%"}
                height={"100%"}
              />
            </Box>
            <Typography variant="h3">Something Went Wrong</Typography>
            <Typography variant="h4"></Typography>
          </>
        )}
        <CustomisedButton
          label="Return to Dashboard"
          style={{ backgroundColor: colors.alpha.primary[500] }}
          Icon={<Home />}
          iconPosition="end"
          handleClick={() => (window.location.href = "/")}
        />
      </Stack>
    </Box>
  );
};
