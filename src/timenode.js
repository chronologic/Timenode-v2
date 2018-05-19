const b58 = require('base-58')
// const IPFS = require('ipfs')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const Util = require('./utils')
const Serializer = require('./TransactionSerializer')
const ScheduledTransaction = require('./ScheduledTransaction')

const NULL_ADDR = '0x0000000000000000000000000000000000000000'

const Timenode = function() {}

/**
 * The constructor function for a new instance of the Timenode class.
 * @param {String} address The Ethereum address of the EventEmitter contract. 
 */
Timenode.boot = (eventEmitter, sender) => {
    const abi = Util.getABI('EventEmitter')

    const timenode = new Timenode()
    timenode.eventEmitter = web3.eth.contract(abi).at(
        eventEmitter,
    )

    timenode.sender = sender
    timenode.pollStore = {}

    return timenode
}

/**
 * Subscribe the Timenode to a specific scheduler contract.
 * @param {String} scheduler The Ethereum address of the Scheduler for which to
 * subscribe to. 
 */
Timenode.prototype.subscribeTo = function(scheduler) {
    if (!this.eventEmitter) {
        throw new Error('Must instantiate the Timenode with the address of the EventEmitter contract!!')
    }

    const event = this.eventEmitter.NewTransactionScheduled({scheduledFrom: scheduler})

    event.watch((err, res) => {
        // console.log(err, res)
        if (!err) {
            const newTransaction = res.args.newTransaction
            const bytes = res.args.serializedBytes

            if (!this.store) {
                this.store = {}
            }
            this.store[newTransaction] = bytes
            const data = this.parseBytes(bytes)
            console.log(`New Transaction registered: ${newTransaction}`)
        }
    })
}

/**
 * Routes the stored transactions (the ones picked up from the subscribeTo() function)
 * into their action slots.
 */
Timenode.prototype.route = function() {
    if (!this.store) return
    ///
    const transactions = Object.keys(this.store)
    transactions.forEach(async (transaction) => {
        const sT = ScheduledTransaction.at(transaction)
        const bytes = this.getBytes(transaction)
        const data = this.parseBytes(bytes)

        const curBlock = web3.eth.blockNumber
        if (data.executionWindowStart <= curBlock) {

            if (sT.instance.executed()) {
                console.log(`Has been executed: ${sT.instance.executed()}`)
                return
            }

            const doExecute = async () => {
                // TODO: From eac.js... Keep?
                const hasPendingParity = async (txRequest) => {
                    const provider = web3.currentProvider
                    return new Promise((resolve, reject) => {
                        provider.sendAsync(
                            {
                            jsonrpc: '2.0',
                            method: 'parity_pendingTransactions',
                            params: [],
                            id: 0o7,
                            },
                            (err, res) => {
                            if (err) reject(err)
                            const hasTx = res && res.result && !!res.result.filter(tx => tx.to === txRequest).length
                            resolve(hasTx)
                            }
                        )
                    })
                }

                if (await hasPendingParity(transaction)) {
                    console.log('pending tx in transaction pool')
                    return
                } else {
                    sT.instance.execute.sendTransaction(
                        bytes,
                        {
                            from: this.sender,
                            gas: data.callGas + 180000 + 100000,
                            gasPrice: data.gasPrice,
                            value: 0,
                        }, (err,res) => {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                console.log(`Executed! ${res}`)
                                if (this.store[transaction]) {
                                    delete this.store[transaction]
                                }
                                if (this.pollStore[transactions]) {
                                    clearInterval(this.pollStore[transaction])
                                    delete this.pollStore[transaction]
                                }
                            }
                        }
                    )
                }
            }

            /** If there is no conditionalDest, this is a simple 
             * temporal-based call and we can route directly to
             * execution.
             */
            if (data.conditionalDest === NULL_ADDR) {
                doExecute()
            } else {
                /**
                 * Otherwise we need to start polling to see if
                 * the conditional value returns true before
                 * sending an exeuction attempt.
                 */
                console.log('beginning the polling')
                delete this.store[transaction]
                this.pollStore[transaction] = setInterval(async () => {
                    const canExecute = sT.instance.canExecute.call(bytes)
                    if (canExecute === false) {
                        console.log(`Within execution window but conditional returns false.`)
                    }
                    else {
                        console.log('Conditional returns true... Executing')
                        await doExecute()
                    }
                }, 1200)
            }
        } else {
            //TODO better logging
            return
        }
    })
}

/**
 * Getter function to retrieve the Store object.
 * @return {Object} Key -> Value store of transaction request addresses to call bytes.
 */
Timenode.prototype.getStore = function() {
    return this.store
}

/**
 * Getter function to retrieve the call bytes from a scheduled transaction address.
 * @param {String} transactionAddress The address of the scheduled transaction to
 * retrieve the bytes of.
 */
Timenode.prototype.getBytes = function(transactionAddress) {
    const b = this.store[transactionAddress]
    if (!b) {
        throw new Error(`No entry for address ${transactionAddress}`)
    } else {
        return b
    }
}

/**
 * Function to parse bytes string of transaction data to standard parameters.
 * @param {String} bytes Hex encoded string of bytes. 
 * @return {Object} Standard parameters.
 */
Timenode.prototype.parseBytes = function(bytes) {
    const data = Serializer.deserialize(bytes)
    return data
}

const EVENT_EMITTER = '0x803246d50e67Bb0bA65Ef09565FA58Dc511Dc48a'
const SCHEDULER = '0x7A31174feA3deec9Ed8Ecc899A951705de9a0281'

const main = async () => {
    // const addr = require('../build/a.json')
    const scheduler = SCHEDULER
    const eventE = EVENT_EMITTER
    console.log(`Timenode using scheduler at address ${scheduler}\nAnd eventEmitter at address ${eventE}`)
    const sender = await Util.getDefaultSender(web3)
    console.log('Booting the Timenode...')
    const timenode = Timenode.boot(eventE, sender)

    timenode.subscribeTo(scheduler)
    console.log(`Timenode subscribed to ${scheduler}`)

    // Just keep this open.
    setInterval(() => {
        timenode.route()
    }, 1200)
}

main()