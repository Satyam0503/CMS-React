import Typography from "@mui/material/Typography";
import { Stack, useTheme } from "@mui/material";
import PropTypes from "prop-types";
import { SiteThemeColor } from "../theme/base";

type Props = {
  icon: JSX.Element;
  number: string;
  title: string;
  variant: string;
};
const IconStat = ({ icon, number, title, variant }: Props) => {
  const theme = useTheme();
  return (
    <Stack spacing={2} alignItems="center">
      <Stack
        sx={{
          width: 48,
          height: 48,
          background: variant,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Stack>
      <Stack alignItems="center">
        <Typography variant="h2">{number}</Typography>
        <Typography variant="body1">{title}</Typography>
      </Stack>
    </Stack>
  );
};

export default IconStat;
