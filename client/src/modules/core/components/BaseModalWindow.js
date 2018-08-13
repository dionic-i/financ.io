import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Icon, Button} from 'antd';


class BaseModalWindow extends Component {

	render() {
		let me = this,
			children;

		const form = me.props.children;

		if (form) {
			children = React.cloneElement(form, {
				wrappedComponentRef: (formRef) => {
					me.formRef = formRef;
				}
			});
		}

		return (
			<Modal
				title={me.props.title}
				wrapClassName="vertical-center-modal"
				visible={me.props.isVisible}
				footer={me.renderFooter()}
				closable={false}
			>
				{children}
			</Modal>
		);
	}

	renderFooter = () => {
		let me = this;
		return (
			<div>
				<Button type="primary" onClick={me.doSave} style={{float: 'left'}}>
					<Icon type="save"/>Сохранить
				</Button>
				<Button type="default" onClick={me.doCancel}>
					Закрыть<Icon type="close"/>
				</Button>
			</div>
		)
	};

	doSave = () => {
		let me = this;
		const {form} = me.formRef.props;
		form.validateFields((err, values) => {
			if (!err) {
				if (me.props.onSave) {
					me.props.onSave(values);
				}
			}
		});
	};

	doCancel = () => {
		let me = this;
		const {form} = me.formRef.props;
		if (me.props.onCancel) {
			me.props.onCancel();
		}
		form.resetFields();
	};

}

BaseModalWindow.propTypes = {
	title    : PropTypes.string.isRequired,
	isVisible: PropTypes.bool,
	onSave   : PropTypes.func,
	onCancel : PropTypes.func,
};

export default BaseModalWindow;
