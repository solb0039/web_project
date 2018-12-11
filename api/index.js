const router = module.exports = require('express').Router();

router.use('/', require('./lodgings').router);
//router.use('/users', require('./users').router);


