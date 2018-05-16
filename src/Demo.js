
/**
 * Web3
 */
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const w3 = new Web3(provider)

/**
 * Establish the REPL which will let us interact with
 * the TimeNode.
 */
const repl = require('repl')
const replServer = repl.start('[Chronos TimeNode Demo] $ ')
replServer.defineCommand('info', () => {
    console.log(`
Welcome to the v0.0.1 Chronos TimeNode Demo...`)
})
replServer.defineCommand('scheduleConditional', async () => {
    const InteractiveConditional = require('./InteractiveConditional')
    const Scheduler = require('./Scheduler')
    const Serializer = require('./TransactionSerializer')

    const me = await new Promise(resolve => {
        w3.eth.getAccounts((e,r) => {
            resolve(r[0])
        })
    })

    const addrList = require('../build/a.json')

    const intConditional = await InteractiveConditional.new({from: me,gas: 3000000})
    console.log(`
Deployed the InteractiveConditional contract! Address: ${intConditional.address}`)
    replServer.intConditional = intConditional
    const curBlockNum = w3.eth.blockNumber
    const params = {
        recipient: '0x7eD1E469fCb3EE19C0366D829e291451bE638E59', //random address from etherscan
        value: 10,
        callGas: 200000,
        gasPrice: 30,
        executionWindowStart: curBlockNum + 30,
        executionWindowLength: 4000,
        bounty: 60,
        fee: 70,
        conditionalDest: intConditional.address,
        callData: '0x' + '1337'.repeat(7),
        conditionalCallData: intConditional.checkValid.getData(),
    }
    const encoded = Serializer.serialize(
        1,
        params.recipient,
        params.value,
        params.callGas,
        params.gasPrice,
        params.executionWindowStart,
        params.executionWindowLength,
        params.bounty,
        params.fee,
        params.conditionalDest,
        params.callData,
        params.conditionalCallData,
    )

    // Boot up the scheduler contract.
    console.log(`Using Scheduler at address ${addrList.scheduler}`)
    const scheduler = Scheduler.boot(addrList.scheduler)

    // console.log('sending transaction...')
    scheduler.schedule.sendTransaction(encoded, {
        from: me,
        value: w3.toWei('50', 'gwei'),
    }, (e,r) => {
        const tryGetReceipt = (receipt) => {
            w3.eth.getTransactionReceipt(receipt, (e,r) => {
                if (!r) {
                    tryGetReceipt(receipt)
                } else {
                    // console.log(r)
                    console.log('success!')
                }
            })
        }
        tryGetReceipt(r)
    })
})
replServer.defineCommand('flipConditional', async () => {
    if (!replServer.intConditional) {
        console.log(`
Deploy the Interactive Conditional contract first!`)
    } else {
        const me = await new Promise(resolve => {
            w3.eth.getAccounts((e,r) => {
                resolve(r[0])
            })
        })

        replServer.intConditional.setValid.sendTransaction(
            true,
            {
                from: me,
                gasPrice: w3.toWei('20', 'gwei')
            }, (e,r) => {
                const tryGetReceipt = (receipt) => {
                    w3.eth.getTransactionReceipt(receipt, (e,r) => {
                        if (!r) {
                            tryGetReceipt(receipt)
                        } else {
                            // console.log(r)
                            console.log('success!')
                        }
                    })
                }
                tryGetReceipt(r)
        })
    }
})