const b58 = require('base-58')
const IPFS = require('ipfs')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')

const Timenode = function() {}

Timenode.boot = (address) => {
    const abi = getABI('EventEmitter')

    const timenode = new Timenode()

    timenode.eventEmitter = web3.eth.contract(abi).at(
        address,
    )

    return timenode
}

Timenode.prototype.subscribeTo = function (schedulerAddr) {
    if (!this.eventEmitter) {
        throw new Error('Must instantiate the Timenode with the address of the EventEmitter contract!!')
    }

    const event = this.eventEmitter.NewTransactionScheduled({scheduledFrom: schedulerAddr})

    event.watch((err, res) => {
        if (!err) {
            const newTransaction = res.args.newTransaction
            const bytes = res.args.serializedBytes

            if (!this.store) {
                this.store = {}
            }
            this.store[newTransaction] = bytes
        }
    })
}

Timenode.prototype.getStore = function() {
    return this.store
}

const ScheduledTransaction = function() {}

ScheduledTransaction.at = function(address) {
    const abi = getABI('ScheduledTransaction')

    const sT = new ScheduledTransaction()
    sT.instance = web3.eth.contract(abi).at(address)
    return sT
}

ScheduledTransaction.prototype.getIpfsHash = function() {
    this.checkInstantiated()
    const h = this.instance.ipfsHash()
    return b58.encode(Buffer.from('1220' + h.slice(2), 'hex'))
}

ScheduledTransaction.prototype.checkInstantiated = function() {
    if (!this.instance) {
        throw new Error('Not instantiated!')
    }
}

const main = async () => {
    const scheduler = '0xdacbc2af0c96296e875a88b14ca0bac42d88f186'
    const eventE = '0xb9a624e1f3b9a028bea4f5560e69d304e4634532'
    const timenode = Timenode.boot(eventE)

    timenode.subscribeTo(scheduler)

    // Just keep this open.
    setInterval(() => {
        // console.log(
        //     timenode.getStore()
        // )
    }, 1200)
}

main()

