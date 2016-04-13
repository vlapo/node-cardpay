'use strict';

var cpConfig = require('./config'),
    CardPayRequest = require('./request'),
    CardPayResponse = require('./response'),
    ValidationError = require('./error');


module.exports = {
    version: cpConfig.version,
    currencies: cpConfig.supportedCurrencies,
    languages: cpConfig.supportedlanguages,
    /**
     * Configure
     */
    configure: function(configObj){
        for(var key in configObj){
            if(key === key.toUpperCase()){
                cpConfig.defaultData[key] = configObj[key];
            }else{
                cpConfig.defaultOptions[key] = configObj[key];
            }
        }
    },
    /**
     * Create payment
     */
    create: function(data, options, cb){
        if(!cb){
            cb = options;
            options = {};
        }
        var request = new CardPayRequest(data, options);
        var validateResponse = request.validateFields();
        if(validateResponse !== null){
            return cb(
                new ValidationError(validateResponse[0], validateResponse[1]),
                null
            );
        }
        request.sign();

        cb(null, request.getRedirectUrl());
    },
    /**
     * Confirm response data
     */
    confirm: function(data, options, cb){
        if(!cb){
            cb = options;
            options = {};
        }
        var response = new CardPayResponse(data, options);
        var validateResponse = response.validateFields();
        if(validateResponse !== null){
            return cb(
                new ValidationError(validateResponse[0], validateResponse[1]),
                null
            );
        }
        response.validateSign(function(err, invalid){
            if(err){
                return cb(err);
            }

            if(invalid !== null){
                return cb(
                    new ValidationError('Invalid security check.', [invalid]),
                    null
                )
            }

            return cb(null, response.isSuccess());
        });
    }

    /**
     * Execute preauthorized payment
     */
    /*execute: function(data, cb){

     },*/
    /**
     * Cancel preauthorized payment
     */
    /*cancel: function(data, cb){

     },

     find: function(query, cb){

     }*/
};