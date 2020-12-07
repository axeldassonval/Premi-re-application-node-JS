const es = require('elasticsearch');
const esClient = new es.Client({
    host: 'localhost:9200',
    log: 'trace'
});


const createIndex = async function(indexName){
    return await esClient.indices.create({
        index: indexName
    });
}

module.exports = createIndex;


async function test(){
    try {
        const resp = await createIndex('session');
        console.log(resp);
    } catch (e) {
        console.log(e);
    }
}
test();