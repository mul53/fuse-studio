import React, { Fragment } from 'react'
import { Formik, Field, Form } from 'formik'
import { connect } from 'react-redux'
import inviteShape from 'utils/validation/shapes/invite'
import TextInput from 'components/common/TextInput'
import { inviteUserToCommunity } from 'actions/community'

const Invite = ({ inviteUserToCommunity, communityAddress }) => {
  const onSubmit = (values) => {
    inviteUserToCommunity(communityAddress, values)
  }

  const renderForm = ({ values, isValid, isSubmitting }) => {
    const { invitationType } = values
    const isSMS = invitationType === 'sms'
    const isEMAIL = invitationType === 'email'
    return (
      <Form className='invite'>
        <div className='invite__wrapper'>
          <div className='invite__title'>Get a smart invite link to your phone</div>
          <div className='invite__containerOuter'>
            <div className='containerInner'>
              <Field
                name='invitationType'
              >
                {({ field, form: { setFieldValue } }) => (
                  <>
                    <input {...field} type='radio' value='sms' checked={isSMS} onChange={() => setFieldValue('invitationType', 'sms')} className='hidden' id='input1' />
                    <label className='entry' htmlFor='input1'>
                      <div className='circle' />
                      <div className='entry-label'>Text message (SMS)</div>
                    </label>
                  </>
                )}
              </Field>
              <Field
                name='invitationType'
              >
                {({ field, form: { setFieldValue } }) => (
                  <>
                    <input {...field} type='radio' checked={isEMAIL} onChange={() => setFieldValue('invitationType', 'email')} value='email' className='hidden' id='input2' />
                    <label className='entry' htmlFor='input2'>
                      <div className='circle' />
                      <div className='entry-label'>Email</div>
                    </label>
                  </>
                )}
              </Field>
              <div className='highlight' />
              <div className='overlay' />
            </div>
          </div>
          <div className='grid-y'>
            <div className='invite__text cell'>
              This will send a special link that will automatically switch to your community
            </div>
            {
              isEMAIL && (
                <Field name='email'>
                  {({ field, form: { handleChange } }) => (
                    <TextInput
                      {...field}
                      className='invite__email_field'
                      type='email'
                      placeholder='Insert email'
                      autoComplete='off'
                      onChange={handleChange}
                    />
                  )}
                </Field>
              )
            }
            {
              isSMS && (
                <Field name='phoneNumber'>
                  {({ field, form: { handleChange } }) => (
                    <TextInput
                      {...field}
                      className='invite__email_field'
                      placeholder='e.g +972525555555'
                      autoComplete='off'
                      onChange={handleChange}
                    />
                  )}
                </Field>
              )
            }
            <button className='button button--normal' disabled={!isValid}>Send</button>
            {
              isSubmitting &&
              <div className='invite__resend'>
                Invitation sent.
                  <br />
                  *Didn't get any message? Resend message
                </div>
            }
          </div>

        </div>
      </Form>
    )
  }

  return (
    <Formik
      initialValues={{
        invitationType: 'sms',
        email: '',
        phoneNumber: ''
      }}
      onSubmit={onSubmit}
      validationSchema={inviteShape}
      validateOnChange
    >
      {(props) => renderForm(props)}
    </Formik>
  )
}

export default connect(null, {
  inviteUserToCommunity
})(Invite)
