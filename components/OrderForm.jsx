import { Fragment, useEffect, useRef, useState } from 'react'
import { MIN_ORDER_AMOUNT } from '../config'
import { fetchPostJSON } from '../utils/api.helpers'

const Input = ({ id, label, extraClass = '', ...props }) => (
	<div>
		<label htmlFor={id} className='sr-only'>
			{label}
		</label>
		<input
			id={id}
			{...props}
			className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-75 ${extraClass}`}
		/>
	</div>
)

const Button = ({ extraClass = '', label, ...props }) => (
	<button
		{...props}
		className={`rounded-b-md py-3 px-4 text-base font-semibold cursor-pointer inline-flex justify-center items-center transition-all duration-200 shadow-md w-full hover:filter hover:contrast-125 disabled:opacity-50 disabled:cursor-default ${extraClass}`}
	>
		{label}
	</button>
)

function OrderForm({
	handleOrderSubmit,
	isSubmitted,
	wasSubmitted,
	handleOrderStates,
	isOrderPlaced,
	resetOrder,
}) {
	const [orderDetails, setOrderDetails] = useState({})
	const [paymentId, setPaymentId] = useState('')

	const orderFormRef = useRef()

	const handleChange = e => {
		if (paymentId) handleOrderSubmit(null)

		setOrderDetails(prevOrderDetails => ({
			...prevOrderDetails,
			[e.target.id]: e.target.value,
		}))
	}

	const handleClick = e => {
		handleOrderSubmit(null)
		handleOrderStates('isSubmitted', false)
	}

	const handleSubmit = async e => {
		e.preventDefault()

		try {
			let data

			if (paymentId) {
				data = await fetchPostJSON('/api/checkout/update-payment-intent', {
					paymentId,
					...orderDetails,
				})
			} else {
				data = await fetchPostJSON(
					'/api/checkout/create-payment-intent',
					orderDetails
				)
				setPaymentId(data.id)
			}

			handleOrderSubmit({
				displayAmount: data.displayAmount,
				clientSecret: data.clientSecret,
			})

			handleOrderStates('isSubmitted', true)
			handleOrderStates('wasSubmitted', true)
		} catch (error) {
			console.error(error.response)
		}
	}

	useEffect(() => {
		if (isOrderPlaced) {
			setOrderDetails({})
			setPaymentId('')
			orderFormRef.current.reset()
		}
	}, [isOrderPlaced])

	return (
		<Fragment>
			<form
				ref={orderFormRef}
				onSubmit={handleSubmit}
				className='w-4/5 sm:w-1/2 self-center'
			>
				<div className='rounded-md shadow-sm -space-y-px'>
					<Input
						id='invoice'
						label='Factura No.'
						extraClass='rounded-t-md'
						type='text'
						placeholder='Factura No.'
						required
						disabled={isSubmitted}
						onChange={handleChange}
					/>
					<Input
						id='customer'
						label='Cliente'
						type='text'
						placeholder='Cliente'
						required
						disabled={isSubmitted}
						onChange={handleChange}
					/>
					<Input
						id='email'
						label='Email'
						type='email'
						placeholder='Email'
						required
						disabled={isSubmitted}
						onChange={handleChange}
					/>
					<Input
						id='phone'
						label='Telefono'
						type='tel'
						placeholder='Telefono'
						required
						disabled={isSubmitted}
						onChange={handleChange}
					/>
					<Input
						id='amount'
						label='Total $'
						type='number'
						min={MIN_ORDER_AMOUNT}
						step='.01'
						placeholder='Total $'
						required
						disabled={isSubmitted}
						onChange={handleChange}
					/>
				</div>

				{!isSubmitted && (
					<div>
						<Button
							type='submit'
							label={wasSubmitted ? 'Actualizar Orden' : 'Crear Orden'}
							disabled={
								!orderDetails.invoice ||
								!orderDetails.customer ||
								!orderDetails.email ||
								!orderDetails.phone ||
								!orderDetails.amount ||
								Number(orderDetails.amount) < MIN_ORDER_AMOUNT
							}
							extraClass='bg-yellow-600 text-white'
						/>
					</div>
				)}
			</form>

			{isSubmitted && (
				<div className='w-4/5 sm:w-1/2 self-center'>
					{!isOrderPlaced ? (
						<Button
							extraClass='bg-gray-600 text-white'
							label='Editar Orden'
							type='button'
							onClick={handleClick}
						/>
					) : (
						<Button
							extraClass='bg-green-600 text-white'
							label='Realizar una Nueva Ordern'
							type='button'
							onClick={resetOrder}
						/>
					)}
				</div>
			)}
		</Fragment>
	)
}

export default OrderForm
