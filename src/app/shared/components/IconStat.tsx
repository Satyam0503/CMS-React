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
    <Stack className="flex-row align-items-center gap-3 h-100" sx={{ bgcolor: 'background.card', p: 2, borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 8px 24px rgba(0,0,0,.06)", minHeight: 92, transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 30px rgba(0,0,0,.1)" } }}>
      <Avatar color="primary"
        sx={{
          width: 50,
          height: 50,
          background: iconBg,
          color: iconColor
        }}
      >
        {icon}
      </Avatar>
      <Stack className="justify-content-center" sx={{ minWidth: 0 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{number}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: .5 }}>
          {title}
        </Typography>
      </Stack>
    </Stack >
  );
};

export default IconStat;
