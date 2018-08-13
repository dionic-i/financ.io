/**
 * Description of AppController.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 09.04.18 13:37
 */

const AppController = () => {

	const index = (req, res) => {
		return res.status(200).json({message: 'Welcome!'});
	};

	return {
		index
	};
};

module.exports = AppController;