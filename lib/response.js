'use strict';

var cpConfig = require('./config'),
    cpUtils = require('./utils'),
    util = require('util'),
    extend = util._extend;

var SIGN_BASE_KEYS_OBJ = {
    HMAC: ['AMT', 'CURR', 'VS', 'TXN', 'RES', 'AC', 'TRES', 'CID', 'TID', 'TIMESTAMP'],
    default: ['VS', 'RES', 'AC']
};

function getSignatureBase(data, cipher) {
    var base = '';
    var signBaseKeys = SIGN_BASE_KEYS_OBJ[cipher] ? SIGN_BASE_KEYS_OBJ[cipher] : SIGN_BASE_KEYS_OBJ['default'];

    signBaseKeys.forEach(function(val){
        base += data[val] || '';
    });

    return base;
}

function CardPayResponse(responseData, options) {
    this.data = extend({}, cpConfig.defaultData);
    this.data = extend(this.data, responseData);

    this.options = extend({}, cpConfig.defaultOptions);
    this.options = extend(this.options, options);
}


CardPayResponse.prototype.validateSign = function(cb){
    var signBase = getSignatureBase(this.data, this.options.cipher);
    var sign = cpUtils.encrypt(signBase, this.options.secureKey, this.options.cipher);

    if(this.options.cipher === 'DES' || this.options.cipher === 'AES256'){
        if(this.data.SIGN !== sign){
            return cb('INSIGN');
        }
    } else { // HMAC

        if(this.data.HMAC !== sign){
            return cb('INHMAC')
        }

        // ECDSA
        var ecdsaString = signBase + sign;
        cpUtils.validateECDSA(this.data.ECDSA_KEY, this.data.ECDSA, ecdsaString, function(err, valid){
            if(err){
                return cb('ERRPUB')
            }

            if(!valid){
                return cb('INECDSA');
            }
            cb(null);
        });

    }
};

CardPayResponse.prototype.validateFields = function(){
};

CardPayResponse.prototype.isSuccess = function(){
    return this.data.RES === 'OK';
};


module.exports = CardPayResponse;