var CardPayResponse = require('../lib/response'),
    cpUtils = require('../lib/utils'),
    should = require('should'),
    path = require('path'),
    nock = require('nock');

describe('CardPayResponse', function(){

    var tmpEcdsaKeysFile = cpUtils.ECDSA_KEYS_FILE;
    beforeEach(function(){
        // use ecdsa_keys_test.txt instead download actual
        cpUtils.ECDSA_KEYS_FILE = path.resolve( __dirname, './ecdsa_keys_test.txt');
    });
    
    afterEach(function(){
        cpUtils.ECDSA_KEYS_FILE = tmpEcdsaKeysFile;
        // clean up
        nock.cleanAll();
        nock.enableNetConnect();
    });

    it('should success validate sign using HMAC', function(done){

        var request = new CardPayResponse({
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
        },{
            secureKey: 'gRg6r7+Qe2Bf4f23l9JW9/WJWLQM4jIsD0FGMZsfiSSyyT9KbNWUX7tlLlVK0tfz',
            cipher: 'HMAC'
        });

        request.validateSign(function(err){

            should.not.exist(err);

            done();
        });
    });

    it('should fail validate sign using HMAC - wrong HMAC', function(done){

        var request = new CardPayResponse({
            RES: 'OK',
            AMT: '0.20',
            CURR: 978,
            VS: 9,
            AC: '324280',
            TID: '6993629',
            TIMESTAMP: '29032016143820',
            HMAC: 'e44efa8f3f93e2eea2095209a26a22773f55b076e0e1a7d21300577f3096bf9c',
            ECDSA_KEY: 1,
            ECDSA: '3046022100dd4b44fcf32f4b818a17f9bbe938cd53024b47024c07dddfdf7f105265802a400221009665a7098c6eba40c56342d4b83fec2942a648b238adf51708d75de1a374afeb'
        },{
            secureKey: 'gRg6r7+Qe2Bf4f23l9JW9/WJWLQM4jIsD0FGMZsfiSSyyT9KbNWUX7tlLlVK0tfz',
            cipher: 'HMAC'
        });

        request.validateSign(function(err){

            err.should.equal('INHMAC');

            done();
        });
    });

    it('should fail validate sign using HMAC - wrong public key ECDSA', function(done){

        var request = new CardPayResponse({
            RES: 'OK',
            AMT: '0.20',
            CURR: 978,
            VS: 9,
            AC: '324280',
            TID: '6993629',
            TIMESTAMP: '29032016143829',
            HMAC: 'e44efa8f3f93e2eea2095209a26a22773f55b076e0e1a7d21300577f3096bf9c',
            ECDSA_KEY: 2,
            ECDSA: '3046022100dd4b44fcf32f4b818a17f9bbe938cd53024b47024c07dddfdf7f105265802a400221009665a7098c6eba40c56342d4b83fec2942a648b238adf51708d75de1a374afeb'
        },{
            secureKey: 'gRg6r7+Qe2Bf4f23l9JW9/WJWLQM4jIsD0FGMZsfiSSyyT9KbNWUX7tlLlVK0tfz',
            cipher: 'HMAC'
        });

        request.validateSign(function(err){

            err.should.equal('INECDSA');

            done();
        });
    });

    it('should fail validate sign using HMAC - cannot download public keys', function(done){

        // not exist txt file with public keys = download from bank server
        cpUtils.ECDSA_KEYS_FILE = path.resolve( __dirname, './ecdsa_keys_test2.txt');

        nock(cpUtils.ECDSA_KEYS_URL)
            .get('')
            .replyWithError('something awful happened');

        var request = new CardPayResponse({
            RES: 'OK',
            AMT: '0.20',
            CURR: 978,
            VS: 9,
            AC: '324280',
            TID: '6993629',
            TIMESTAMP: '29032016143829',
            HMAC: 'e44efa8f3f93e2eea2095209a26a22773f55b076e0e1a7d21300577f3096bf9c',
            ECDSA_KEY: 2,
            ECDSA: '3046022100dd4b44fcf32f4b818a17f9bbe938cd53024b47024c07dddfdf7f105265802a400221009665a7098c6eba40c56342d4b83fec2942a648b238adf51708d75de1a374afeb'
        },{
            secureKey: 'gRg6r7+Qe2Bf4f23l9JW9/WJWLQM4jIsD0FGMZsfiSSyyT9KbNWUX7tlLlVK0tfz',
            cipher: 'HMAC'
        });

        try{
        request.validateSign(function(err){

            err.should.equal('ERRPUB');

            done();
        });
        }catch(err){
            console.log('catch', err);
        }
    });

});

