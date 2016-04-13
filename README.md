# CardPay

[![Build Status](https://travis-ci.org/zwizu/node-cardpay.svg?branch=master)](https://travis-ci.org/zwizu/node-cardpay)

## Specifications

 - HMAC     - [manual](http://www.tatrabanka.sk/cardpay/CardPay_technicka_prirucka_HMAC.pdf)
 - AES256   - [manual](http://www.tatrabanka.sk/cardpay/CardPay_technicka_prirucka.pdf)
 - DES      - [manual](http://www.tatrabanka.sk/cardpay/CardPay_technicka_prirucka_DES.pdf)
 
## ToDo
 - AES256/DES/HMAC -  preauthorized payment (execute, cancel)
 - AES256/DES - response tests
 - HMAC - confirm/get payment (find)

## Installation

```sh
$ npm install cardpay --save
```

## Documentation - HMAC

<a name="configure"></a>
### configure(configObj);

Configuration global parameters.

__Arguments__
* `configObj`
    * `securityKey` - security key from bank (hex without ":" or utf8)
    * `cipher` - HMAC || AES256 || DES
    * `MID` - merchant id from bank
    * `RURL` - return url
    * `LANG` - language (use languages property with array of supported languages)
    * `CURR` - currency (use currencies property with array of supported currencies)

__Usage__
```javascript
var cardpay = require('cardpay')
    cpCurrencies = cardpay.currencies,
    cpLanguages = cardpay.languages;

var configObj = {
    securityKey: '3536373363...303123334323132',
    cipher: 'HMAC',
    MID: '9999',
    RURL: 'http://myshop.example.com/confirm-order/',
    LANG: cpLanguages.EN,
    CURR: cpCurrencies.EUR
}

cardpay.configure(configObj);
```

<a name="create"></a>
### create(paymentParams, [configObj], callback);

Create redirect url with sign/hmac 

__Arguments__

* `paymentParams`
    * `MID` - **Required** or [`global config`](#configure)
    * `CURR` - *Optional* or [`global config`](#configure)
    * `LANG` - *Optional* or [`global config`](#configure)
    * `RURL` - **Required** or [`global config`](#configure)
    * `AMT` - **Required** - payment amount
    * `VS` - **Required** - payment identification (numbers max. 10)
    * `IPC` - **Required** - client IP (IPv4 || IPv6)
    * `NAME` - **Required** - client name or email address (max. 30)
    * `TXN`- *Optional*
    * `REM`- *Optional*
    * `TPAY`- *Optional*
    * `CID`- *Optional*
    * `TPAY`- *Optional*
    * `AREDIR`- *Optional*
* `configObj` - *Optional* - use [`global config`](#configure) first
    * `securityKey`
    * `cipher`
* `callback(err, redirectUrl)`

__Usage__
```javascript
var paymentData = {
    MID: '9999',
    RURL: 'http://myshop.example.com/confirm-order/',
    AMT: '1234.50',
    CURR: 978,
    VS: '1111',
    NAME: 'Jan Pokusny',
    IPC: '1.2.3.4',
    TIMESTAMP: '01092014125505'
};
var paymentOptions = {
    securityKey: '3132333435.....313233343536373839303132',
    cipher: 'HMAC'
};

cardpay.create(paymentData, paymentOptions, function(err, redirectUrl){
    if(err){
        // handle errors
    }
    
    //redirect to redirectUrl...
});
```

<a name="confirm"></a>
### confirm(responseData, [configObj], callback);

Confirm response data from return url, email, sms.

__Arguments__
* `responseParams`
    * `AMT` - **Required** - payment amount
    * `CURR` - **Required** - currency
    * `VS` - **Required** - payment identification (numbers max. 10)
    * `TXN`- *Optional*
    * `RES`- *Optional*
    * `AC`- *Optional*
    * `TRES`- *Optional*
    * `RC`- *Optional*
    * `TID` - **Required** Transaction ID.
    * `TIMESTAMP` - **Required**
    * `HMAC`- *Required*
    * `ECSDA_KEY`- *Required*
    * `ECDSA` - *Required*
* `configObj` - *Optional* - use [`global config`](#configure) first
    * `securityKey`
    * `cipher`
* `callback(err, responseOK)`

__Usage__
```javascript
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
    if(err){
        // handle errors
        if()
    }
    
    if(responseOK){
        // everything is all right
    }else{
        // bank return RES === FAIL. See specification.
    }
});
```