import { FC, useEffect } from "react";
import { useIntl } from "react-intl";
import UserProfile from "./components/UserProfile";
import { UserDetailsProvider } from "./UserDataProvider";
import { usePageData } from "../../../_themes/layout/core";

const ProfilePageWrapper: FC = () => {
  const intl = useIntl();
  const {setPageTitle}= usePageData();

  useEffect(()=>{
    setPageTitle(intl.formatMessage({id:"PAGE.MY_PROFILE"}))
  },[]);
  return (
    <>
      <UserDetailsProvider>
        <UserProfile />
      </UserDetailsProvider>
    </>
  );
};

export default ProfilePageWrapper;
