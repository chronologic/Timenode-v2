const b58 = require('base-58')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')
const Serializer = require('./TransactionSerializer')

const ScheduledTransaction = function() {}

ScheduledTransaction.at = function(address) {
    const abi = getABI('ScheduledTransaction')

    const sT = new ScheduledTransaction()
    sT.instance = web3.eth.contract(abi).at(address)
    return sT
}

ScheduledTransaction.prototype.checkInstantiated = function() {
    if (!this.instance) {
        throw new Error('Not instantiated!')
    }
}

ScheduledTransaction.prototype.getIpfsHash = function() {
    this.checkInstantiated()
    const h = this.instance.ipfsHash()
    return b58.encode(Buffer.from('1220' + h.slice(2), 'hex'))
}

module.exports = ScheduledTransaction