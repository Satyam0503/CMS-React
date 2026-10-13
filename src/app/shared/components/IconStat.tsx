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
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.5 }}
      alignItems="center"
      sx={{
        minWidth: 0,
        height: "100%",
        bgcolor: "background.card",
        p: { xs: 1.25, sm: 1.75 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        boxShadow: "0 8px 24px rgba(0,0,0,.06)",
        minHeight: { xs: 76, sm: 92 },
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 30px rgba(0,0,0,.1)" },
      }}
    >
      <Avatar color="primary"
        sx={{
          width: { xs: 42, sm: 50 },
          height: { xs: 42, sm: 50 },
          background: iconBg,
          color: iconColor
        }}
      >
        {icon}
      </Avatar>
      <Stack justifyContent="center" sx={{ minWidth: 0 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: { xs: "1.5rem", sm: "2rem" } }}>{number}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: .5, lineHeight: 1.2, overflowWrap: "anywhere" }}>
          {title}
        </Typography>
      </Stack>
    </Stack >
  );
};

export default IconStat;
