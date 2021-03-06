/* @flow */
'use strict' // eslint-disable-line strict
const common = require('../common')
const keypairs = require('casinocoin-libjs-keypairs')
const binary = require('casinocoin-libjs-binary-codec')
const { validate, cscToDrops } = common

function signPaymentChannelClaim(channel: string, amount: string,
    privateKey: string
): string {
    validate.signPaymentChannelClaim({ channel, amount, privateKey })

    const signingData = binary.encodeForSigningClaim({
        channel: channel,
        amount: cscToDrops(amount),
    })
    return keypairs.sign(signingData, privateKey)
}

module.exports = signPaymentChannelClaim