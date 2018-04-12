// const ethers = require('ethers')
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
        throw new Error('Must instantiate the EventWatcher with the address of the EventEmitter contract!!')
    }

    const event = this.eventEmitter.NewTransactionScheduled({scheduledFrom: schedulerAddr})

    event.watch((err, res) => {
        if (!err) {
            const newTransaction = res.args.newTransaction
            console.log(
                process(newTransaction)
            )
        }
    })
}

const process = (newTransaction) => {
    const abi = getABI('ScheduledTransaction')
    const newTx = web3.eth.contract(abi).at(newTransaction)
    return newTx.ipfsHash()
}

const main = async () => {
    const scheduler = '0x0f06cc8d999a2b99ca458bdaf5ea0fbd668f9533'
    const eventE = '0x199337fe98a52daa3be7664e585649f089d2cac3'
    const timenode = Timenode.boot(eventE)

    timenode.subscribeTo(scheduler)

    // Just keep this open.
    setInterval(() => {}, 1200)
}

main()

