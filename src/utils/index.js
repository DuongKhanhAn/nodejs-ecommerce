'use strict'

const _ = require('lodash')

const getInfoData = ({ fileds = [], object = {} }) => {
    return _.pick( object, fileds)
}


// ['a', 'b'] = {a: 1, b:1}
const getSelectData = (seclect = []) => {
    return Object.fromEntries(seclect.map(el => [el, 1]))
}
// ['a', 'b'] = {a: 0, b:0}
const unGetSelectData = (seclect = []) => {
    return Object.fromEntries(seclect.map(el => [el, 0]))
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData
}