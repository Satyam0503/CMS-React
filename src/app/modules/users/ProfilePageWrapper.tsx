import { FC } from "react";
import { useIntl } from "react-intl";
import UserProfile from "./components/UserProfile";
import { Typography } from "@mui/material";
import { UserDetailsProvider } from "./UserDataProvider";

const ProfilePageWrapper: FC = () => {
  const intl = useIntl();
  return (
    <>
      <UserDetailsProvider>
        <UserProfile />
      </UserDetailsProvider>
    </>
  );
};

export default ProfilePageWrapper;
