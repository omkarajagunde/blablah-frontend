import axios from "axios";

var axiosInstance = axios.create({
	baseURL: process.env.SERVER_URL,
	headers: {
		"Content-Type": "application/json",
		"Content-Language": "browser",
	},
});

axiosInstance.interceptors.request.use(function (config) {
	config.headers.Authorization = window.tkn ? `Blabla-Bearer ${window.tkn }` : "";
	return config;
});

export default axiosInstance;
