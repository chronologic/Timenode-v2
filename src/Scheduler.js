const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')

const Scheduler = function() {}

Scheduler.boot = (schedulerAddress) => {
    const abi = getABI('Scheduler')

    const instance = web3.eth.contract(abi).at(
        schedulerAddress,
    )

    return instance
}

module.exports = Scheduler