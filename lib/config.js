'use strict';

var version = exports.version = require('../package').version;

var supportedCurrencies = exports.supportedCurrencies = {
    EUR: 978,
    CZK: 203,
    USD: 840,
    GBP: 826,
    HUF: 348,
    PLN: 985,
    CHF: 756,
    DKK: 208
};

var supportedlanguages = exports.supportedlanguages = {
    SK: 'sk',
    EN: 'en',
    DE: 'de',
    HU: 'hu',
    CZ: 'cz',
    ES: 'es',
    FR: 'fr',
    IT: 'it',
    PL: 'pl'
};

var defaultOptions = exports.defaultOptions = {
    cipher: 'HMAC',
    securityKey: ''
};

var defaultData = exports.defaultData = {
    CURR: supportedCurrencies.EUR,
    TXN: '',
    REM: '',
    TPAY: '',
    CID: ''
};


