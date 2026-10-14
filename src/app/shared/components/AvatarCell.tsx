import { Avatar, Badge, Stack, styled, Typography } from "@mui/material";
import { useAppSelector } from "../../Redux/hooks";
import { useAppLang } from "../../../_themes/i18n/Metronici18n";
import { DEFAULT_USER_AVATAR } from "../../../utils/constant/Constant";

interface AvatarCellPropsTypes {
  title?: string;
  subTitle?: null | string | Record<string, string>;
  avatarSrc?: string | null;
  hasBadge?: boolean;
}

export const AvatarCell = ({
  title,
  avatarSrc,
  subTitle,
  hasBadge = false
}: AvatarCellPropsTypes) => {
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);
  return (

    <Stack direction="row" spacing={1}>
      {
        hasBadge ?
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              src={avatarSrc || DEFAULT_USER_AVATAR}
              alt={`${title || "Employee"} profile photo`}
              imgProps={{
                onError: (e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== DEFAULT_USER_AVATAR) {
                    target.src = DEFAULT_USER_AVATAR;
                  }
                },
              }}
            >
              {title?.at(0)?.toLocaleUpperCase()}
            </Avatar>
          </StyledBadge>
          :
          <Avatar
            src={avatarSrc || DEFAULT_USER_AVATAR}
            alt={`${title || "Employee"} profile photo`}
            imgProps={{
              onError: (e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== DEFAULT_USER_AVATAR) {
                  target.src = DEFAULT_USER_AVATAR;
                }
              },
            }}
          >
            {title?.at(0)?.toLocaleUpperCase()}
          </Avatar>
      }
      <Stack direction="column" sx={{ alignSelf: "center" }}>
        <Typography className="d-block fw-light"
          variant="body1"        >
          {title || "NA"}
        </Typography>
        {
          (subTitle !== null && subTitle !== undefined) &&
          <Typography variant="body2">
            {typeof subTitle === "string" ? subTitle : subTitle[currentLanguage] || subTitle[defaultLang]}
          </Typography>
        }
      </Stack>
    </Stack>
  );
};



const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      // animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  // '@keyframes ripple': {
  //   '0%': {
  //     transform: 'scale(.8)',
  //     opacity: 1,
  //   },
  //   '100%': {
  //     transform: 'scale(2.4)',
  //     opacity: 0,
  //   },
  // },
}));
