// const fs = require('fs')
// const Web3 = require('web3')
// const provider = new Web3.providers.HttpProvider("http://localhost:8545")
// const web3 = new Web3(provider)

// const deploy = (contractName, opts) => {
//     const contract = require(`../build/contracts/${contractName}.json`)
//     Object.assign(opts, {data: contract.bytecode})
//     return new Promise((resolve,reject) => {
//         web3.eth.contract(contract.abi).new(opts, (err,res) => {
//             if (err) reject(err)
//             else {
//                 if (res.address) resolve(res)
//             }
//         })
//     })
// }

// const getDefaultSender = () => {
//     return new Promise(resolve => {
//         web3.eth.getAccounts((err,res) => {
//             resolve(res[0])
//         })
//     })
// }

// const main = async () => {
//     const me = await getDefaultSender()
//     const params = {from: me, gas: 3000000}
//     const Ipfs = await deploy('IPFS', params)
//     const ScheduledTransaction = deploy('ScheduledTransaction', params)
//     const EventEmitter = await deploy('EventEmitter', params)
//     const Scheduler = await deploy('Scheduler', Object.assign(params, {
//         eventEmitter: EventEmitter.address,
//         feeRecipient: '0xCCa19CC61a0B6F5B40525FB3d37124D40b877EF6',
//         ipfs: Ipfs.address,
//         scheduledTxCore: ScheduledTransaction.address,
//     }))

//     fs.writeFileSync('addrList', JSON.stringify({
//         EventEmitter: EventEmitter.address,
//         Scheduler: Scheduler.address,
//     }))
// }

// main()