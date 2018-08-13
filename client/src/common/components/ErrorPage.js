import React from 'react';
import {aCenter} from '../../theme/src/common.module.less';
import {Link} from 'react-router-dom';


function ErrorPage() {
	return (
		<div>
			<div className={aCenter}>
				<h1>Ошибка 404</h1>
				<p>Возможно Вы ввели неправильный адрес.</p>
				<Link to="/">На главную</Link>
			</div>
		</div>
	);
}

export default ErrorPage;
