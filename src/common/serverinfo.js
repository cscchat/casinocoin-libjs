'use strict' // eslint-disable-line strict
const _ = require('lodash')
const { convertKeysFromSnakeCaseToCamelCase, dropsToCsc } = require('./utils')
import type { Connection } from './connection'

export type GetServerInfoResponse = {
    buildVersion: string,
    completeLedgers: string,
    // hostID: string,
    ioLatencyMs: number,
    load ? : {
        jobTypes: Array < Object > ,
        threads: number
    },
    lastClose: {
        convergeTimeS: number,
        proposers: number
    },
    loadFactor: number,
    peers: number,
    pubkeyNode: string,
    pubkeyValidator ? : string,
    serverState: string,
    validatedLedger: {
        age: number,
        baseFeeCSC: string,
        hash: string,
        reserveBaseCSC: string,
        reserveIncrementCSC: string,
        ledgerVersion: number
    },
    validationQuorum: number
}

function renameKeys(object, mapping) {
    _.forEach(mapping, (to, from) => {
        object[to] = object[from]
        delete object[from]
    })
}

function getServerInfo(connection: Connection): Promise < GetServerInfoResponse > {
    return connection.request({ command: 'server_info' }).then(response => {
        const info = convertKeysFromSnakeCaseToCamelCase(response.info)
        renameKeys(info, { hostid: 'hostID' })
        if (info.validatedLedger) {
            renameKeys(info.validatedLedger, {
                baseFeeCsc: 'baseFeeCSC',
                reserveBaseCsc: 'reserveBaseCSC',
                reserveIncCsc: 'reserveIncrementCSC',
                seq: 'ledgerVersion'
            })
            info.validatedLedger.baseFeeCSC = dropsToCsc(info.validatedLedger.baseFeeCSC.toString())
            info.validatedLedger.reserveBaseCSC = dropsToCsc(info.validatedLedger.reserveBaseCSC.toString())
            info.validatedLedger.reserveIncrementCSC = dropsToCsc(info.validatedLedger.reserveIncrementCSC.toString())
        }
        return info
    })
}

function computeFeeFromServerInfo(cushion: number, serverInfo: GetServerInfoResponse): number {
    return serverInfo.validatedLedger.baseFeeCSC
}

function getFee(connection: Connection, cushion: number) {
    return getServerInfo(connection).then(_.partial(computeFeeFromServerInfo, cushion))
}

module.exports = {
    getServerInfo,
    getFee
}
