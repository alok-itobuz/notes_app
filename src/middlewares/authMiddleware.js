import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/config.js'
import User from '../models/userSchema.js'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

export default async function (req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) throw new Error("Token doesn't exist.")

        const payload = jwt.verify(token, JWT_SECRET)
        if (!payload || !payload.id) throw new Error('Invalid token')

        const user = await User.findOne({ _id: payload.id }, { __v: 0 })
        if (!user) throw new Error('Invalid payload')


        const isValidToken = !!(user.tokens.find(t => t === token))
        if (!isValidToken) throw new Error('Token is expired.')

        req.user = user
        next()
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            status: ReasonPhrases.BAD_REQUEST,
            message: error.message,
            data: null
        })
    }
}