/**
 * Description of validation-example.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 17.05.18 11:56
 */

var validation_rules = checkSchema({
	company_name          : {
		errorMessage: 'Company Name should be at least 3 chars long and maximum of 50 chars',
		isLength    : {
			options: {min: 3, max: 50}
		},
		trim        : true
	},
	profile_name          : {
		errorMessage: 'Public Profile Name should be at least 3 chars long and maximum of 50 chars',
		isLength    : {
			options: {min: 3, max: 50}
		},
		trim        : true
	},
	description           : {
		errorMessage: 'Company Description should be at least 2 chars long and maximum of 200 chars',
		isLength    : {
			options: {min: 2, max: 200}
		},
		trim        : true
	},
	company_street_address: {
		errorMessage: 'Company Address should be at least 3 chars long and maximum of 100 chars',
		isLength    : {
			options: {min: 3, max: 100}
		},
		trim        : true
	},
	company_city          : {
		errorMessage: 'City should be at least 5 chars long and maximum of 50 chars',
		isLength    : {
			options: {min: 5, max: 50}
		},
		trim        : true
	},
	company_state         : {
		errorMessage: 'Please select state',
		matches     : {
			options     : [/^[0-9]+$/],
			errorMessage: "Please enter digits"
		},
		trim        : true
	},
	company_zip           : {
		errorMessage: 'Zip Code should be at least 4 chars long and maximum of 6 chars',
		isLength    : {
			options: {min: 4, max: 6}
		},
		trim        : true
	},
	first_name            : {
		errorMessage: 'First Name should be at least 3 chars long and maximum of 50 chars',
		isLength    : {
			options: {min: 3, max: 50}
		},
		trim        : true
	},
	last_name             : {
		errorMessage: 'Last Name should be at least 3 chars long and maximum of 50 chars',
		isLength    : {
			options: {min: 3, max: 50}
		},
		trim        : true
	},
	email                 : {
		errorMessage: 'Please enter a valid email address',
		isEmail     : true,
		trim        : true,
		custom      : {
			options     : (value) => {

				if (value) {
					return new Promise(function (resolve, reject) {

						dns_validate_email.validEmail(value, function (valid) {
							console.log('valid:' + valid);
							if (valid) {
								resolve(value)
							} else {
								reject(new Error({errorMessage: 'Not a valid email'}));
							}
						});

					}).then(function (email) {

						return new Promise(function (resolve, reject) {
							User.findBy('email', email, function (err, result) {
								if (err) {
									reject('Unable to validate email')
								} else {
									console.log(result);
									resolve(result);
								}

							});
						}).then(function (result) {
							return result.length === 0
						});


					})
				}

			},
			errorMessage: 'This email is already in use',
		}
	},
	phone                 : {
		errorMessage: 'Please enter Phone Number in 10 digits',
		isLength    : {
			options: {min: 10, max: 10}
		},
		matches     : {
			options     : [/^\d{10}$/],
			errorMessage: "Please enter digits"
		},
		trim        : true
	},
	street_address        : {
		errorMessage: 'Company Address should be at least 3 chars long and maximum of 100 chars',
		isLength    : {
			options: {min: 3, max: 100}
		},
		trim        : true
	},
	city                  : {
		errorMessage: 'City should be at least 5 chars long and maximum of 50 chars',
		isLength    : {
			options: {min: 5, max: 50}
		},
		trim        : true
	},
	state                 : {
		errorMessage: 'Please select state',
		matches     : {
			options     : [/^[0-9]+$/],
			errorMessage: "Please enter digits"
		},
		trim        : true
	},
	zip                   : {
		errorMessage: 'Zip Code should be at least 4 chars long and maximum of 6 chars',
		isLength    : {
			options: {min: 4, max: 6}
		},
		trim        : true
	},
	username              : {
		errorMessage: 'Please enter username',
		isLength    : {
			options     : {max: 25},
			errorMessage: 'Username should not be greater than 25 chars',
		},
		trim        : true,
		custom      : {
			options     : (value) => {
				console.log(value.length)
				if (value.length > 0) {
					return new Promise(function (resolve, reject) {

						User.findBy('username', value, function (err, record) {
							if (err) {
								reject('Error validating username');

							} else {
								console.log('--------' + record)
								resolve(record)
							}

						});

					}).then(function (result) {
						return result.length === 0;

					})
				}

			},
			errorMessage: 'This username is already in use',
		}
	},
	password              : {
		isLength: {
			errorMessage: 'Password should be at least 6 chars long',
			// Multiple options would be expressed as an array
			options     : {min: 6}
		}
	},
	confirm_password      : {
		errorMessage: 'Must have the same value as the password field',
		custom      : {
			options: (value, {req}) => value === req.body.password
		}
	},
	payment_mode          : {
		errorMessage: 'Please select payment option',
		isIn        : {
			options: [['Credit Card', 'Monthly Invoice']],
		}
	},
	// Wildcards/dots for nested fields work as well
	'card.number'         : {
		errorMessage: 'Please enter card number',
		custom      : {
			options     : (value, {req}) => {

				if (req.body.payment_mode === "Credit Card") {
					return /^[0-9]{12,19}$/.test(value);
				} else {
					return true;
				}

			},
			errorMessage: 'Card number must be of 12 and maximum of 19 digits',
		}
	},
	'card.type'           : {
		errorMessage: 'Please select card type',
		custom      : {
			options: (value, {req}) => (req.body.payment_mode === "Credit Card" && value == '') ? false : true,
		}
	},
	'card.exp_month'      : {
		errorMessage: 'Please select expiration month',
		custom      : {
			options: (value, {req}) => (req.body.payment_mode === "Credit Card" && value == '') ? false : true,
		},
		trim        : true
	},
	'card.exp_year'       : {
		errorMessage: 'Please select expiration year',
		custom      : {
			options: (value, {req}) => (req.body.payment_mode === "Credit Card" && value == '') ? false : true,
		},
		trim        : true
	},
	// Wildcards/dots for nested fields work as well
	'card.cvv'            : {
		errorMessage: 'Please enter card number',
		custom      : {
			options     : (value, {req}) => {

				if (req.body.payment_mode === "Credit Card") {
					return /^[0-9]{3,4}$/.test(value);
				} else {
					return true;
				}

			},
			errorMessage: 'Security code number must be of 3 and maximum of 4 digits',
		}
	}
});
