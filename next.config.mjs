/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com"
            },
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com"
            },
            {
                protocol: "https",
                hostname: "*.blob.vercel-storage.com"
            },
            {
                protocol: "https",
                hostname: "placekitten.com"
            }
        ]
        
    }
};

export default nextConfig;


