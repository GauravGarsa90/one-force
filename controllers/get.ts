'use strict';
import { Db } from '../services/db';

export const get = (event, context, callback) => {
  const userDirectoryDb = new Db({
    params: {
      TableName: process.env.DYNAMODB_TABLE,
    }
  });
  userDirectoryDb.get(event.pathParameters.id, callback);
}