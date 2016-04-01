'use strict';

var cpConfig = require('./config'),
    CardPayRequest = require('./request'),
    CardPayResponse = require('./response');


module.exports = {
    version: cpConfig.version,
    currencies: cpConfig.supportedCurrencies,
    languages: cpConfig.supportedlanguages,
    /**
     *
     * @param {Object} configObj
     * @param {}
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
     * @param {Object} data Payment data.
     * @param {String} data.MID
     * @param {String|Number} data.AMT
     * @param {String|Number} data.CURR
     * @param {String} data.VS
     * @param {String} data.RURL
     * @param {String} data.IPC
     * @param {String} data.NAME
     * @param {String} [data.REM]
     * @param {String} [data.TPAY]
     * @param {String} [data.CID]
     * @param {Boolean} [data.AREDIR]
     * @param {String} [data.LANG]
     */
    create: function(data, options, cb){
        if(!cb){
            cb = options;
            options = {};
        }
        var request = new CardPayRequest(data, options);
        var validateErr = request.validateFields();
        if(validateErr){
            return cb(validateErr, null);
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
        response.validateSign(function(err){
            if(err){
                return cb(err, response.isSuccess())
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