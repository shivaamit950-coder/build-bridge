/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Security headers — sent on every response, protects against common
  // browser-based attacks (clickjacking, MIME sniffing, XSS via reflected content).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" }, // stops the app being embedded in a hidden iframe elsewhere (clickjacking)
          { key: "X-Content-Type-Options", value: "nosniff" }, // stops browsers guessing file types in a way attackers can exploit
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // limits what's leaked in the Referer header
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" }, // only this app's own pages can request camera/mic/location, no embedded third party can
        ],
      },
    ];
  },
};

module.exports = nextConfig;
