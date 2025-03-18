import { FC } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";

const Error500: FC = () => {
  return (
    <>
      <Typography variant="h2" fontWeight={700}>
        System Error
      </Typography>
      <Typography variant="body2">
        Something went wrong! Please try again later.
      </Typography>

      <Stack alignItems={"center"} my={3}>
        <img
          src={toAbsoluteUrl("media/auth/500-error.png")}
          // className="mw-100 mh-300px theme-light-show"
          alt=""
          style={{ maxHeight: "300px", maxWidth: "100%" }}
        />
        <img
          src={toAbsoluteUrl("media/auth/500-error-dark.png")}
          // className="mw-100 mh-300px theme-dark-show"
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

export { Error500 };
