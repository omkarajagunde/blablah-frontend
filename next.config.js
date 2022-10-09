module.exports = {
	reactStrictMode: true,
	images: {
		domains: ["https://i.pinimg.com"],
		minimumCacheTTL: 23600
	},
	async headers() {
		return [
			{
				// This works, and returns appropriate Response headers:
				source: "/(.*).jpg",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=9999999, s-maxage=9999999, stale-while-revalidate=9999999"
					}
				]
			},
			{
				// This doesn't work for 'Cache-Control' key (works for others though):
				source: "/_next/image(.*)",
				headers: [
					{
						key: "Cache-Control",
						// Instead of this value:
						value: "public, max-age=9999999, s-maxage=9999999, stale-while-revalidate=9999999"
						// Cache-Control response header is `public, max-age=60` in production
						// and `public, max-age=0, must-revalidate` in development
					}
				]
			}
		];
	}
};
