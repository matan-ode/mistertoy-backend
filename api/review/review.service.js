import { ObjectId } from 'mongodb'

import { asyncLocalStorage } from '../../services/als.service.js'
import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const reviewService = { query, remove, add }

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')

        var reviews = await collection.aggregate([
            {
                $match: criteria,
            },
            {
                $lookup: {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $lookup: {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'toy',
                },
            },
            {
                $unwind: '$toy',
            },
        ]).toArray()
        
        reviews = reviews.map(review => {
            review._id = review._id
            review.content = review.txt
            review.toy = {
                _id: review.toy._id,
                name: review.toy.name
            }
            review.user = {
                _id: review.user._id,
                nickname: review.user.fullname
            }
            review.createdAt = review._id.getTimestamp()
            delete review.userId
            delete review.toyId
            delete review.txt
            return review
        })

        return reviews
    } catch (err) {
        logger.error('cannot get reviews', err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')

        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        //* remove only if user is owner/admin
        //* If the user is not admin, he can only remove his own reviews by adding userId to the criteria
        if (!loggedinUser.isAdmin) {
            criteria.userId = ObjectId.createFromHexString(loggedinUser._id)
        }

        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review) {
    try {
        const reviewToAdd = {
            userId: ObjectId.createFromHexString(review.userId),
            toyId: ObjectId.createFromHexString(review.toyId),
            txt: review.txt,
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd
    } catch (err) {
        logger.error('cannot add review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.userId) {
        criteria.userId = ObjectId.createFromHexString(filterBy.userId)
    }
    return criteria
}