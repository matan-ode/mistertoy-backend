
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = { txt: '' }) {
    return Promise.resolve(toys)
        .then(toys => {
            console.log(toys);

            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                toys = toys.filter(toy => regExp.test(toy.name))
            }
            if (filterBy.maxPrice) {
                toys = toys.filter(toy => toy.price <= filterBy.maxPrice)
            }
            if (filterBy.labels !== 'all') {
                toys = toys.filter(toy => toy.labels.includes(filterBy.labels))
            }
            if (filterBy.inStock !== 'all') {
                toys = toys.filter(toy => {
                    if (filterBy.inStock === 'inStock') return toy.inStock === true
                    else if (filterBy.inStock === 'outOfStock') return toy.inStock === false
                })
            }
            if (filterBy.sortBy) {
                if (filterBy.sortBy === 'name') toys = toys.sort((t1, t2) => t1.name.localeCompare(t2.name))
                if (filterBy.sortBy === 'price') toys = toys.sort((t1, t2) => t1.price - t2.price)
                if (filterBy.sortBy === 'createdAt') toys = toys.sort((t1, t2) => t1.createdAt - t2.createdAt)
            }
            return Promise.resolve(toys)
        })
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')

    // const toy = toys[idx]

    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)

        toyToUpdate.name = toy.name
        toyToUpdate.labels = toy.labels
        toyToUpdate.price = toy.price
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toys.push(toy)
    }
    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}