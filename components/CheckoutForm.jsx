import { Fragment, useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Spinner from './Spinner'

function CheckoutForm({ displayAmount, clientSecret, handleOrderStates }) {
	const [succeeded, setSucceeded] = useState(false)
	const [error, setError] = useState(null)
	const [processing, setProcessing] = useState('')
	const [disabled, setDisabled] = useState(true)
	const [stripePayload, setStripePayload] = useState('')

	const stripe = useStripe()
	const elements = useElements()

	const cardStyle = {
		style: {
			base: {
				color: '#32325d',
				fontFamily: 'Arial, sans-serif',
				fontSmoothing: 'antialiased',
				fontSize: '14px',
				'::placeholder': {
					color: '#32325d',
				},
			},
			invalid: {
				color: '#fa755a',
				iconColor: '#fa755a',
			},
		},
	}

	const handleChange = async e => {
		// Listen for changes in the CardElement
		// and display any errors as the customer types their card details
		setDisabled(e.empty)
		setError(e.error ? e.error.message : '')
	}

	const handleSubmit = async e => {
		e.preventDefault()

		if (!clientSecret) return

		setProcessing(true)

		const payload = await stripe.confirmCardPayment(clientSecret, {
			payment_method: {
				card: elements.getElement(CardElement),
			},
		})

		if (payload.error) {
			setError(`Payment failed ${payload.error.message}`)
			setProcessing(false)
		} else {
			setStripePayload(payload)
			setError(null)
			setProcessing(false)
			setSucceeded(true)
			handleOrderStates('isOrderPlaced', true)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='w-4/5 sm:w-1/2 self-center mt-5'>
			<CardElement
				options={cardStyle}
				onChange={handleChange}
				className='rounded-t-md p-3 border border-indigo-900 border-opacity-10 max-h-11 w-full bg-white text-sm'
			/>

			<button
				disabled={processing || disabled || succeeded}
				className='bg-indigo-400 text-white rounded-b-md py-3 px-4 text-base font-semibold cursor-pointer inline-flex justify-center items-center transition-all duration-200 shadow-md w-full hover:filter hover:contrast-125 disabled:opacity-50 disabled:cursor-default'
			>
				{succeeded ? (
					'Payment successful ✔️'
				) : processing ? (
					<Spinner />
				) : (
					`Pagar ${displayAmount}`
				)}
			</button>

			{/* Show any error that happens when processing the payment */}
			{error && (
				<div className='text-gray-400 text-base mt-3 text-center' role='alert'>
					{error}
				</div>
			)}

			{/* Show a success message upon completion */}
			{succeeded && (
				<Fragment>
					<p className='text-gray-400 text-base mt-3 text-center'>
						Payment succeeded, see the result below or in your
						<a
							className='text-indigo-400 font-semibold'
							href='https://dashboard.stripe.com/test/payments'
							target='_blank'
						>
							{' '}
							Stripe dashboard
						</a>
					</p>
					<pre className='mt-3 h-48 p-3 w-full overflow-hidden overflow-y-scroll rounded-md shadow-md bg-black text-sm text-yellow-400 whitespace-pre-wrap break-all'>
						{JSON.stringify(stripePayload, null, 2)}
					</pre>
				</Fragment>
			)}
		</form>
	)
}

export default CheckoutForm
