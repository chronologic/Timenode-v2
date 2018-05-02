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

const ConditionalDest = function() {}

ConditionalDest.at = (conditionalDestAddress) => {
    const abi = getABI('ConditionDestination')

    const instance = web3.eth.contract(abi).at(
        conditionalDestAddress,
    )

    return instance
}

ConditionalDest.new = (opts) => {
    const abi = getABI('ConditionDestination')
    const bytecode = require('../build/contracts/ConditionDestination').bytecode
    Object.assign(opts, {data: bytecode})

    return new Promise((resolve, reject) => {
        web3.eth.contract(abi).new(opts, (err,res) =>{
            if (err) reject(err)
            else {
                // The callback fires immediately before the contract address is registered,
                // and again after the contract was deployed. We only want the second time
                // the callback fires so we make sure the object has the address property set.
                if (res.address) resolve(res)
            }
        })
    })
}

const main = async () => {
    const addressList = require('../build/a.json')

    const me = await new Promise(resolve => {
        web3.eth.getAccounts((err,res) => {
            resolve(res[0])
        })
    })

    console.log(me)

    console.log(await ConditionalDest.new({from: me}))

    // const curBlock = web3.eth.blockNumber
    // const recipient = '0x7eD1E469fCb3EE19C0366D829e291451bE638E59'
    // const value = 10
    // const callGas = 20
    // const gasPrice = 30
    // const executionWindowStart = curBlock + 30
    // const executionWindowLength = 50
    // const bounty = 60
    // const fee = 70
    // const callData = "0x" + "1337".repeat(32)

    // const encoded = Serializer.encode(
    //     1,
    //     recipient,
    //     value,
    //     callGas,
    //     gasPrice,
    //     executionWindowStart,
    //     executionWindowLength,
    //     bounty,
    //     fee,
    //     callData,
    // )

    // const scheduler = Scheduler.boot(addressList.scheduler)

    // // console.log(scheduler.schedule)

    // console.log(await scheduler.schedule.sendTransaction(encoded, {
    //     from: '0x1cb960969f58a792551c4e8791d643b13025256d',
    //     value: 30000
    // }))

}

main()