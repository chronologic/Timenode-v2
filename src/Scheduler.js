const Scheduler = function() {}

Scheduler.boot = (schedulerAddress) => {
    const abi = getABI('Scheduler')

    const instance = web3.eth.contract(abi).at(
        schedulerAddress,
    )

    return instance
}

module.exports = Scheduler