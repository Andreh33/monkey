/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO crítico: el sitemap (revalidate cada hora) y las rutas del blog leen
  // `content/blog` con fs en runtime. Sin este include, Vercel no empaqueta esos
  // .md en las funciones serverless y el sitemap regenerado pierde los ~30 posts
  // (es exactamente lo que ocurre hoy en producción: el sitemap vivo no los lista).
  experimental: {
    outputFileTracingIncludes: {
      '/sitemap.xml': ['./content/blog/**/*'],
      '/blog': ['./content/blog/**/*'],
      '/blog/[slug]': ['./content/blog/**/*'],
      '/blog/categoria/[categoria]': ['./content/blog/**/*'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;
