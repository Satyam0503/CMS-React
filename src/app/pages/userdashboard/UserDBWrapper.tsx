import {FC} from 'react'
import {PageTitle} from '../../../_themes/layout/core'
import { useIntl } from 'react-intl'
import UserDashboard from './UserDashboard'

const BuilderPageWrapper: FC = () => {
  const intl = useIntl()
  return (
    <>

      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.LAYOUT_BUILDER'})}</PageTitle>
      <UserDashboard/>
    </>
  )
}

export default BuilderPageWrapper
