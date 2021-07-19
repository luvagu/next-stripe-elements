import axios from 'axios'

export const fetchPostJSON = async (url, data) => {
	const res = await axios.post(url, data)
	return res.data
}
