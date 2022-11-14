const DataDb = require('db/user-directory');

console.log(Array.from(new Set(data.map(d => d.gender))))
module.exports.getOne = async (event, context, callback) => {
    userDirectoryDb.get(event.pathParameters.id, callback);
}
module.exports.list = async (event, context, callback) => {
    userDirectoryDb.scan({}, callback);
}