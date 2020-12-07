const es = require('elasticsearch');
const esClient = new es.Client({
    host: 'localhost:9200',
    log: 'trace'
});

const findDocs = function(indexName, q, callback){
    var options = {
        index: indexName
    };
    if (q) { options.q = q; }
    return esClient.search(options, callback);
};

const getDoc = function(indexName, id, callback){
    return esClient.get({
        index: indexName,
        id: id
    }, callback);
};

const insertDoc = function(indexName, data, callback){
    return esClient.index({
        index: indexName,
        body: data,
        refresh: 'wait_for'
    }, callback);
};

const updateDoc = function(indexName,id, data, callback){
    return esClient.index({
        index: indexName,
        body: data,
        id: id,
        refresh: 'wait_for'
    }, callback);
};

const deleteDoc = function(indexName,id, callback){
    return esClient.delete({
        index: indexName,
        id: id,
        refresh: 'wait_for'
    }, callback);
};

exports.findDocs = findDocs;
exports.getDoc = getDoc;
exports.insertDoc = insertDoc;
exports.updateDoc = updateDoc;
exports.deleteDoc = deleteDoc;
