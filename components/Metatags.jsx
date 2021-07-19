import Head from 'next/head'

function Metatags({
	desciption = 'IMP online card payment',
	title = 'IMP online card payment',
}) {
	return (
		<Head>
			<title>{title}</title>
			<meta charSet='UTF-8' />
			<meta name='viewport' content='width=device-width, initial-scale=1.0' />
			<meta name='description' content={desciption} />
		</Head>
	)
}

export default Metatags
