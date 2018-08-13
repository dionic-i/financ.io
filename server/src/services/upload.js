/**
 * Description of schema checker middleware.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 17.05.18 9:28
 */

const multer = require('multer');
const path = require('path');

function upload(controller, scenario, config) {
	const rules = controller.getUploads();
	const schema = rules[scenario] || {};
	const {USER_AVATARS_BASE} = config;
	const {path: pathName = '', limits = {}, file = 'file'} = schema;

	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, USER_AVATARS_BASE)
		},
		filename: function (req, file, cb) {
			const ext = path.extname(file.originalname);
			const fn = file.fieldname + '-' + Date.now() + ext;
			cb(null, fn);
		},
		limits,
	});

	const upload = multer({storage: storage});

	return upload.single(file);
}

module.exports = upload;
