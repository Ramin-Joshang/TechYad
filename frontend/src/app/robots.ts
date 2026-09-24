import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/student/',
        '/instructor/',
        '/admin/',
        '/super-admin/',
        '/payment/',
        '/checkout',
        '/cart',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
