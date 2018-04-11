const Contract = require('ethers').Contract
const providers = require('ethers').providers
const utils = require('ethers').utils
const Wallet = require('ethers').Wallet

const { getABI } = require('./utils')

const Serializer = require('./serializer')

const Scheduler = function() {}

Scheduler.boot = (schedulerAddress, wallet) => {
    const abi = getABI('Scheduler')

    const instance = new Contract(
        schedulerAddress,
        abi,
        wallet,
    )
    return instance
}

const main = async () => {
    const provider = new providers.JsonRpcProvider()

    const curBlock = await provider.getBlockNumber()
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

    const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123'
    const wallet = new Wallet(privateKey)
    wallet.provider = provider

    const scheduler = Scheduler.boot(
        '0xe5f3e941b35c3baca33a18ce31db79f11243d6e8',
        wallet,
    )

    console.log('Signing from: ' + wallet.getAddress())
    console.log('Balance: ' + 
        utils.formatEther(
            (await wallet.getBalance()).toString()
        ) + ' ' + utils.etherSymbol
    )
    console.log(await scheduler.schedule(encoded, {value: 30000}))

}

main()