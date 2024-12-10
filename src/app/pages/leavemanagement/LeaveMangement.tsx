import {FC} from 'react'
import {PageTitle} from '../../../_themes/layout/core'

import { useIntl } from 'react-intl'
import EmployeeLeaves from '../../modules/leaves/EmployeeLeaves'

const LeaveManagement: FC = () => {
  const intl = useIntl()
  return (
    <>

      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.LEAVE_MGMT'})}</PageTitle>
      <EmployeeLeaves/>
    </>
  )
}

export default LeaveManagement
