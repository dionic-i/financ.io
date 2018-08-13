/**
 * Description of cluster-log.service.js.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 09.04.18 16:49
 */

const cluster = require('cluster');

function clusterLogger(options) {
	return (req, res, next) => {
		if (cluster.isWorker) {
			console.log('Исполнитель %d получил запрос', cluster.worker.id);
		}
		next();
	}
}

module.exports = clusterLogger;
