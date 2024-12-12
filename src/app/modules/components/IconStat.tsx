import Typography from "@mui/material/Typography";
import { Stack, useTheme } from "@mui/material";
import { colors } from "../theme/MuiTheme";

type Props = {
  icon: JSX.Element;
  number: string;
  title: string;
  iconBg: string;
  iconColor: string;
};
const IconStat = ({ icon, number, title, iconBg, iconColor }: Props) => {
  const theme = useTheme();
  return (
    <Stack spacing={1.2} alignItems="center" direction="row">
      <Stack
        sx={{
          width: 48,
          height: 48,
          background: iconBg,
          borderRadius: "50%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack color={iconColor}>{icon}</Stack>
      </Stack>
      <Stack>
        <Typography variant="h2">{number}</Typography>
        <Typography variant="body2" color={colors.alpha.neutral[500]}>
          {title}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default IconStat;
