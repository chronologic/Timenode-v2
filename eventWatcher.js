// const ethers = require('ethers')
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')

const b58 = require('base-58')

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
        throw new Error('Must instantiate the EventWatcher with the address of the EventEmitter contract!!')
    }

    const event = this.eventEmitter.NewTransactionScheduled({scheduledFrom: schedulerAddr})

    event.watch((err, res) => {
        if (!err) {
            const newTransaction = res.args.newTransaction
            // console.log(newTransaction)
            console.log(
                process(newTransaction)
            )
        }
    })
}

const process = (newTransaction) => {
    const abi = getABI('ScheduledTransaction')
    const newTx = web3.eth.contract(abi).at(newTransaction)
    const hash = newTx.ipfsHash()
    return b58.encode(Buffer.from('1220' + hash.slice(2), 'hex'))
}

const main = async () => {
    const scheduler = '0x53cddf951a46e824962929cc31664c266ec3b96d'
    const eventE = '0x2570e660d37e5678a0a843c034ad699ff2af8a6b'
    const timenode = Timenode.boot(eventE)

    timenode.subscribeTo(scheduler)

    // Just keep this open.
    setInterval(() => {}, 1200)
}

main()

