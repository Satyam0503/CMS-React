import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Grid, Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../shared/components/C_Button";
import { Home } from "@mui/icons-material";
import { useIntl } from "react-intl";

const Error404: FC = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: "center", justifyContent: "center", p: 2 }}>
      <Grid
        sx={{ alignItems: "center" }}
        size={{
          sm: 9,
          md: 5
        }}>
        <img
          src={toAbsoluteUrl("media/auth/404-error.png")}
          alt=""
          style={{ maxHeight: "500px", maxWidth: "100%" }}
        />
      </Grid>
      <Grid
        size={{
          sm: 10,
          md: 6
        }}>
        <Stack spacing={1}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              fontSize: "52px"
            }}>
            {formatMessage({ id: "ERROR.OPPS" })}
          </Typography>
          <Typography variant="h2" sx={{
            fontWeight: 700
          }}> {formatMessage({ id: "ERROR.PAGE_NOT_FOUND" })}</Typography>
          <Typography variant="h6">
            {formatMessage({ id: "ERROR.404" })}
          </Typography>
        </Stack>

        <CustomisedButton
          label={formatMessage({ id: "BUTTON.RETURN_HOME" })}
          Icon={<Home />}
          handleClick={() => navigate("/")}
          className="mt-10"
        />
      </Grid>
    </Grid>
  );
};

export { Error404 };
