/**
 * Description of CheckableTags.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 04.07.18 18:55
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Tag} from 'antd';

const {CheckableTag} = Tag;


function CheckableTags({title, tags, selection, exclude, onCheck}) {

	const tagItems = tags.map(item => {
		const checked = (selection.indexOf(item.id) === -1 && exclude)
			|| (selection.indexOf(item.id) !== -1 && !exclude);

		const handleChange = (checked) => {
			if (onCheck) {
				onCheck(item, checked);
			}
		};

		return (
			<CheckableTag
				style={{marginTop: 2}}
				key={item.id}
				checked={checked}
				onChange={handleChange}>
				{item.name}
			</CheckableTag>
		)
	});

	return (
		<div>
			{title && <h4>{title}</h4>}
			{tagItems.length > 0 ? tagItems : (<p>Данные отсутствуют</p>)}
		</div>
	);
}

CheckableTags.defaultProps = {
	exclude: true
};

CheckableTags.propTypes = {
	tags     : PropTypes.arrayOf(PropTypes.shape({
		id   : PropTypes.number.isRequired,
		name : PropTypes.string.isRequired,
	})).isRequired,
	selection : PropTypes.arrayOf(PropTypes.number).isRequired,
	exclude   : PropTypes.bool.isRequired,
	title     : PropTypes.string,
	onCheck   : PropTypes.func
};

export default CheckableTags;
