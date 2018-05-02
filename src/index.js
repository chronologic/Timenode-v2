const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')

const Serializer = require('./TransactionSerializer')

const Scheduler = function() {}

Scheduler.boot = (schedulerAddress) => {
    const abi = getABI('Scheduler')

    const instance = web3.eth.contract(abi).at(
        schedulerAddress,
    )

    return instance
}

const main = async () => {
    const curBlock = web3.eth.blockNumber
    const recipient = '0x7eD1E469fCb3EE19C0366D829e291451bE638E59'
    const value = 10
    const callGas = 20
    const gasPrice = 30
    const executionWindowStart = curBlock + 30
    const executionWindowLength = 50
    const bounty = 60
    const fee = 70
    const callData = "0x" + "1337".repeat(32)

    const encoded = Serializer.encode(
        1,
        recipient,
        value,
        callGas,
        gasPrice,
        executionWindowStart,
        executionWindowLength,
        bounty,
        fee,
        callData,
    )

    const addr = require('./build/a.json')
    const scheduler = Scheduler.boot(addr.scheduler)

    // console.log(scheduler.schedule)

    console.log(await scheduler.schedule.sendTransaction(encoded, {
        from: '0x1cb960969f58a792551c4e8791d643b13025256d',
        value: 30000
    }))

}

main()