var CardPayRequest = require('../lib/request');

describe('CardPayRequest', function(){

    it('should sign using DES', function(){

        var request = new CardPayRequest({
            MID: 9999,
            RURL: 'https://moja.tatrabanka.sk/cgi-bin/e-commerce/start/example.jsp',
            AMT: '1234.50',
            CURR: 978,
            VS: 1111,
            NAME: 'Jan Pokusny',
            IPC: '1.2.3.4'

        },{
            secureKey: '12345678',
            cipher: 'DES'
        });

        request.sign();

        request.data.SIGN.should.equal('7B5224B0C2DB76D3');
    });

    it('should sign using AES256', function(){

        var request = new CardPayRequest({
            MID: 9999,
            RURL: 'https://moja.tatrabanka.sk/cgi-bin/e-commerce/start/example.jsp',
            AMT: '1234.50',
            CURR: 978,
            VS: 1111,
            NAME: 'Jan Pokusny',
            IPC: '1.2.3.4'

        },{
            secureKey: '3132333435363738393031323334353637383930313233343536373839303132',
            cipher: 'AES256'
        });

        request.sign();

        request.data.SIGN.should.equal('6382B9EB18E648A045D86213217EDDEF');
        });

    it('should sign using HMAC', function(){
        var request = new CardPayRequest({
            MID: 9999,
            RURL: 'https://moja.tatrabanka.sk/cgi-bin/e-commerce/start/example.jsp',
            AMT: '1234.50',
            CURR: 978,
            VS: 1111,
            NAME: 'Jan Pokusny',
            IPC: '1.2.3.4',
            TIMESTAMP: '01092014125505'
        },{
            secureKey: '31323334353637383930313233343536373839303132333435363738393031323132333435363738393031323334353637383930313233343536373839303132',
            cipher: 'HMAC'
        });

        request.sign();

        request.data.HMAC.should.equal('574b763f4afd4167b10143d71dc2054615c3fa76877dc08a7cc9592a741b3eb5');
    });

});

