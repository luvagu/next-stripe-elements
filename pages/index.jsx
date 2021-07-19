import { useState } from 'react'
import getStripe from '../utils/getStripe'
import { Elements } from '@stripe/react-stripe-js'
import Metatags from '../components/Metatags'
import CheckoutForm from '../components/CheckoutForm'
import OrderForm from '../components/OrderForm'

function Home() {
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [wasSubmitted, setWasSubmitted] = useState(false)
	const [secretAndAmount, setSecretAndAmount] = useState(null)
	const [isOrderPlaced, setIsOrderPlaced] = useState(false)

	const handleOrderSubmit = data => setSecretAndAmount(data)

	const handleOrderStates = (type, data) => {
		switch (type) {
			case 'isSubmitted':
				setIsSubmitted(data)
				break
			case 'wasSubmitted':
				setWasSubmitted(data)
				break
			case 'isOrderPlaced':
				setIsOrderPlaced(data)
			default:
				return
		}
	}

	const resetOrder = () => {
		setIsSubmitted(false)
		setWasSubmitted(false)
		setSecretAndAmount(null)
		setIsOrderPlaced(false)
	}

	return (
		<div className='flex flex-col justify-center items-center w-screen h-full'>
			<Metatags />
			<Elements stripe={getStripe()}>
				<OrderForm
					handleOrderSubmit={handleOrderSubmit}
					isSubmitted={isSubmitted}
					wasSubmitted={wasSubmitted}
					isOrderPlaced={isOrderPlaced}
					handleOrderStates={handleOrderStates}
					resetOrder={resetOrder}
				/>
				{secretAndAmount && (
					<CheckoutForm
						displayAmount={secretAndAmount.displayAmount}
						clientSecret={secretAndAmount.clientSecret}
						handleOrderStates={handleOrderStates}
					/>
				)}
			</Elements>
		</div>
	)
}

export default Home
