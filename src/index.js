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
    // const addressList = require('../build/a.json')
    const addrList = JSON.parse(require('addr~'))

    const me = await new Promise(resolve => {
        web3.eth.getAccounts((err,res) => {
            resolve(res[0])
        })
    })

    const conditionalDestination = await ConditionalDest.new({from: me})

    const curBlockNum = web3.eth.blockNumber
    const params = {
        recipient: '0x7eD1E469fCb3EE19C0366D829e291451bE638E59', //random address from etherscan
        value: 10,
        callGas: 20,
        gasPrice: 30,
        executionWindowStart: curBlockNum + 30,
        executionWindowLength: 40,
        bounty: 60,
        fee: 70,
        conditionalDest: conditionalDestination.address,
        callData: '0x' + '1337'.repeat(7),
        conditionalCallData: '0x00',
    }

    const encoded = Serializer.encode(
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
    const scheduler = Scheduler.boot(addrList.scheduler)

    // console.log(scheduler.schedule)

    console.log(await scheduler.schedule.sendTransaction(encoded, {
        from: me,
        value: 30000,
    }))

}

main()