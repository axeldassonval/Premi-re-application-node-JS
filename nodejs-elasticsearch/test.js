'use strict'

const { Client } = require('elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

async function run () {

  // Let's search!
  const { body } = await client.search({
    index: 'liste_course',
    body: {
      query: {
        match: {
          quote: 'orange'
        }
      }
    }
  })

  console.log(body)
}

run().catch(console.log)