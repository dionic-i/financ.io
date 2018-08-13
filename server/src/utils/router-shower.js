/**
 * Description of router-shower.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 06.04.18 16:17
 */

function print(path, layer) {
	if (layer.route) {
		layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
	} else if (layer.name === 'router' && layer.handle.stack) {
		layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
	} else if (layer.method) {
		console.log('%s /%s',
			layer.method.toUpperCase(),
			path.concat(split(layer.regexp)).filter(Boolean).join('/'))
	}
}

function split(thing) {
	if (typeof thing === 'string') {
		return thing.split('/')
	} else if (thing.fast_slash) {
		return ''
	} else {
		const match = thing.toString()
			.replace('\\/?', '')
			.replace('(?=\\/|$)', '$')
			.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
		return match
			? match[1].replace(/\\(.)/g, '$1').split('/')
			: '<complex:' + thing.toString() + '>'
	}
}

module.exports = function shower(app) {
	app._router.stack.forEach(print.bind(null, []));
};
