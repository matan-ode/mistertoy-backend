import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

// import { toyService } from './services/toy.service.js'

const app = express()

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    // Configuring CORS
    // Make sure origin contains the url 
    // your frontend dev-server is running on
    const corsOptions = {
        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:8080',
            'http://localhost:8080',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)


// Fallback route
app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    logger.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)

// Express Routing:

// REST API for Toys
// app.get('/api/toy', (req, res) => {
//     const filterBy = {
//         txt: req.query.txt || '',
//         maxPrice: +req.query.maxPrice || '',
//         labels: req.query.labels || [],
//         inStock: req.query.inStock || 'all',
//         sortBy: req.query.sortBy || '',
//     }
//     // try {
//     //     res.send(toyService.query(filterBy))
//     // }
//     // catch {
//     //     logger.error('Cannot get toys', err)
//     //     res.status(400).send('Cannot get toys')
//     // }
//     toyService.query(filterBy)
//         .then(toys => res.send(toys))
//         .catch(err => {
//             logger.error('Cannot get toys', err)
//             res.status(400).send('Cannot get toys')
//         })
// })

// app.get('/api/toy/:toyId', (req, res) => {
//     const { toyId } = req.params

//     toyService.getById(toyId)
//         .then(toy => res.send(toy))
//         .catch(err => {
//             logger.error('Cannot get toy', err)
//             res.status(400).send('Cannot get toy')
//         })
// })

// app.post('/api/toy', (req, res) => {

//     const toy = {
//         name: req.body.name,
//         price: +req.body.price,
//         labels: req.body.labels,
//         inStock: req.body.inStock,
//         createdAt: req.body.createdAt,
//     }
//     toyService.save(toy)
//         .then(savedToy => res.send(savedToy))
//         .catch(err => {
//             logger.error('Cannot save toy', err)
//             res.status(400).send('Cannot save toy')
//         })
// })

// app.put('/api/toy/:id', (req, res) => {

//     const toy = {
//         _id: req.params.id,
//         name: req.body.name,
//         price: +req.body.price,
//         labels: req.body.labels,
//     }
//     toyService.save(toy)
//         .then(savedToy => res.send(savedToy))
//         .catch(err => {
//             logger.error('Cannot save toy', err)
//             res.status(400).send('Cannot save toy')
//         })
// })

// app.delete('/api/toy/:toyId', (req, res) => {

//     const { toyId } = req.params
//     toyService.remove(toyId)
//         .then(() => res.send('Removed!'))
//         .catch(err => {
//             logger.error('Cannot remove toy', err)
//             res.status(400).send('Cannot remove toy')
//         })
// })


