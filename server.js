const jsonServer = require('json-server')
const queryString = require('query-string')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const routes = require('./routes.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
    req.body.updatedAt = Date.now()
  } else if (req.method === 'PATCH' || req.method === 'PUT') {
    req.body.updatedAt = Date.now()
  }

  // Continue to JSON Server router
  next()
})

// Custom output for LIST with pagination
router.render = (req, res) => {
  // Check GET with pagination
  // If yes, custom output
  const headers = res.getHeaders()

  const totalCountHeader = headers['x-total-count']
  if (req.method === 'GET' && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedUrl.query)

    const result = {
      data: res.locals.data,
      totalCount: Number.parseInt(totalCountHeader),
      pagination: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 10,
        _totalRows: Number.parseInt(totalCountHeader),
      },
    }

    return res.jsonp(result)
  }

  // Otherwise, keep default behavior
  res.jsonp(res.locals.data)
}

server.use(jsonServer.bodyParser)
server.use(jsonServer.rewriter(routes))
server.use(router)

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log('JSON Server is running')
})
