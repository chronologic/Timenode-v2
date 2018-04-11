const IPFS = require('ipfs')

const startNode = () => {
    const node = new IPFS()
    return new Promise(resolve => {
        node.once('ready', () => {
            resolve(node)
        })
    })
}

const getId = (node) => {
    return new Promise(resolve => {
        node.id((err, res) => {
            if (err) throw err
            resolve(res.id)
        })
    })
}

const addString = (node, msg) => {
    return new Promise(resolve => {
        node.files.add([Buffer.from(msg)], {
            'cid-version': 0,
        }, (err, filesAdded) => {
            if (err) throw err
            resolve(filesAdded[0].hash)
        })
    })
}

const getString = (node, hash) => {
    return new Promise(resolve => {
        node.files.cat(hash, (err, data) => {
            if (err) throw err
            resolve(data)
        })
    })
}

const shutdown = (node) => {
    return new Promise(resolve => {
        node.stop(() => {
            resolve(1)
        })
    })
}

module.exports = {
    startNode,
    getId,
    addString,
    getString,
    shutdown,
}