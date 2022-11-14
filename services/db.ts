'use strict';
import { DynamoDB } from 'aws-sdk'

const log = console;

//Db

export class Db {
  private table
  private client
  constructor(opts: any){
    this.table = (opts.params || {}).TableName;
    this.client = new DynamoDB.DocumentClient(opts);
  }
  get(id: number, callback?: any | undefined){
    log.debug('Get Id:[', id, '] from Table:[', this.table, ']');
    return new Promise((resolve: any, reject: any): void => {
      try {
        let params = { Key: { id: id } };
        this.client.get(params).promise().then(result => {
          let item = result.Item;
          if(!item) {
            log.debug('Id:[', id, '] not found in Table:[', this.table, ']!');
            throw(new Error('item not found'));
          }
          //log.debug('Got Item:[', item.Item, '] for Id:[', id, ']');
          if(callback) callback(null, {
            statusCode: 200,
            body: JSON.stringify(item),
          }); else resolve(item);
        }).catch(err => {
          log.error('Failed to get DynamoDb doc for Params:[', params, '] in Table:[', this.table, ']!(err=', err, ')');
          if(callback) callback(null, {
            statusCode: err.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t fetch the user information.',
          }); else reject(err);
        });
      } catch(err) {
        log.error('Failed to get Id:[', id, '] from Db Table:[', this.table, ']!(err=', err, ')');
        if(callback) callback(null, {
          statusCode: err.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Couldn\'t fetch the user information.',
        }); else reject(err);
      }
    });
  }
  getAll(opts: any, callback?: any | undefined){
    log.debug('Scan Table:[', this.table, '] with Options:[', opts, ']');
    return new Promise((resolve: any, reject: any): void => {
      let items = [];
      const execute = (params: any): void => {
        this.client.scan(params).promise().then(result => {
          log.debug('Scan got ', (result.Items || []).length, ' items .. Next:[', result.LastEvaluatedKey, ']');
          if(result.Items) items = items.concat(result.Items);
          if(result.LastEvaluatedKey) params.ExclusiveStartKey = result.LastEvaluatedKey;
          else delete params.ExclusiveStartKey;
          if(params.ExclusiveStartKey && opts.paginate) {
            execute(params);
          } else {
            let response = {
              statusCode: 200,
              body: JSON.stringify({ items, nextId: params.ExclusiveStartKey }),
            };
            if(callback) callback(null, response); else resolve(response);
          }
        }).catch(err => {
          log.error('Failed to scan Table:[', this.table, '] with Params:[', params, ']!(err=', err, ')');
          if(callback) callback(null, {
            statusCode: err.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t fetch the users list.',
          }); else reject(err);
        });
      };
      try {
        let params: any = {};
        if(opts.index) params.IndexName = opts.index;
        else params.TableName = this.table;
        if(opts.filterExpression) params.FilterExpression = opts.filterExpression;
        if(opts.filterValues) params.ExpressionAttributeValues = opts.filterValues;
        if(opts.nextId) params.ExclusiveStartKey = opts.nextId;
        if(opts.limit) params.Limit = opts.limit;
        execute(params);
      } catch(err) {
        log.error('Failed to scan Db Table:[', this.table, '] with Options:[', opts, ']!(err=', err, ')');
        err = new Error('failed to scan items');
        if(callback) callback(null, {
          statusCode: err.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Couldn\'t fetch the users list.',
        }); else reject(err);
      }
    });
  }
}