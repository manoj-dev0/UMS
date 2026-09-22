const jwt = require("jsonwebtoken");
const AppError = require("../lib/errors/appError");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(
                "Authentication required",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(
                "Authentication required",
                401
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        req.user = decoded;

        next();

    } catch (err) {

        if (err.name === "TokenExpiredError") {
            return next(
                new AppError(
                    "Access token expired",
                    401
                )
            );
        }

        if (err.name === "JsonWebTokenError") {
            return next(
                new AppError(
                    "Invalid access token",
                    401
                )
            );
        }

        next(err);
    }
};

module.exports = authenticate;