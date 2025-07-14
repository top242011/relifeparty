/** @type {import('next').NextConfig} */

// Extract the hostname from the Supabase URL environment variable
// Example: "https://abcdefg.supabase.co" -> "abcdefg.supabase.co"
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '';

const nextConfig = {
  images: {
    // Whitelist the Supabase storage hostname to allow Next.js <Image> component to load images from it.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**', // Allow all public images from storage
      },
      // You can add other trusted hostnames here as well.
      // For example, the placeholder service:
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

module.exports = nextConfig;
