import { Avatar, Stack, Typography } from "@mui/material";
import { useAppSelector } from "../../Redux/hooks";
import { useAppLang } from "../../../_themes/i18n/Metronici18n";
import { DEFAULT_USER_AVATAR } from "../../../utils/constant/Constant";

interface AvatarCellPropsTypes {
  title?: string;
  subTitle?: null | Record<string, string>;
  avatarSrc?: any;
}

export const AvatarCell = ({
  title,
  avatarSrc,
  subTitle,
}: AvatarCellPropsTypes) => {
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);
  return (
    <Stack direction="row" spacing={1}>
      <Avatar src={avatarSrc || DEFAULT_USER_AVATAR}>{title?.at(0)?.toLocaleUpperCase()}</Avatar>
      <Stack direction="column" sx={{ alignSelf: "center" }}>
        <Typography className="d-block fw-light"
          variant="body1"        >
          {title || "NA"}
        </Typography>
        {
          (subTitle !== null && subTitle !== undefined) &&
          <Typography variant="body2">{subTitle[currentLanguage] || subTitle[defaultLang]}</Typography>
        }
      </Stack>
    </Stack>
  );
};
