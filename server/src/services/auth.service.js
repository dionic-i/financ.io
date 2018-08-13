const jwt = require('jsonwebtoken');
const passport = require('passport');
const secret = process.env.JWT_SECRET;

/**
 * Login Required middleware.
 */
const isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.status(401).json({success: false, message: 'Unauthorized'});
};

/**
 * Get auth user
 * @param req
 */
const getUser = function (req) {
	let user = false;
	const token = req.headers.authorized || req.query.access_token;

	if (token) {
		user = jwt.decode(token);
	}

	return user;
};

/**
 * Get auth user
 * @param req
 */
const getToken = function (req) {
	return req.headers.authorized || req.query.access_token;
};

module.exports = {
	issue    : (payload) => jwt.sign(payload, secret, {expiresIn: 2678400}),
	verify   : (token, cb) => jwt.verify(token, secret, {}, cb),
	decode   : (token, cb) => jwt.decode(token),
	secret   : () => secret,
	forget   : (payload) => jwt.sign(payload, secret, {expiresIn: 1}),
	isJwtAuth: passport.authenticate('jwt', {session: false}),
	isAuth   : isAuthenticated,
	getUser,
	getToken
};
