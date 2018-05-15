const getABI = (name) => {
    return require(`../build/contracts/${name}.json`).abi
}

const getDefaultSender = (web3) => {
    return new Promise(resolve => {
        web3.eth.getAccounts((e,r) => {
            resolve(r[0])
        })
    })
}

module.exports = {
    getABI,
    getDefaultSender,
}