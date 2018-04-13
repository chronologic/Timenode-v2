const b58 = require('base-58')
const IPFS = require('ipfs')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')
const Serializer = require('./serializer')

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
            const data = this.parseBytes(bytes)
            console.log(data)
        }
    })
}

Timenode.prototype.route = function() {
    if (!this.store) return
    const transactions = Object.keys(this.store)
    transactions.forEach((transaction) => {
        const sT = ScheduledTransaction.at(transaction)
        const bytes = this.getBytes(transaction)
        const data = this.parseBytes(bytes)

        const curBlock = web3.eth.blockNumber
        if (data.executionWindowStart <= curBlock) {
            // console.log(data.executionWindowStart)
            // console.log(curBlock)
            if (sT.instance.executed()) {
                // log something
                return
            }
            //execute
            // console.log(bytes)
            sT.instance.execute.sendTransaction(
                bytes,
                {
                    from: '0x1cb960969f58a792551c4e8791d643b13025256d',
                    gas: data.callGas + 180000,
                    gasPrice: data.gasPrice,
                }
            )
        } else {
            //TODO better logging
            return
        }
    })
}

Timenode.prototype.getStore = function() {
    return this.store
}

Timenode.prototype.getBytes = function(transactionAddress) {
    const b = this.store[transactionAddress]
    if (!b) {
        throw new Error(`No entry for address ${transactionAddress}`)
    } else {
        return b
    }
}

Timenode.prototype.parseBytes = function(bytes) {
    const data = Serializer.decode(bytes)
    return data
}

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

const main = async () => {
    const addr = require('./build/a.json')
    const scheduler = addr.scheduler
    const eventE = addr.eventEmitter
    const timenode = Timenode.boot(eventE)

    timenode.subscribeTo(scheduler)

    // Just keep this open.
    setInterval(() => {
        timenode.route()
    }, 1200)
}

main()