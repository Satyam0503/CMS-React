import {FC} from 'react'
import {PageTitle} from '../../../_themes/layout/core'
import { useIntl } from 'react-intl'
import EmployeeAttendance from '../../modules/attendance/EmployeeAttendance'

const BuilderPageWrapper: FC = () => {
  const intl = useIntl()
  return (
    <>

      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.ATTENDANCE'})}</PageTitle>
      <EmployeeAttendance/>
    </>
  )
}
