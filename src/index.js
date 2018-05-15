const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const ConditionalDest = require('./ConditionalDest')
const Scheduler = require('./Scheduler')
const Serializer = require('./TransactionSerializer')

const main = async () => {
    const addrList = require('../build/a.json')

    const me = await new Promise(resolve => {
        web3.eth.getAccounts((err,res) => {
            resolve(res[0])
        })
    })

    const conditionalDestination = await ConditionalDest.new({from: me,gas: 3000000})

    const curBlockNum = web3.eth.blockNumber
    const params = {
        recipient: '0x7eD1E469fCb3EE19C0366D829e291451bE638E59', //random address from etherscan
        value: 10,
        callGas: 200000,
        gasPrice: 30,
        executionWindowStart: curBlockNum + 30,
        executionWindowLength: 40,
        bounty: 60,
        fee: 70,
        conditionalDest: '0x0000000000000000000000000000000000000000',
        // conditionalDest: conditionalDestination.address,
        callData: '0x' + '1337'.repeat(7),
        conditionalCallData: '0x00',
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
    console.log(`Scheduler at address ${addrList.scheduler}`)
    const scheduler = Scheduler.boot(addrList.scheduler)

    console.log('sending transaction...')
    await scheduler.schedule.sendTransaction(encoded, {
        from: me,
        value: web3.toWei('50', 'gwei'),
    })

}

main()