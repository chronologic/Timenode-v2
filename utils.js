const getABI = (name) => {
    return require(`./build/contracts/${name}.json`).abi
}

module.exports = {
    getABI
}