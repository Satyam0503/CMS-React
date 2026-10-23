import { Box, Stack, Typography } from "@mui/material";
import CustomisedButton from "./C_Button";
import Home from "@mui/icons-material/Home";
import { FC } from "react";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

interface PropsTypes {
  type: "error" | "unauthorise";
}

export const UnAuthorizedAccess: FC<PropsTypes> = ({ type }) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
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
            <Typography variant="h3">{formatMessage({ id: "ERROR.UNAUTHORIZED_ACCESS" })}</Typography>
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
            <Typography variant="h3">{formatMessage({ id: "ERROR.SOMETHING_WRONG" })}</Typography>
          </>
        )}
        <CustomisedButton
          label={formatMessage({ id: "BUTTON.RETURN_HOME" })}
          Icon={<Home />}
          handleClick={() => navigate('/')}
        />
      </Stack>
    </Box>
  );
};
