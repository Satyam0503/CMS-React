import { Box, Stack, Typography } from "@mui/material";
import CustomisedButton from "./C_Button";
import Home from "@mui/icons-material/Home";
import { FC, useEffect, useRef } from "react";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface PropsTypes {
  type: "error" | "unauthorise";
}

export const UnAuthorizedAccess: FC<PropsTypes> = ({ type }) => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (type === "unauthorise") {
      if (!hasNotified.current) {
        hasNotified.current = true;
        toast.error("Access Denied: You do not have permission to access this page.");
      }
      if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [type, navigate]);

  if (type === "unauthorise") {
    return null;
  }

  return (
    <Box component={"div"} className="align-child-center">
      <Stack spacing={3} sx={{ alignItems: "center" }}>
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
        <CustomisedButton
          label={formatMessage({ id: "BUTTON.RETURN_HOME" })}
          Icon={<Home />}
          handleClick={() => navigate('/')}
        />
      </Stack>
    </Box>
  );
};
