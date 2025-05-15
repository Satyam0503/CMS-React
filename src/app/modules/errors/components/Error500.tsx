import { Link, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Container, Grid, Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Home } from "@mui/icons-material";
import { useIntl } from "react-intl";

const Error500 = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: "center", justifyContent: "center", p: 2 }}>
      <Grid item sm={9} md={5} sx={{ alignItems: "center" }}>
        <img
          src={toAbsoluteUrl("media/auth/500-error.png")}
          alt=""
          style={{ maxHeight: "500px", maxWidth: "100%" }}
        />
      </Grid>
      <Grid item sm={10} md={6}>
        <Stack spacing={1}>
          <Typography variant="h1" fontWeight={700} fontSize="52px" >
            {formatMessage({ id: "Error.500.SYSTEM_ERROR" })}
          </Typography>
          <Typography variant="h2" fontWeight={700}> {formatMessage({ id: "Error.404.PAGE_NOT_FOUND" })}</Typography>
          <Typography variant="h6">
            {formatMessage({ id: "Error.500.NOTE" })}
          </Typography>
        </Stack>

        <CustomisedButton
          label={formatMessage({ id: "BUTTON.RETURN_HOME" })}
          Icon={<Home />}
          iconPosition="start"
          handleClick={() => navigate("/")}
          className="mt-10"
        />
      </Grid>
    </Grid>
  );
};

export { Error500 };
