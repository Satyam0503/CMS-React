import { FC } from "react";
import { SidebarMenu } from "../sidebar/sidebar-menu/SidebarMenu";
import { Avatar, Box, Drawer, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  handleClose: () => void;
}

const Sidebar: FC<Props> = ({ open, handleClose }) => {
  const theme = useTheme();
  const currentUser = useAppSelector((state) => state.user.userData);
  const profileUrl = useAppSelector((state) => state.user.userData?.profileImage);
  const companyLogo = useAppSelector((state => state.user.userData?.companyLogo));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));

  return (
    <Drawer variant={isSmallScreen ? 'temporary' : 'permanent'} open={open} PaperProps={{
      sx: { backgroundColor: "background.sidebar", width: "265px" }
    }}
      onClose={handleClose}
    >
      {/* <Box sx={{ width: 250 }} role="presentation" onClick={handleClose}> */}
      <Stack padding={3} gap={4} alignItems="center" width="100%">
        <Link to="/" className="company-logo-container">
          <Avatar
            src={companyLogo}
            sx={{
              width: 200,
              height: "100%"
            }}
          />
        </Link>
        <Stack spacing={2} alignItems={"center"}>
          <Stack maxWidth={"128px"} minWidth={"50px"} px={0.5}>
            <Avatar
              alt=""
              src={profileUrl}
              sizes="100"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                aspectRatio: 1,
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ color: 'common.white' }}>
            {`${currentUser?.firstName}  ${currentUser?.lastName}`}
          </Typography>
        </Stack>
      </Stack>
      <SidebarMenu />
      {/* </Box> */}
    </Drawer >
  );
};

export { Sidebar };
