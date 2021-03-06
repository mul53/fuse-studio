import React from 'react'
import classNames from 'classnames'
import { Formik, Form } from 'formik'
import isEqual from 'lodash/isEqual'
import bonusesShape from 'utils/validation/shapes/bonuses'
import Options from './Option'
import { useStore } from 'store/mobx'
import get from 'lodash/get'
import { observer } from 'mobx-react'

const RewardUserForm = ({ setJoinBonus, setBackupBonus, setInviteBonus, hasFunderBalance }) => {
  const { dashboard } = useStore()
  const { plugins } = dashboard
  const onSubmit = (values, formikBag) => {
    if (!isEqual((initialValues && initialValues.joinBonus), values.joinBonus)) {
      setJoinBonus(values.joinBonus.amount, values.joinBonus.isActive)
    }
    if (!isEqual((initialValues && initialValues.backupBonus), values.backupBonus)) {
      setBackupBonus(values.backupBonus.amount, values.backupBonus.isActive)
    }
    if (!isEqual((initialValues && initialValues.inviteBonus), values.inviteBonus)) {
      setInviteBonus(values.inviteBonus.amount, values.inviteBonus.isActive)
    }
  }

  const initialValues = {
    joinBonus: { ...get(plugins, 'joinBonus.joinInfo'), isActive: get(plugins, 'joinBonus.isActive') },
    backupBonus: { ...get(plugins, 'backupBonus.backupInfo'), isActive: get(plugins, 'backupBonus.isActive') },
    inviteBonus: { ...get(plugins, 'inviteBonus.inviteInfo'), isActive: get(plugins, 'inviteBonus.isActive') }
  }

  return (
    <Formik
      initialValues={{
        ...initialValues
      }}
      validationSchema={bonusesShape}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange
    >
      {({ values }) => {
        return (
          <Form
            className={classNames('bonus_options__container',
              { 'bonus_options__container--opacity': !hasFunderBalance })}
          >
            <div className='bonus_options'>
              <Options
                hasFunderBalance={hasFunderBalance}
                values={values}
              />
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default observer(RewardUserForm)
