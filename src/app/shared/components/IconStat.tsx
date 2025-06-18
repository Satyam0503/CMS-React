import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

type Props = {
  icon: JSX.Element;
  number?: number | string;
  title?: string;
  iconBg?: string;
  iconColor?: string;
};
const IconStat = ({ icon, number, title, iconBg, iconColor }: Props) => {
  return (
    <Stack spacing={1} className="flex-row align-items-center gap-2">
      <Stack
        sx={{
          width: 52,
          height: 52,
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
