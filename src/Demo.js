
const PriceFeed = require('../../changePriceDemo')
const MatchingMarket = require('../../matchingMarket')()

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
const replServer = repl.start('[Reinvent Finance Demo] $ ')
replServer.defineCommand('info', () => {
    console.log(`
Welcome to the v0.0.1 Chronos TimeNode Demo...`)
})
replServer.defineCommand('changePrice', async (arg) => {
    await PriceFeed.changePrice(arg)
})
replServer.defineCommand('getPrice', async () => {
    console.log(`PriceFeed reads: ${await PriceFeed.getPrice()}`)
})
replServer.defineCommand('matchingMarket', async() => {
    console.log(`Matching Market Address: ${MatchingMarket.address}`)
})
replServer.defineCommand('lastOfferId', async () => {
    console.log(`Last Offer ID: ${await MatchingMarket.lastOfferID()}`)
})
replServer.defineCommand('getOffer', async(id) => {
    console.log(await MatchingMarket.getOffer(id))
})
replServer.defineCommand('getOwner', async (id) => {
    console.log(await MatchingMarket.getOwner(id))
})
replServer.defineCommand('buy', async (id) => {
    const me = await new Promise(resolve => {
        w3.eth.getAccounts((e,r) => {
            resolve(r[0])
        })
    })

    const tx = await MatchingMarket.buy(id, 33, {
        from: me,
        gas: 6000000,
        gasPrice: w3.toWei('2', 'shannon')
    })
    if(tx.status === true) {
        console.log('Success!')
        console.log(`Bought 33 tokens.`)
    } else {
        console.error(' failed')
    }
})
replServer.defineCommand('setupStopLoss', async () => {
    // const InteractiveConditional = require('./InteractiveConditional')
    const Scheduler = require('./Scheduler')
    const Serializer = require('./TransactionSerializer')

    const me = await new Promise(resolve => {
        w3.eth.getAccounts((e,r) => {
            resolve(r[0])
        })
    })

//     const addrList = require('../build/a.json')

//     const intConditional = await InteractiveConditional.new({from: me,gas: 3000000})
//     console.log(`
// Deployed the InteractiveConditional contract! Address: ${intConditional.address}`)
//     replServer.intConditional = intConditional
    const curBlockNum = w3.eth.blockNumber
    const params = {
        recipient: '0x791f2b5a5b44779dc5950c6fc619ce2d50928cfe', //random address from etherscan
        value: 0,
        callGas: 200000,
        gasPrice: 30,
        executionWindowStart: curBlockNum,
        executionWindowLength: 4000,
        bounty: 60,
        fee: 70,
        conditionalDest: '0xb78d54d5578f94171afc6cedcd59b1e53d71dbf8',
        callData: '0xbe6d055a000000000000000000000000e23e971acca1ab30017c5ee01080c56b8335c39400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000084093f5198000000000000000000000000a27af8713623fcc239d49108b1a7b187c133e88b000000000000000000000000dc5fc5dab642f688bc5bb58bef6e0d452d7ae1230000000000000000000000000000000000000000000000000000000000000021000000000000000000000000000000000000000000000000000000000000002100000000000000000000000000000000000000000000000000000000',
        conditionalCallData: '0xed63fe1c0000000000000000000000009f9e3342b8666859625b1a1b90a319e9f7784c2f000000000000000000000000a27af8713623fcc239d49108b1a7b187c133e88b000000000000000000000000000000000000000000000000000000000000004b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000023c3d000000000000000000000000000000000000000000000000000000000000',
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
    console.log(`Using Scheduler at address 0x7A31174feA3deec9Ed8Ecc899A951705de9a0281`)
    const scheduler = Scheduler.boot('0x7A31174feA3deec9Ed8Ecc899A951705de9a0281')

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
// replServer.defineCommand('flipConditional', async () => {
//     if (!replServer.intConditional) {
//         console.log(`
// Deploy the Interactive Conditional contract first!`)
//     } else {
//         const me = await new Promise(resolve => {
//             w3.eth.getAccounts((e,r) => {
//                 resolve(r[0])
//             })
//         })

//         replServer.intConditional.setValid.sendTransaction(
//             true,
//             {
//                 from: me,
//                 gasPrice: w3.toWei('20', 'gwei')
//             }, (e,r) => {
//                 const tryGetReceipt = (receipt) => {
//                     w3.eth.getTransactionReceipt(receipt, (e,r) => {
//                         if (!r) {
//                             tryGetReceipt(receipt)
//                         } else {
//                             // console.log(r)
//                             console.log('success!')
//                         }
//                     })
//                 }
//                 tryGetReceipt(r)
//         })
//     }
// })