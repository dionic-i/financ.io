/**
 * Description of PeriodSelection.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 18.06.18 9:18
 */
import React from 'react';
import {DatePicker} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';

import QuickPeriodSwitcher from './QuickPeriodSwitcher';

const {RangePicker} = DatePicker;

function PeriodSelection({title, startDate, endDate, onSelect, quickProps}) {
	const defaultValue = [startDate, endDate];

	const ranges = {
		'Текущий месяц': [moment().startOf('month'), moment().endOf('month')],
		'Прошлый месяц': [moment().startOf('month').add(-1, 'month'), moment().startOf('month').add(-1, 'day')]
	};

	return (
		<div style={{display: 'inline-block'}}>
			<span>{title} : </span>
			<RangePicker
				allowClear={false}
				ranges={ranges}
				value={defaultValue}
				defaultValue={defaultValue}
				onChange={onSelect}
			/>
			{quickProps && <QuickPeriodSwitcher {...quickProps} />}
		</div>
	);
}

PeriodSelection.defaultProps = {
	title    : 'Период',
	startDate: moment().startOf('month'),
	endDate  : moment().endOf('month'),
	onSelect : () => {
	}
};

PeriodSelection.propTypes = {
	title     : PropTypes.string.isRequired,
	startDate : PropTypes.object.isRequired,
	endDate   : PropTypes.object.isRequired,
	onSelect  : PropTypes.func.isRequired,
	quickProps: PropTypes.shape({
		onNext   : PropTypes.func.isRequired,
		onPrev   : PropTypes.func.isRequired,
		onCurrent: PropTypes.func.isRequired
	})
};

export default PeriodSelection;
