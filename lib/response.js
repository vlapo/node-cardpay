'use strict';

var cpConfig = require('./config'),
    cpUtils = require('./utils'),
    util = require('util'),
    extend = util._extend;

var SIGN_BASE_KEYS_OBJ = {
    HMAC: ['AMT', 'CURR', 'VS', 'TXN', 'RES', 'AC', 'TRES', 'CID', 'TID', 'TIMESTAMP'],
    default: ['VS', 'RES', 'AC']
};
var REQUIRED_FIELDS = {
    HMAC: ['AMT', 'CURR', 'VS', 'RES', 'TID', 'TIMESTAMP', 'HMAC', 'ECDSA_KEY', 'ECDSA'], //+AC if RES == OK
    default: ['VS', 'RES', 'SIGN'] //+AC if RES == OK
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
    var sign = cpUtils.encrypt(signBase, this.options.securityKey, this.options.cipher);
    var data = this.data;
    var options = this.options;

    if(options.cipher === 'DES' || options.cipher === 'AES256'){
        if(data.SIGN !== sign){
            return cb(null, 'SIGN');
        }
    } else { // HMAC

        if(data.HMAC !== sign){
            return cb(null, 'HMAC')
        }

        // ECDSA
        var ecdsaString = signBase + sign;
        cpUtils.getPublicKey(data.ECDSA_KEY, function(err, publicKey){
            if(err){
                return cb(err)
            }

            var valid = cpUtils.validateECDSA(publicKey, data.ECDSA, ecdsaString);
            if(!valid){
                return cb(null, 'ECDSA');
            }
            cb(null, null);
        });
    }
};

CardPayResponse.prototype.validateFields = function(){
    var reqFields = REQUIRED_FIELDS[this.options.cipher] ? REQUIRED_FIELDS[this.options.cipher] : REQUIRED_FIELDS ['default'];
    var data = this.data;
    var reqFailed = reqFields.filter(function(fieldKey){
        return !data[fieldKey] || data[fieldKey] === '';
    });
    if(data.RES === 'OK' && (!data.AC || data.AC === '')){
        reqFailed.push('AC');
    }
    if(reqFailed.length > 0){
        return ['Missing required fields.', reqFailed];
    }
    return null;
};

CardPayResponse.prototype.isSuccess = function(){
    return this.data.RES === 'OK';
};


module.exports = CardPayResponse;