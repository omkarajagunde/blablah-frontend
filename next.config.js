module.exports = {
	reactStrictMode: true,
	images: {
		domains: ["https://i.pinimg.com"],
		minimumCacheTTL: 23600
	},
	async headers() {
		return [
			{
				source: "/:all*(svg|jpg|png)",
				locale: false,
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=9999999999, must-revalidate"
					}
				]
			}
		];
	}
};
