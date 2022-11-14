'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const db_1 = require("../services/db");
const get = (event, context, callback) => {
    const userDirectoryDb = new db_1.Db({
        params: {
            TableName: process.env.DYNAMODB_TABLE,
        }
    });
    userDirectoryDb.get(event.pathParameters.id, callback);
};
exports.get = get;
