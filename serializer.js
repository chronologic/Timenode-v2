const ethers = require('ethers')
const ethCoder = new ethers.utils.AbiCoder()

const Serializer = () => {}

/**
 * encode
 * @param temporalUnit
 * @param recipient
 * @param value
 * @param callGas
 * @param gasPrice
 * @param executionWindowStart
 * @param executionWindowLength
 * @param bounty
 * @param fee
 */
Serializer.encode = (
    temporalUnit,
    recipient,
    value,
    callGas,
    gasPrice,
    executionWindowStart,
    executionWindowLength,
    bounty,
    fee,
    callData,
) => {
    const encodedTx = ethCoder.encode(
        [
            'address',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'bytes'
        ],
        [
            recipient,
            value,
            callGas,
            gasPrice,
            executionWindowStart,
            executionWindowLength,
            bounty,
            fee,
            callData,
        ]
    )
    const tempUnit = temporalUnit == 1 ? '0001' : '0002'
    return '0x'.concat(tempUnit).concat(encodedTx.slice(2))
}

Serializer.decode = (
    bytesString
) => {
    const decodedTx = ethCoder.decode(
        [
            'address',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
        ],
        '0x'.concat(bytesString.slice(6)), // take off the temporal unit
    )

    const tempUnit = bytesString.slice(2,6) == '0001' ? 1 : 2
    const retData = {
        temporalUnit: decodedTemporalUnit,
        recipient: decoded[0],
        value: decoded[1].toNumber(),
        callGas: decoded[2].toNumber(),
        gasPrice: decoded[3].toNumber(),
        executionWindowStart: decoded[4].toNumber(),
        executionWindowLength: decoded[5].toNumber(),
        bounty: decoded[6].toNumber(),
        fee: decoded[7].toNumber(),
    }

    return retData
}

module.exports = Serializer