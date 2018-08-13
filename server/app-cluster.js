/**
 * Description of cluster.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 09.04.18 13:54
 */

const cluster = require('cluster');

function startWorker() {
	const worker = cluster.fork();
	console.log('КЛАСТЕР: Исполнитель %d запущен', worker.id);
}

if (cluster.isMaster) {

	require('os').cpus().forEach(function () {
		startWorker();
	});

	cluster.on('disconnect', function (worker) {
		console.log('КЛАСТЕР: Исполнитель %d отключился от кластера.', worker.id);
	});

	cluster.on('exit', function (worker, code, signal) {
		console.log('КЛАСТЕР: Исполнитель %d завершил работу с кодом завершения %d (%s)', worker.id, code, signal);
		startWorker();
	});

} else {
	require('./app.js')();
}
