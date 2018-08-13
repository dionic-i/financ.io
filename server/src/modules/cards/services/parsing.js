/**
 * Description of parsing.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 08.06.18 9:38
 */

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

function isHeaderRow(row) {
	return true;
}

function isDateField(value) {
}

function isAmountField() {
}

function isDescField() {
}

function removeSpecSymbols(value) {
	//return value.replace('(/[\u{0080}-\u{FFFF}]/gu', '');
	return value.replace(/[^a-z0-9 :,.?!']/ig, '');
}

async function parseCsvFile(file, divider = ',') {
	let lines,
		splitLines = [],
		fields = [],
		records = [],
		defaultFields = {
			type  : {
				column: 'field0',
				title : 'Тип'
			},
			iddate: {
				column: 'field2',
				title : 'Дата'
			},
			full  : {
				column: 'field4',
				title : 'Описание'
			},
			amount: {
				column: 'field3',
				title : 'Сумма'
			}
		},
		columns = [];

	const data = await readFile(file.path, "utf8");

	lines = data.split('\r\n');

	if (lines.length > 0) {

		// Проверка на наличие полей
		if (isHeaderRow(lines[0])) {
			fields = lines[0].split(divider);
			lines = lines.slice(1, lines.length - 1);
		}

		// Разбор строк
		const max = Math.max(...lines.map(line => line.split(divider).length));

		splitLines = lines.map((line, index) => {
			let data = line.split(divider);
			if (data.length < max) {
				for (let i = 0; i <= max - data.length; i++) {
					data.push('');
				}
			}
			return data;
		});

		// Преобразование данных
		records = splitLines.map((item, index) => {
			let result = {
				id    : index,
				record: []
			};

			for (let i = 0; i < item.length; i++) {
				result.record.push({field: 'field' + i, value: removeSpecSymbols(item[i])});
			}

			return result;
		});

		// Создание названий колонок
		for (let i = 0; i < max; i++) {
			columns.push({
				title    : 'Поле ' + i,
				dataIndex: 'field' + i,
				isCustom : false
			});
		}
	}

	result = {
		fields,
		records,
		defaultFields,
		columns
	};

	return result;
}

module.exports = {
	parseCsvFile,
	isDateField,
	isAmountField
};
