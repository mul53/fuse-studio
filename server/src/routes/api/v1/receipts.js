const router = require('express').Router()
const { handleReceipt, handleTransactionHash } = require('@handlers/receipts')
const { isEmpty } = require('@utils/web3/receipt')

router.post('/', async (req, res, next) => {
  const { receipt, bridgeType } = req.body
  if (isEmpty(receipt)) {
    const msg = `Empty receipt given for transaction ${receipt.transactionHash}`
    console.log(msg)
    return res.json({ updated: false, msg })
  }
  receipt.bridgeType = bridgeType
  await handleReceipt(receipt)
  return res.json({ updated: true })
})

router.post('/:transactionHash', async (req, res, next) => {
  const { abiName, bridgeType } = req.body
  const { transactionHash } = req.params
  await handleTransactionHash({ transactionHash, abiName, bridgeType })
  return res.json({})
})

module.exports = router
