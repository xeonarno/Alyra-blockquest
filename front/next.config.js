/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false
            }
        }else {
            config.externals.push("pino-pretty", "lokijs", "encoding")        
        }

        return config;
    }
}

module.exports = nextConfig
