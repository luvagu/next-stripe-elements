import Stripe from 'stripe'
import { CURRENCY, PAYMENT_METHODS } from '../../../config'
import { formatAmountForDisplay, formatAmountForStripe } from '../../../utils/stripe.helpers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
})

export default async function updatePaymentIntentHandler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method Not Allowed' })
	}

	try {
		const { paymentId, amount, customer, email, invoice, phone } = req.body

		// Update a current PaymentIntent ID's information
		const paymentIntent = await stripe.paymentIntents.update(paymentId, {
			// payment_method_types: PAYMENT_METHODS,
			amount: formatAmountForStripe(amount, CURRENCY),
			// currency: CURRENCY,
			// description: 'IMP online card payment',
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
