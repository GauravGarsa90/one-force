'use strict';
import { Db } from '../services/db';

export const list = (event, context, callback) => {
  const userDirectoryDb = new Db({
    params: {
      TableName: process.env.DYNAMODB_TABLE,
    }
  });
  userDirectoryDb.getAll({}, callback);
}
