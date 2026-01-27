/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'assets.coingecko.com',
            'coin-images.coingecko.com',
            'www.coingecko.com'
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
