

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fdn2.gsmarena.com",
      },
      {
        protocol: "https",
        hostname: "fdn.gsmarena.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
