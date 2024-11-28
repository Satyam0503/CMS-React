import {FC} from 'react'
import {PageTitle} from '../../../_themes/layout/core'
import {BuilderPage} from './BuilderPage'
import { useIntl } from 'react-intl'

const BuilderPageWrapper: FC = () => {
  const intl = useIntl()
  return (
    <>

      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.LAYOUT_BUILDER'})}</PageTitle>
      <BuilderPage />
    </>
  )
}

export default BuilderPageWrapper
