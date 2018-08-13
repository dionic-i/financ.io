const test = require('ava');
const {auth, beforeAction, afterAction} = require('../setup/_setup');

const User = require('../../src/modules/users/models/User');

test.before(auth);
test.after(afterAction);

test.beforeEach(async (t) => {
	await User.create({
		email   : 'martin@mail.com',
		password: 'securepassword',
		username: 'Ilya'
	}).then((user) => {
		t.context.user = user;
		return t.context.user;
	});
});

test.serial('User is created correctly', async (t) => {
	const sendUser = t.context.user.toJSON();
	// check if user is created
	t.is(t.context.user.email, 'martin@mail.com');
	// check if password is not send to browser
	t.falsy(sendUser.password);

	await t.context.user.destroy();
});

test.serial('User is updated correctly', async (t) => {
	await t.context.user.update({
		email: 'peter@mail.com',
	}).then((user) => {
		t.context.user = user;
		return t.context.user;
	});

	t.is(t.context.user.email, 'peter@mail.com');

	await t.context.user.destroy();
});
