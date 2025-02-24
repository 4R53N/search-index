const si = require('../../')
const test = require('tape')

const sandbox = 'test/sandbox/'
const indexName = sandbox + 'storeVector-test'

const data = [
  {
    _id: 1,
    text: 'a giant banana'
  },
  {
    _id: 2,
    text: 'a giant pineapple'
  },
  {
    _id: 3,
    text: 'a small pineapple'
  }
]

test('create a search index', t => {
  t.plan(1)
  si({
    name: indexName,
    storeVectors: true
  }).then(db => {
    global[indexName] = db
    t.pass('ok')
  })
})

test('can add some data', t => {
  t.plan(1)
  global[indexName].PUT(data).then(t.pass)
})

test('can verify store', t => {
  const entries = [
    {
      key: ['CREATED_WITH'],
      value: 'search-index@' + require('../../package.json').version
    },
    {
      key: ['DOC', 1],
      value: {
        _id: 1,
        text: ['["a","1.00"]', '["banana","1.00"]', '["giant","1.00"]']
      }
    },
    {
      key: ['DOC', 2],
      value: {
        _id: 2,
        text: ['["a","1.00"]', '["giant","1.00"]', '["pineapple","1.00"]']
      }
    },
    {
      key: ['DOC', 3],
      value: {
        _id: 3,
        text: ['["a","1.00"]', '["pineapple","1.00"]', '["small","1.00"]']
      }
    },
    { key: ['DOCUMENT_COUNT'], value: 3 },
    { key: ['DOC_RAW', 1], value: { _id: 1, text: 'a giant banana' } },
    { key: ['DOC_RAW', 2], value: { _id: 2, text: 'a giant pineapple' } },
    { key: ['DOC_RAW', 3], value: { _id: 3, text: 'a small pineapple' } },
    { key: ['FIELD', 'text'], value: 'text' },
    { key: ['IDX', 'text', ['a', '1.00']], value: [1, 2, 3] },
    { key: ['IDX', 'text', ['banana', '1.00']], value: [1] },
    { key: ['IDX', 'text', ['giant', '1.00']], value: [1, 2] },
    {
      key: ['IDX', 'text', ['pineapple', '1.00']],
      value: [2, 3]
    },
    { key: ['IDX', 'text', ['small', '1.00']], value: [3] }
  ]
  t.plan(entries.length + 1)
  global[indexName].INDEX.STORE.createReadStream({ lt: ['~'] })
    .on('data', d => {
      t.deepEquals(d, entries.shift())
    })
    .on('end', resolve => t.pass('ended'))
})
