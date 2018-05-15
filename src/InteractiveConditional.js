const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider("http://localhost:8545")
const web3 = new Web3(provider)

const { getABI } = require('./utils')

const InteractiveConditional = function() {}

InteractiveConditional.at = (intDestAddr) => {
    const abi = getABI('InteractiveConditional')

    const instance = web3.eth.contract(abi).at(
        intDestAddr,
    )

    return instance
}

InteractiveConditional.new = (opts) => {
    const abi = getABI('InteractiveConditional')
    const bytecode = require('../build/contracts/InteractiveConditional').bytecode
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

module.exports = InteractiveConditional