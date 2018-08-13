const APIV2 = 'http://localhost:3001';

const config = {
	name     : 'Financ.io',
	apiPrefix: 'api',
	api      : {
		userLoginUrl             : `${APIV2}/login`,
		userLogoutUrl            : `${APIV2}/logout`,
		userSignUpUrl            : `${APIV2}/register`,
		statusUrl                : `${APIV2}/status`,
		menuUrl                  : `${APIV2}/menu`,
		profileUrl               : `${APIV2}/profile/:id`,
		settingsUrl              : `${APIV2}/settings/:id`,
		cardRestUrl              : `${APIV2}/card/:id`,
		cardUploadUrl            : `${APIV2}/card/:id/upload`,
		categoryRestUrl          : `${APIV2}/category/:id`,
		patternRestUrl           : `${APIV2}/pattern/:id`,
		patternByCatUrl          : `${APIV2}/category/:id/pattern`,
		patternAddToCategoryUrl  : `${APIV2}/add/category/pattern`,
		cardFileUrl              : `${APIV2}/card/:id/files`,
		cardFileOperationsUrl    : `${APIV2}/card/:id/files/:file_id`,
		uploadTransactionsUrl    : `${APIV2}/transaction/upload`,
		operationsRestUrl        : `${APIV2}/transaction/:id`,
		operationsRemoveUrl      : `${APIV2}/transactions/delete`,
		operationsSyncCategoryUrl: `${APIV2}/transactions/sync`,
		amountByCategoryUrl      : `${APIV2}/amounts-by-category`,
		categoriesAmountReportUrl: `${APIV2}/categories-amount-report`,
		cardsAmountReportUrl     : `${APIV2}/cards-amount-report`,
		checkCardsOperation      : `${APIV2}/card/operations/:id`,
		checkCategoryPatterns    : `${APIV2}/category/check/remove/:id`,
		checkEmailUrl            : `${APIV2}/check/email`,
		uploadAvatarUrl          : `${APIV2}/upload/avatar`,
		removeAvatarUrl          : `${APIV2}/remove/avatar`,
	},
};

export default config;
