'use strict';

function CPValidationError(message, fields){
    //Set the name for the ERROR
    this.name = this.constructor.name;

    this.message = message;
    this.fields = fields;
}

CPValidationError.prototype = Object.create(Error.prototype);

module.exports = CPValidationError;
