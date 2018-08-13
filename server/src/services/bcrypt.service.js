const bcrypt = require('bcrypt-nodejs');

module.exports = {
	password       : (user) => {
		const salt = bcrypt.genSaltSync();
		return bcrypt.hashSync(user.password, salt);
	},
	comparePassword: (password, hash) => {
		return bcrypt.compareSync(password, hash)
	},
};
