import { Stack, Typography, Grid, Card, Avatar, Button } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";
import { colors } from "../../../theme/MuiTheme";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { Message } from "@mui/icons-material";

export default function Help() {
  const intl = useIntl();
  return (
    <>
      <Card sx={{ p: 2 }}>
        <Typography variant="h6">
          {intl.formatMessage({ id: "MENU.HELP" })}
        </Typography>
        <Typography variant="body2" my={1}>
          {intl.formatMessage({ id: "MENU.HELP_INFO" })}
        </Typography>
        <CustomisedButton
          variant="contained"
          label="Contact"
          Icon={<Message />}
          iconPosition="start"
        />
      </Card>
    </>
  );
}
