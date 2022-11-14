'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = void 0;
const db_1 = require("../services/db");
const list = (event, context, callback) => {
    const userDirectoryDb = new db_1.Db({
        params: {
            TableName: process.env.DYNAMODB_TABLE,
        }
    });
    userDirectoryDb.getAll({}, callback);
};
exports.list = list;
