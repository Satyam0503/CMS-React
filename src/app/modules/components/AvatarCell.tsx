import { Avatar, Stack, Typography } from "@mui/material";
import { colors } from "../theme/MuiTheme";

interface AvatarCellPropsTypes {
  title?: string;
  subTitle?: string;
  avatarSrc?: any;
}

export const AvatarCell = ({
  title,
  avatarSrc,
  subTitle,
}: AvatarCellPropsTypes) => {
  return (
    <Stack direction="row" spacing={1}>
      <Avatar src={avatarSrc || ""}>{title?.at(0)?.toLocaleUpperCase()}</Avatar>
      <Stack direction="column" sx={{ alignSelf: "center" }}>
        <Typography
          variant="body2"
          display={"block"}
          fontWeight={500}
          color={colors.alpha.neutral[800]}
        >
          {title || "NA"}
        </Typography>
        <Typography variant="body2">{subTitle}</Typography>
      </Stack>
    </Stack>
  );
};
