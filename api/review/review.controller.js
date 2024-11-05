import { logger } from '../../services/logger.service.js'
// import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { reviewService } from './review.service.js'
import { toyService } from '../toy/toy.service.js'

export async function getReviews(req, res) {
    try {
        const reviews = await reviewService.query(req.query)
        res.send(reviews)
    } catch (err) {
        logger.error('Cannot get reviews', err)
        res.status(400).send({ err: 'Failed to get reviews' })
    }
}

// export async function deleteReview(req, res) {
//     var { loggedinUser } = req
//     const { id: reviewId } = req.params

//     try {
//         const deletedCount = await reviewService.remove(reviewId)

//         if (deletedCount === 1) {
//             socketService.broadcast({ type: 'review-removed', data: reviewId, userId: loggedinUser._id })
//             res.send({ msg: 'Deleted successfully' })
//         } else {
//             res.status(400).send({ err: 'Cannot remove review' })
//         }
//     } catch (err) {
//         logger.error('Failed to delete review', err)
//         res.status(400).send({ err: 'Failed to delete review' })
//     }
// }

export async function addReview(req, res) {

    var { loggedinUser } = req
    console.log(loggedinUser)
    try {
        var review = req.body
        console.log('review', review);

        // const { userId } = review
        // review.userId = loggedinUser._id
        review = await reviewService.add(review)

        //* Give the user credit for adding a review
        // loggedinUser.score += 10
        // await userService.update(loggedinUser)

        // Update user score in login token as well
        const loginToken = authService.getLoginToken(loggedinUser)
        res.cookie('loginToken', loginToken)

        //* prepare the updated review for sending out
        review.user = loggedinUser
        console.log('check id', review.toyId);
        const newToyId =  review.userId.toString().replace(/ObjectId\("(.*)"\)/, "$1")
        console.log('REVIEW CHECK', newToyId);
        review.toy = await toyService.getById(newToyId)
        // review.createdAt = review._id.getTimestamp()
        // review.toy._id = review.userId.toString().replace(/ObjectId\("(.*)"\)/, "$1")

        console.log('REVIEW CHECK', review.userId.toString().replace(/ObjectId\("(.*)"\)/, "$1"));
        
        // delete review.userId
        // delete review.userId
        // console.log(review.toy);

        // socketService.broadcast({ type: 'review-added', data: review, userId: loggedinUser._id })
        // socketService.emitToUser({ type: 'review-about-you', data: review, userId: review.toy._id })

        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })
        console.log(review);

        res.send(review)
    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(400).send({ err: 'Failed to add review' })
    }
}
