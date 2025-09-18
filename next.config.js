/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            }
        ],
    },
    // Optimize for Vercel deployment
    output: 'standalone',
    typescript: {
        // Allow production builds to successfully complete even if there are type errors
        ignoreBuildErrors: false,
    },
    eslint: {
        // Allow production builds to successfully complete even if there are ESLint errors
        ignoreDuringBuilds: false,
    },
    experimental: {
        // Enable modern bundling for better performance
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-accordion',
        ],
    }
};

if (process.env.NEXT_PUBLIC_TEMPO) {
    nextConfig.experimental = {
        ...nextConfig.experimental,
        // NextJS 13.4.8 up to 14.1.3:
        // swcPlugins: [[require.resolve("tempo-devtools/swc/0.86"), {}]],
        // NextJS 14.1.3 to 14.2.11:
        swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]]

        // NextJS 15+ (Not yet supported, coming soon)
    }
}

module.exports = nextConfig;