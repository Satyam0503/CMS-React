import {FC} from 'react'
import {PageTitle} from '../../../_themes/layout/core'

import { useIntl } from 'react-intl'
import UserProfile from '../../modules/users/UserProfile'

const ProfilePageWrapper: FC = () => {
  const intl = useIntl()
  return (
    <>

      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.PROFILE'})}</PageTitle>
      <UserProfile/>
    </>
  )
}

export default ProfilePageWrapper
