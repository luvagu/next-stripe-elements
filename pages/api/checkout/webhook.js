import { buffer } from 'micro'
import Cors from 'micro-cors'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Stripe requires the raw body to construct the event.
export const config = {
	api: {
		bodyParser: false,
	},
}

const cors = Cors({
	allowMethods: ['POST', 'HEAD'],
})

const webhookHandler = async (req, res) => {
	if (req.method === 'POST') {
		const buf = await buffer(req)
		const sig = req.headers['stripe-signature']

		let event

		try {
			event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
		} catch (err) {
			// On error, log and return the error message.
			console.log(`❌ Error message: ${err.message}`)
			res.status(400).send(`Webhook Error: ${err.message}`)
			return
		}

		// Successfully constructed event.
		console.log('✅ Success:', event.id)

		let paymentIntent

		// Handle the event
		switch (event.type) {
			case 'payment_intent.succeeded':
				paymentIntent = event.data.object
				console.log(`💰 PaymentIntent successful: ${paymentIntent.status}`)
				break
			case 'payment_intent.created':
				paymentIntent = event.data.object
				console.log(`👍 PaymentIntent created: ${paymentIntent.status}`)
				break
			case 'payment_intent.payment_failed':
				paymentIntent = event.data.object
				console.log(
					`❌ PaymentIntent failed: ${paymentIntent.last_payment_error?.message}`
				)
				break
			case 'charge.succeeded':
				paymentIntent = event.data.object
				console.log(`💵 Charge succeeded with id: ${paymentIntent.id}`)
				break
			default:
				console.warn(`Unhandled event type ${event.type}`)
		}

		// Return a response to acknowledge receipt of the event.
		res.json({ received: true })
	} else {
		res.setHeader('Allow', 'POST')
		res.status(405).end('Method Not Allowed')
	}
}

export default cors(webhookHandler)
