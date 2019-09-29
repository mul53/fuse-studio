import React, { useState, useEffect, useCallback } from 'react'
import TextField from '@material-ui/core/TextField'
import TransactionButton from 'components/common/TransactionButton'
import { connect, useSelector } from 'react-redux'
import { transferTokenToFunder, clearTransactionStatus } from 'actions/token'
import { balanceOfToken } from 'actions/accounts'
import SignMessage from 'components/common/SignMessage'
import { FAILURE, SUCCESS } from 'actions/constants'
import { toWei } from 'web3-utils'
import classNames from 'classnames'
import { getFunderAccount } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { addCommunityPlugins, toggleJoinBonus } from 'actions/community'
import { loadModal } from 'actions/ui'
import useSwitchNetwork from 'hooks/useSwitchNetwork'
import get from 'lodash/get'
const { addresses: { funder: { address: funderAddress } } } = CONFIG.web3

const JoinBonus = ({
  loadModal,
  error,
  networkType,
  community,
  token: { address, symbol },
  transactionStatus,
  transferSignature,
  isTransfer,
  transferSuccess,
  transferTokenToFunder,
  balanceOfToken,
  addCommunityPlugins,
  clearTransactionStatus,
  balances,
  tokenOfCommunityOnCurrentSide,
  toggleJoinBonus
}) => {
  useSwitchNetwork(networkType, 'join bonus')

  const { plugins } = community

  const { joinBonus } = plugins
  const { toSend } = joinBonus

  const [transferMessage, setTransferMessage] = useState(false)
  const [amountToFunder, setAmount] = useState(0)

  const [joinBonusInfoMessage, setJoinBonusInfoMessage] = useState(get(joinBonus, 'joinInfo.message', ''))
  const [joinBonusInfoAmount, setJoinBonusInfoAmount] = useState(get(joinBonus, 'joinInfo.amount', 0))

  useEffect(() => {
    if (hasTransferToFunderFlag()) {
      balanceOfToken(tokenOfCommunityOnCurrentSide, funderAddress)
    }
    return () => {}
  }, [plugins])

  useEffect(() => {
    if (transactionStatus && transactionStatus === SUCCESS) {
      if (transferSuccess) {
        setTransferMessage(true)
        balanceOfToken(address, funderAddress)
      }
    } else if (transactionStatus && transactionStatus === FAILURE) {
      if (transferSuccess === false) {
        setTransferMessage(true)
      }
    }
    return () => {}
  }, [transactionStatus])

  const transferToFunder = () => {
    transferTokenToFunder(tokenOfCommunityOnCurrentSide, toWei(String(amountToFunder)))
  }

  const transactionError = () => {
    return transactionStatus && transactionStatus === 'FAILURE' && transferMessage
  }

  const transactionDenied = () => {
    return transactionError() && transferMessage && error && typeof error.includes === 'function' && error.includes('denied')
  }

  const transactionConfirmed = () => {
    return transactionStatus && (transactionStatus === 'SUCCESS' || transactionStatus === 'CONFIRMATION') && transferMessage
  }

  const hasTransferToFunderFlag = () =>
    plugins && plugins.joinBonus && plugins.joinBonus.hasTransferToFunder

  const handleBonusInfo = () => {
    const { communityAddress } = community
    addCommunityPlugins(communityAddress, { joinBonus: { joinInfo: { message: joinBonusInfoMessage, amount: joinBonusInfoAmount } } })
  }

  const handleToggle = useCallback(() => {
    toggleJoinBonus(!toSend)
  }, [toSend])

  const funderAccount = useSelector(getFunderAccount)

  const balance = balances[tokenOfCommunityOnCurrentSide]

  return (
    <div className='join_bonus__wrapper'>
      <div className='join_bonus'>
        <h2 className='join_bonus__main-title join_bonus__main-title--white'>Join bonus</h2>
        <div style={{ position: 'relative' }}>
          {
            !hasTransferToFunderFlag()
              ? (
                <div className='join_bonus__container'>
                  <div className='join_bonus__balances'>
                    <div className='join_bonus__funder_balance'>
                      <span>My balance:&nbsp;</span>
                      <div>
                        <span>{balance ? formatWei(balance, 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                    <div className='join_bonus__funder_balance'>
                      <span>Funder balance:&nbsp;</span>
                      <div>
                        <span>{get(funderAccount, `balances[${[tokenOfCommunityOnCurrentSide]}]`, false) ? formatWei(get(funderAccount, `balances[${[tokenOfCommunityOnCurrentSide]}]`, false), 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                  </div>
                  <p className='join_bonus__title'>In order to reward your first users please transfer your tokens to the funder, choose how much to send to the funder:</p>
                  <div className='join_bonus__field'>
                    <TextField
                      type='number'
                      placeholder='Insert amount'
                      classes={{
                        root: 'join_bonus__field'
                      }}
                      inputProps={{
                        autoComplete: 'off'
                      }}
                      InputProps={{
                        classes: {
                          underline: 'join_bonus__field--underline',
                          error: 'join_bonus__field--error'
                        }
                      }}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className='join_bonus__button'>
                    <TransactionButton frontText='Send' clickHandler={transferToFunder} />
                  </div>

                  <SignMessage message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
                  <SignMessage message={'Pending'} isOpen={transferSignature} isDark />

                  <SignMessage
                    message={'Your money has been sent successfully'}
                    isOpen={transactionConfirmed()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                    subTitle=''
                  />
                  <SignMessage
                    message={'Oops, something went wrong'}
                    subTitle=''
                    isOpen={transactionError()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />

                  <SignMessage
                    message={'Oh no'}
                    subTitle={`You reject the action, That’s ok, try next time!`}
                    isOpen={transactionDenied()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />
                </div>
              ) : (
                <div className='join_bonus__container'>
                  <div className='join_bonus__balances'>
                    <div className='join_bonus__funder_balance'>
                      <span>My balance:&nbsp;</span>
                      <div>
                        <span>{balance ? formatWei(balance, 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                    <div className='join_bonus__funder_balance'>
                      <span>Funder balance:&nbsp;</span>
                      <div>
                        <span>{get(funderAccount, `balances[${[tokenOfCommunityOnCurrentSide]}]`, false) ? formatWei(get(funderAccount, `balances[${[tokenOfCommunityOnCurrentSide]}]`, false), 0) : 0}&nbsp;</span>
                        <small>{symbol}</small>
                      </div>
                    </div>
                  </div>
                  <div className='join_bonus__field'>
                    <div className='join_bonus__field__add'>Add funder balance:</div>
                    <TextField
                      type='number'
                      placeholder='Insert amount'
                      classes={{
                        root: 'join_bonus__field'
                      }}
                      inputProps={{
                        autoComplete: 'off'
                      }}
                      InputProps={{
                        classes: {
                          underline: 'join_bonus__field--underline',
                          error: 'join_bonus__field--error'
                        }
                      }}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className='join_bonus__button'>
                    <TransactionButton frontText='Send' clickHandler={transferToFunder} />
                  </div>

                  <SignMessage message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
                  <SignMessage message={'Pending'} isOpen={transferSignature} isDark />

                  <SignMessage
                    message={'Your money has been sent successfully'}
                    isOpen={transactionConfirmed()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                    subTitle=''
                  />
                  <SignMessage
                    message={'Oops, something went wrong'}
                    subTitle=''
                    isOpen={transactionError()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />

                  <SignMessage
                    message={'Oh no'}
                    subTitle={`You reject the action, That’s ok, try next time!`}
                    isOpen={transactionDenied()}
                    clickHandler={() => {
                      setTransferMessage(false)
                      clearTransactionStatus(null)
                    }}
                  />
                </div>

              )
          }
          <h2 className='join_bonus__main-title join_bonus__main-title--dark'>Reward user</h2>
          <div className={classNames('join_bonus__container', { 'join_bonus__container--opacity': !hasTransferToFunderFlag() })}>
            <p className='join_bonus__title'>How much fuse tokens you want to reward new user community?</p>
            <div className='join_bonus__field'>
              <TextField
                type='number'
                placeholder='20.00'
                onChange={(e) => setJoinBonusInfoAmount(e.target.value)}
                disabled={!hasTransferToFunderFlag()}
                classes={{
                  root: 'join_bonus__field'
                }}
                inputProps={{
                  autoComplete: 'off',
                  value: joinBonusInfoAmount
                }}
                InputProps={{
                  classes: {
                    underline: 'join_bonus__field--underline',
                    error: 'join_bonus__field--error'
                  }
                }}
              />
            </div>
            <div style={{ marginTop: '2em' }}>
              <p className='join_bonus__title'>A message that goes along with it</p>
              <div className='join_bonus__field'>
                <TextField
                  type='text'
                  onChange={(e) => setJoinBonusInfoMessage(e.target.value)}
                  disabled={!hasTransferToFunderFlag()}
                  classes={{
                    root: 'join_bonus__field'
                  }}
                  inputProps={{
                    autoComplete: 'off',
                    value: joinBonusInfoMessage
                  }}
                  InputProps={{
                    classes: {
                      underline: 'join_bonus__field--underline',
                      error: 'join_bonus__field--error'
                    }
                  }}
                />
              </div>
            </div>
            <div className='join_bonus__actions'>
              <div className='content__toggle'>
                <label className='toggle'>
                  <input
                    type='checkbox'
                    checked={joinBonus && joinBonus.toSend}
                    onChange={handleToggle}
                  />
                  <div className='toggle-wrapper'>
                    <span className='toggle' />
                  </div>
                </label>
                <div className='content__toggle__text'>
                  <span>{ joinBonus && !joinBonus.toSend ? 'Activate' : 'Deactivate' }</span>
                </div>
              </div>
              <button className='button button--normal join_bonus__button' disabled={!hasTransferToFunderFlag()} onClick={handleBonusInfo}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.token
})

const mapDispatchToState = {
  transferTokenToFunder,
  clearTransactionStatus,
  balanceOfToken,
  addCommunityPlugins,
  toggleJoinBonus,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToState)(JoinBonus)