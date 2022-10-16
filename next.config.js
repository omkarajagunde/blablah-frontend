module.exports = {
	reactStrictMode: true,
	images: {
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
						value: "public, max-age=23600, s-maxage=23600, stale-while-revalidate=23600"
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
						value: "public, max-age=23600, s-maxage=23600, stale-while-revalidate=23600"
						// Cache-Control response header is `public, max-age=60` in production
						// and `public, max-age=0, must-revalidate` in development
					}
				]
			}
		];
	}
};
