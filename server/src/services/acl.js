/**
 * Description of aclChecker.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 07.04.18 9:28
 */



function aclChecker(config) {

	const {app, passport} = config;

	function aclMiddleware(req, res, next) {
		console.log('I am in aclMiddleware');
		next();
	}

	return aclMiddleware;
}


module.exports = aclChecker;
