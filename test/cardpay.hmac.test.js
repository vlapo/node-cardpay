'use strict';

var cardpay = require('../lib/cardpay'),
    cpConfig = require('../lib/config'),
    should = require('should'),
    extend = require('util')._extend,
    url = require('url');

describe('Cardpay HMAC', function(){

    var tmpDefaultData;
    var tmpDefaultOptions;
    
    beforeEach(function(){
        tmpDefaultData = extend({},cpConfig.defaultData);
        tmpDefaultOptions = extend({},cpConfig.defaultOptions);
    });

    afterEach(function() {
        cpConfig.defaultData = tmpDefaultData;
        cpConfig.defaultOptions = tmpDefaultOptions;
    });

    describe('create', function(){

        it('should return right redirect URL', function(done){

            var paymentData = {
                MID: '9999',
                RURL: 'https://moja.tatrabanka.sk/cgi-bin/e-commerce/start/example.jsp',
                AMT: '1234.50',
                CURR: 978,
                VS: '1111',
                NAME: 'Jan Pokusny',
                IPC: '1.2.3.4',
                TIMESTAMP: '01092014125505'
            };
            var paymentOptions = {
                securityKey: '31323334353637383930313233343536373839303132333435363738393031323132333435363738393031323334353637383930313233343536373839303132',
                cipher: 'HMAC'
            };

            cardpay.create(paymentData, paymentOptions, function(err, redirectUrl){
                should.not.exist(err);

                var parsedUrl = url.parse(redirectUrl, true);
                paymentData.MID.should.equal(parsedUrl.query.MID);
                paymentData.IPC.should.equal(parsedUrl.query.IPC);
                '574b763f4afd4167b10143d71dc2054615c3fa76877dc08a7cc9592a741b3eb5'.should.equal(parsedUrl.query.HMAC);

                done();
            });

        });


        it('should use configured data and options', function(done){

            var paymentData = {
                AMT: '1234.50',
                CURR: 978,
                VS: '1111',
                NAME: 'Jan Pokusny',
                IPC: '1.2.3.4',
                TIMESTAMP: '01092014125505'
            };
            var configObj = {
                MID: '9999',
                RURL: 'https://moja.tatrabanka.sk/cgi-bin/e-commerce/start/example.jsp',
                securityKey: '31323334353637383930313233343536373839303132333435363738393031323132333435363738393031323334353637383930313233343536373839303132',
                cipher: 'HMAC'
            };

            cardpay.configure(configObj);

            cardpay.create(paymentData, function(err, redirectUrl){
                should.not.exist(err);

                var parsedUrl = url.parse(redirectUrl, true);
                configObj.MID.should.equal(parsedUrl.query.MID);
                paymentData.IPC.should.equal(parsedUrl.query.IPC);
                '574b763f4afd4167b10143d71dc2054615c3fa76877dc08a7cc9592a741b3eb5'.should.equal(parsedUrl.query.HMAC);

                done();
            });

        });

        it('should failed on invalid/missing data', function(done){
            var paymentData = {
                AMT: '1234.50',
                CURR: 978,
                VS: '1111',
                NAME: 'Jan Pokusny',
                IPC: '1.2.3.4',
                TIMESTAMP: '01092014125505'
            };
            var paymentOptions = {
                securityKey: '31323334353637383930313233343536373839303132333435363738393031323132333435363738393031323334353637383930313233343536373839303132',
                cipher: 'HMAC'
            };

            cardpay.create(paymentData, paymentOptions, function(err, redirectUrl){
                should.exist(err);
                should.not.exist(redirectUrl);

                done();
            });
        });
    });


    describe('confirm', function(){

        it('should execute success', function(done){

            var responseData = {
                RES: 'OK',
                AMT: '0.20',
                CURR: 978,
                VS: 9,
                AC: '324280',
                TID: '6993629',
                TIMESTAMP: '29032016143829',
                HMAC: 'e44efa8f3f93e2eea2095209a26a22773f55b076e0e1a7d21300577f3096bf9c',
                ECDSA_KEY: 1,
                ECDSA: '3046022100dd4b44fcf32f4b818a17f9bbe938cd53024b47024c07dddfdf7f105265802a400221009665a7098c6eba40c56342d4b83fec2942a648b238adf51708d75de1a374afeb'
            };
            var options = {
                securityKey: 'gRg6r7+Qe2Bf4f23l9JW9/WJWLQM4jIsD0FGMZsfiSSyyT9KbNWUX7tlLlVK0tfz',
                cipher: 'HMAC'
            };

            cardpay.confirm(responseData, options, function(err, responseOK){
                should.not.exist(err);
                responseOK.should.equal(true);
                done();
            });

        });
    });


});