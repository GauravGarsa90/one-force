'use strict';

//user session db
module.exports = (new (require('./db'))({ params: { TableName: (process.env.USER_DIRECTORY_TABLE || 'UserDirectory') } }));
