const ConditionalDest = function() {}

ConditionalDest.at = (conditionalDestAddress) => {
    const abi = getABI('ConditionDestination')

    const instance = web3.eth.contract(abi).at(
        conditionalDestAddress,
    )

    return instance
}

ConditionalDest.new = (opts) => {
    const abi = getABI('ConditionDestination')
    const bytecode = require('../build/contracts/ConditionDestination').bytecode
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

module.exports = ConditionalDest