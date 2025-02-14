import { Box, Stack } from "@mui/material";
import CustomisedButton from "./CustomisedButton";
import { Home } from "@mui/icons-material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface PropsTypes {
  type: "error" | "unauthorise";
}

export const UnAuthorizedAccess: FC<PropsTypes> = ({ type }) => {
  const navigate = useNavigate();
  return (
    <Box component={"div"} className="align-child-center">
      <Stack spacing={2}>
        {/* {type === "unauthorise" ? (
          <Box
            component={"div"}
            sx={{ maxWidth: "300px", height: "auto", marginInline: "auto" }}
          >
            <img
              src={toAbsoluteUrl("media/auth/access-denied.svg")}
              width={"100%"}
              height={"100%"}
            />
          </Box>
        ) : (
          <Box
            component={"div"}
            sx={{ maxWidth: "300px", height: "auto", marginInline: "auto" }}
          >
            <img
              src={toAbsoluteUrl("media/auth/cancel.svg")}
              width={"100%"}
              height={"100%"}
            />
          </Box>
        )} */}
        <CustomisedButton
          label="Return to Dashboard"
          Icon={<Home />}
          iconPosition="end"
          handleClick={() => navigate("/")}
        />
      </Stack>
    </Box>
  );
};
