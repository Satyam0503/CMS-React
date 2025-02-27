import { FC } from "react";
import { useIntl } from "react-intl";
import UserProfile from "../../modules/users/UserProfile";
import { Typography } from "@mui/material";
import { UserDetailsProvider } from "../../modules/users/UserDataProvider";

const ProfilePageWrapper: FC = () => {
  const intl = useIntl();
  return (
    <>
      <UserDetailsProvider>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "MENU.PROFILE" })}
        </Typography>
        <UserProfile />
      </UserDetailsProvider>
    </>
  );
};

export default ProfilePageWrapper;
