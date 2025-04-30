/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        serverActions: {
          allowedOrigins: [
            'localhost:8080',
            'openaichatbotapp-dev.dev.britishcouncil.org'
          ]
        }
      }
};

export default nextConfig;
