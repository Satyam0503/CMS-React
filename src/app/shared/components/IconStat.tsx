import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

type Props = {
  icon: JSX.Element;
  number?: number | string;
  title?: string;
  iconBg: string;
  iconColor?: string;
};
const IconStat = ({ icon, number, title, iconBg, iconColor }: Props) => {
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
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {title}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default IconStat;
