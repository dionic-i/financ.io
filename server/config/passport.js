const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const authService = require('../src/services/auth.service');

const User = require('../src/modules/users/models/User');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

/**
 * JWT strategy
 */
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorized'),
	secretOrKey   : authService.secret()
};

const strategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
	try {
		const user = User.findById(jwt_payload.id);
		if (user) {
			next(null, user);
		} else {
			next(null, false);
		}
	}
	catch (err) {
		console.log('Error in JwtStrategy', err);
		next(null, false);
	}
});

passport.use(strategy);
