'use strict';

var cpConfig = require('./config'),
    cpUtils = require('./utils'),
    util = require('util'),
    extend = util._extend;

var GATEWAY_URL = 'https://moja.tatrabanka.sk/cgi-bin/e-commerce/start/cardpay';
var SIGN_BASE_KEYS_OBJ = {
    HMAC: ['MID', 'AMT', 'CURR', 'VS', 'TXN', 'RURL', 'IPC', 'NAME', 'REM', 'TPAY', 'CID', 'TIMESTAMP'],
    default: ['MID', 'AMT', 'CURR', 'VS', 'RURL', 'IPC', 'NAME']
};
var REQUIRED_FIELDS = {
    HMAC: ['MID', 'AMT', 'CURR', 'VS', 'RURL', 'IPC', 'NAME', 'TIMESTAMP'], //+HMAC
    default: ['MID', 'AMT', 'CURR', 'VS', 'RURL', 'IPC', 'NAME'] //+SIGN
};


function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

function getNowTimestampString() {
    var str = '';
    var now = new Date();

    // DDMMYYYYHHMISS
    str += pad2(now.getUTCDate());
    str += pad2(now.getUTCMonth());
    str += now.getUTCFullYear();
    str += pad2(now.getUTCHours());
    str += pad2(now.getUTCMinutes());
    str += pad2(now.getUTCSeconds());

    return str;
}

function getSignatureBase(data, cipher) {
    var base = '';
    var signBaseKeys = SIGN_BASE_KEYS_OBJ[cipher] ? SIGN_BASE_KEYS_OBJ[cipher] : SIGN_BASE_KEYS_OBJ['default'];

    signBaseKeys.forEach(function(val){
        base += data[val] || '';
    });

    return base;
}


function CardPayRequest(paymentData, options) {
    this.data = extend({}, cpConfig.defaultData);
    this.data.TIMESTAMP = getNowTimestampString();
    this.data = extend(this.data, paymentData);

    this.options = extend({}, cpConfig.defaultOptions);
    this.options = extend(this.options, options);
}


CardPayRequest.prototype.sign = function() {
    var signBase = getSignatureBase(this.data, this.options.cipher);
    var sign = cpUtils.encrypt(signBase, this.options.securityKey, this.options.cipher);

    if(this.options.cipher === 'DES' || this.options.cipher === 'AES256'){
        this.data.SIGN = sign;
    } else { // HMAC
        this.data.HMAC = sign;
    }
};


CardPayRequest.prototype.getRedirectUrl = function() {
    var params = '?';

    for(var dataKey in this.data){
        if(this.data[dataKey]){
            params += dataKey + '=' + this.data[dataKey] + '&';
        }
    }

    params = params.substr(0, params.length-1);

    return GATEWAY_URL + params;
};


CardPayRequest.prototype.validateFields = function() {

    var reqFields = REQUIRED_FIELDS[this.options.cipher] ? REQUIRED_FIELDS[this.options.cipher] : REQUIRED_FIELDS ['default'];
    var data = this.data;
    var reqFailed = reqFields.filter(function(fieldKey){
        return !data[fieldKey] || data[fieldKey] === '';
    });
    if(reqFailed.length > 0){
        return ['Missing required fields.', reqFailed];
    }

    var validCurr = false;
    for (var currKey in cpConfig.supportedCurrencies){
        if(cpConfig.supportedCurrencies[currKey] === this.data.CURR){
            validCurr = true;
            break;
        }
    }
    if(!validCurr){
        return ['Unsupported currency.', ['CURR']];
    }

    if(this.data.LANG){
        var validLang = false;
        for (var langKey in cpConfig.supportedlanguages){
            if(cpConfig.supportedlanguages[langKey] === this.data.LANG){
                validLang = true;
                break;
            }
        }
        if(!validLang){
            return ['Unsupported language.', ['LANG']];
        }
    }

    var invalidFields = [];
    // req field validation
    if(this.data.MID.match(/^[0-9a-z]{3,4}$/i) === null){
        invalidFields.push('MID');
    }

    if(this.data.AMT.match(/^[0-9]{1,9}(\.[0-9]+)?$/) === null){
        invalidFields.push('AMT');
    }

    if(this.data.VS.length > 10 || this.data.VS.match(/^[0-9]+$/) === null){
        invalidFields.push('VS');
    }

    if(this.data.RURL.match(/^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/) === null){
        invalidFields.push('RURL');
    }

    // https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    if(this.data.IPC.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) === null &&
        this.data.IPC.match(/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/) === null){
        invalidFields.push('IPC');
    }

    if(this.data.NAME.match(/^[a-zA-Z0-9 _.@-]{0,30}$/) === null){
        invalidFields.push('NAME');
    }

    // don`t validate this.data.HMAC because sing() is after validate fields

    // optional fields validation
    if(this.data.TXN && this.data.TXN !== '' && this.data.TXN !== 'PA'){
        invalidFields.push('TXN');
    }

    if(this.data.REM && (this.data.REM.length > 50 || this.data.REM.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === null)){
        invalidFields.push('REM');
    }

    if(this.data.TPAY && this.data.TXN.length > 1){
        invalidFields.push('TPAY');
    }

    if(this.data.CID && this.data.CID.match(/^[0-9]{0,14}$/) === null){
        invalidFields.push('CID');
    }

    if(this.data.AREDIR && this.data.AREDIR > 1 && this.data.AREDIR < 0){
        invalidFields.push('AREDIR');
    }

    if(invalidFields.length > 0){
        return ['Invalid fields.', invalidFields];
    }else{
        return null;
    }

};


module.exports = CardPayRequest;