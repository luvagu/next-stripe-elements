import Stripe from 'stripe'
import { CURRENCY, PAYMENT_METHODS } from '../../../config'
import { formatAmountForDisplay, formatAmountForStripe } from '../../../utils/stripe.helpers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
})

export default async function createPaymentIntentHandler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method Not Allowed' })
	}

	try {
		const { amount, customer, email, invoice, phone } = req.body

		// Create a PaymentIntent with the order amount, currency and any additional information
		const paymentIntent = await stripe.paymentIntents.create({
			payment_method_types: PAYMENT_METHODS,
			amount: formatAmountForStripe(amount, CURRENCY),
			currency: CURRENCY,
			description: 'IMP online card payment',
			metadata: {
				invoice,
				customer,
				email,
				phone,
			},
		})

		res.status(200).json({
			id: paymentIntent.id,
			clientSecret: paymentIntent.client_secret,
			displayAmount: formatAmountForDisplay(amount, CURRENCY),
		})
	} catch (error) {
		console.log(error.message)
		res.status(500).json(error)
	}
}
