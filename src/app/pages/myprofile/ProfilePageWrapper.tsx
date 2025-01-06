import { FC } from 'react'
import { PageTitle } from '../../../_themes/layout/core'

import { useIntl } from 'react-intl'
import UserProfile from '../../modules/users/UserProfile'
import { UserDetailsProvider } from '../../modules/users/UserDataProvider'

const ProfilePageWrapper: FC = () => {
  const intl = useIntl()
  return (
    <>
      <UserDetailsProvider>
        <PageTitle breadcrumbs={[]}>{intl.formatMessage({ id: 'MENU.PROFILE' })}</PageTitle>
        <UserProfile />
      </UserDetailsProvider>
    </>
  )
}

export default ProfilePageWrapper
