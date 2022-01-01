import axios from "axios";

var axiosInstance = axios.create({
	baseURL: process.env.SERVER_URL,
	headers: {
		"Content-Type": "application/json",
		"Content-Language": "browser",
	},
});

axiosInstance.interceptors.request.use(function (config) {
	const token = localStorage.getItem("token");
	config.headers.Authorization = token ? `${token}` : "";
	return config;
});

export default axiosInstance;
