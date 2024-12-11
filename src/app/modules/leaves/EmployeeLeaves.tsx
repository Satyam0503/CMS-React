import {FC} from 'react'


import { useIntl } from 'react-intl'
import Contacts from '../contacts/Contacts'


export const EmployeeLeaves: FC = () => {
  const intl = useIntl()
  return (
    <>

    <Contacts/>
    </>
  )
}
