'use strict';

const options = require ('../../config.js');

module.exports = require('bookshelf')(options.knex);
