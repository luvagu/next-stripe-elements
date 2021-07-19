import { DEFAULT_LOCALE } from '../config'

export function calculateOrderAmount(items) {
	// Replace this constant with a calculation of the order's amount
	// Calculate the order total on the server to prevent
	// people from directly manipulating the amount on the client

	return 14.99
}

export function formatAmountForDisplay(amount, currency) {
	const numberFormat = new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: 'currency',
		currency: currency,
		currencyDisplay: 'symbol',
	})

	return numberFormat.format(amount)
}

export function formatAmountForStripe(amount, currency) {
	const numberFormat = new Intl.NumberFormat(DEFAULT_LOCALE, {
		style: 'currency',
		currency: currency,
		currencyDisplay: 'symbol',
	})

	const parts = numberFormat.formatToParts(amount)

	let zeroDecimalCurrency = true

	for (let part of parts) {
		if (part.type === 'decimal') {
			zeroDecimalCurrency = false
		}
	}
  
	return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}
