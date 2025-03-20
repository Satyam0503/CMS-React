import { FC } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";

const Error404: FC = () => {
  return (
    <>
      <Typography variant="h2" fontWeight={700}>
        Oops!
      </Typography>
      <Typography variant="body2">We can't find that page.</Typography>
      <Stack alignItems={"center"} my={3}>
        <img
          src={toAbsoluteUrl("media/auth/404-error.png")}
          alt=""
          style={{ maxHeight: "300px", maxWidth: "100%" }}
        />
        <img
          src={toAbsoluteUrl("media/auth/404-error-dark.png")}
          alt=""
          style={{ maxHeight: "300px", maxWidth: "100%" }}
        />
      </Stack>

      <Link to="/">
        <CustomisedButton label="Return Home" variant="contained" />
      </Link>
    </>
  );
};

export { Error404 };
