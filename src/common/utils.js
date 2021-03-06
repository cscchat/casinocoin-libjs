/* @flow */
'use strict' // eslint-disable-line strict
const _ = require('lodash')
const BigNumber = require('bignumber.js')
const { deriveKeypair } = require('casinocoin-libjs-keypairs')

import type { Amount, CasinocoindAmount } from './types.js'

function isValidSecret(secret: string): boolean {
    try {
        deriveKeypair(secret)
        return true
    } catch (err) {
        return false
    }
}

function dropsToCsc(drops: string): string {
    return (new BigNumber(drops)).dividedBy(100000000.0).toString()
}

function cscToDrops(csc: string): string {
    let csc_drops = (new BigNumber(csc)).times(100000000.0);
    return csc_drops.floor().toString();
}

function toCasinocoindAmount(amount: Amount): CasinocoindAmount {
    if (amount.currency === 'CSC') {
        let csc_drops = cscToDrops(amount.value);
        return csc_drops;
    }
    let default_object = {
        currency: amount.currency,
        issuer: amount.counterparty ? amount.counterparty :
            (amount.issuer ? amount.issuer : undefined),
        value: amount.value
    };
    return default_object;
}

function convertKeysFromSnakeCaseToCamelCase(obj: any): any {
    if (typeof obj === 'object') {
        let newKey
        return _.reduce(obj, (result, value, key) => {
            newKey = key
                // taking this out of function leads to error in PhantomJS
            const FINDSNAKE = /([a-zA-Z]_[a-zA-Z])/g
            if (FINDSNAKE.test(key)) {
                newKey = key.replace(FINDSNAKE, r => r[0] + r[2].toUpperCase())
            }
            result[newKey] = convertKeysFromSnakeCaseToCamelCase(value)
            return result
        }, {})
    }
    return obj
}

function removeUndefined(obj: Object): Object {
    return _.omit(obj, _.isUndefined)
}

/**
 * @param {Number} rpepoch (seconds since 1/1/2000 GMT)
 * @return {Number} ms since unix epoch
 *
 */
function casinocoinToUnixTimestamp(rpepoch: number): number {
    return (rpepoch + 0x386D4380) * 1000
}

/**
 * @param {Number|Date} timestamp (ms since unix epoch)
 * @return {Number} seconds since casinocoin epoch ( 1/1/2000 GMT)
 */
function unixToCasinocoinTimestamp(timestamp: number): number {
    return Math.round(timestamp / 1000) - 0x386D4380
}

function casinocoinTimeToISO8601(casinocoinTime: number): string {
    return new Date(casinocoinToUnixTimestamp(casinocoinTime)).toISOString()
}

function iso8601ToCasinocoinTime(iso8601: string): number {
    return unixToCasinocoinTimestamp(Date.parse(iso8601))
}

module.exports = {
    dropsToCsc,
    cscToDrops,
    toCasinocoindAmount,
    convertKeysFromSnakeCaseToCamelCase,
    removeUndefined,
    casinocoinTimeToISO8601,
    iso8601ToCasinocoinTime,
    isValidSecret
}