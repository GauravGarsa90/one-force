'use strict';

const log = console;

//Db
module.exports = class Db {
  
  constructor(opts) {
    this._table = (opts.params || {}).TableName;
    this._client = new (require('aws-sdk')).DynamoDB.DocumentClient(opts);
  }

  
  get(id, callback) {
    log.debug('Get Id:[', id, '] from Table:[', this._table, ']');
    return new Promise((resolve, reject) => {
      try {
        let params = { Key: { id: id } };
        this._client.get(params).promise().then(result => {
          let item = result.Item;
          if(!item) {
            log.debug('Id:[', id, '] not found in Table:[', this._table, ']!');
            throw(new Error('item not found'));
          }
          //log.debug('Got Item:[', item.Item, '] for Id:[', id, ']');
          if(callback) callback(null, item); else resolve(item);
        }).catch(err => {
          log.error('Failed to get DynamoDb doc for Params:[', params, '] in Table:[', this._table, ']!(err=', err, ')');
          err = error.catch(err, 'failed to get item');
          if(callback) callback(err); else reject(err);
        });
      } catch(err) {
        log.error('Failed to get Id:[', id, '] from Db Table:[', this._table, ']!(err=', err, ')');
        err = new Error('failed to get item');
        if(callback) callback(err); else reject(err);
      }
    });
  }

  
  put(item, opts, callback) {
    log.debug('Put Item:[', item.id, '] with Options:[', opts, '] in Table:[', this._table, ']');
    return new Promise((resolve, reject) => {
      try {
        let params = { Item: item };
        if(opts && opts.stale) {
          let key = Object.keys(opts.stale)[0], value = opts.stale[key];
          params.ConditionExpression = (key + ' = :value');
          params.ExpressionAttributeValues = { ':value': value };
        }
        this._client.put(params).promise().then(result => {
          //log.debug('Put Item:[', result, ']');
          if(callback) callback(null, result); else resolve(result);
        }).catch(err => {
          if(err.code == 'ConditionalCheckFailedException') {
            log.error('Conflict while attempting to put Item:[', item, '] in Table:[', this._table, ']!(err=', err, ')');
            err = (new Error('put item conflict'));
          } else {
            log.error('Failed to put DynamoDb doc for Params:[', params, '] in Table:[', this._table, ']!(err=', err, ')');
            console.log('Failed to put DynamoDb doc for Params:[', params, '] in Table:[', this._table, ']!(err=', err, ')');
            err = error.catch(err, 'failed to put item');
          }
          if(callback) callback(err); else reject(err);
        });
      } catch(err) {
        log.error('Failed to put Item:[', item, '] in Db Table:[', this._table, ']!(err=', err, ')');
        err = error.catch(err, 'failed to put item');
        if(callback) callback(err); else reject(err);
      }
    });
  }
  
  scan(opts, callback) {
    log.debug('Scan Table:[', this._table, '] with Options:[', opts, ']');
    return new Promise((resolve, reject) => {
      let items = [];
      const execute = (params) => {
        this._client.scan(params).promise().then(result => {
          log.debug('Scan got ', (result.Items || []).length, ' items .. Next:[', result.LastEvaluatedKey, ']');
          if(result.Items) items = items.concat(result.Items);
          if(result.LastEvaluatedKey) params.ExclusiveStartKey = result.LastEvaluatedKey;
          else delete params.ExclusiveStartKey;
          if(params.ExclusiveStartKey && opts.paginate) {
            execute(params);
          } else {
            let response = { items, nextId: params.ExclusiveStartKey };
            if(callback) callback(null, response); else resolve(response);
          }
        }).catch(err => {
          log.error('Failed to scan Table:[', this._table, '] with Params:[', params, ']!(err=', err, ')');
          err = error.catch(err, 'failed to scan items');
          if(callback) callback(err); else reject(err);
        });
      };
      try {
        let params = {};
        if(opts.index) params.IndexName = opts.index;
        else params.TableName = this._table;
        if(opts.filterExpression) params.FilterExpression = opts.filterExpression;
        if(opts.filterValues) params.ExpressionAttributeValues = opts.filterValues;
        if(opts.nextId) params.ExclusiveStartKey = opts.nextId;
        if(opts.limit) params.Limit = opts.limit;
        execute(params);
      } catch(err) {
        log.error('Failed to scan Db Table:[', this._table, '] with Options:[', opts, ']!(err=', err, ')');
        err = new Error('failed to scan items');
        if(callback) callback(err); else reject(err);
      }
    });
  }

  
  update(id, values, callback) {
    log.debug('Update Id:[', id, '] Values:[', values, '] in Table:[', this._name, ']');
    return new Promise((resolve, reject) => {
      try {
        let params = { Key: { id } }, expression, attributeValues = {}, attributeNames = {};
        Object.keys(values).forEach(key => {
          if(!expression) expression = ('SET #' + key + '=:' + key);
          else expression += (', #' + key + '=:' + key);
          attributeNames['#' + key] = key;
          attributeValues[':' + key] = values[key];
        });
        params.UpdateExpression = expression;
        params.ExpressionAttributeValues = attributeValues;
        params.ExpressionAttributeNames = attributeNames;
        this._client.update(params).promise().then(result => {
          //log.debug('Update Result:[', result, ']');
          if(callback) callback(null, result); else resolve(result);
        }).catch(err => {
          log.error('Failed to update DynamoDb docs for Params:[', params, '] in Table:[', this._table, ']!(err=', err, ')');
          err = new Error('failed to update');
          if(callback) callback(err); else reject(err);
        });
      } catch(err) {
        log.error('Failed to update Id:[', id, '] Values:[', values, '] in Db Table:[', this._table, ']!(err=', err, ')');
        err = error.catch(err, 'failed to update');
        if(callback) callback(err); else reject(err);
      }
    });
  }

  
  delete(id, callback) {
    log.debug('Delete Id:[', id, '] from Table:[', this._table, ']');
    return new Promise((resolve, reject) => {
      try {
        let params = { Key: { id: id } };
        this._client.delete(params).promise().then(result => {
          //log.debug('Update Result:[', result, ']');
          if(callback) callback(null, result); else resolve(result);
        }).catch(err => {
          log.error('Failed to delete DynamoDb doc for Params:[', params, '] in Table:[', this._table, ']!(err=', err, ')');
          err = new Error('failed to delete');
          if(callback) callback(err); else reject(err);
        });
      } catch(err) {
        log.error('Failed to delete Id:[', id, '] from Db Table:[', this._table, ']!(err=', err, ')');
        err = error.catch(err, 'failed to delete');
        if(callback) callback(err); else reject(err);
      }
    });
  }
};
