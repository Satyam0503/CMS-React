import Typography from "@mui/material/Typography";
import { Avatar, Stack } from "@mui/material";

type Props = {
  icon: JSX.Element;
  number?: number | string;
  title?: string;
  iconBg?: string;
  iconColor?: string;
};
const IconStat = ({ icon, number, title, iconBg, iconColor }: Props) => {
  return (
    <Stack className="flex-row align-items-start gap-2 rounded p-4" sx={{ bgcolor: 'background.card' }}>
      <Avatar color="primary"
        sx={{
          width: 52,
          height: 52,
          background: iconBg,
          color: iconColor
        }}
      >
        {icon}
      </Avatar>
      <Stack>
        <Typography variant="h2">{number}</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {title}
        </Typography>
      </Stack>
    </Stack >
  );
};

export default IconStat;
