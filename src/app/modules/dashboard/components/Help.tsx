import { Stack, Typography, Grid, Card, Avatar, Button } from "@mui/material";
import { useIntl } from "react-intl";
import { Message } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomCard } from "../../../shared/components/CustomCard";

export default function Help() {
  const intl = useIntl();
  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.HELP" })}>
        <Typography variant="body2" my={1}>
          {intl.formatMessage({ id: "MENU.HELP_INFO" })}
        </Typography>
        <CustomisedButton
          variant="contained"
          label="Contact"
          Icon={<Message />}
          iconPosition="start"
        />
      </CustomCard>
    </>
  );
}
