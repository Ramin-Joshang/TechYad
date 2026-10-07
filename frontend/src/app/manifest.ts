import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'تک‌یاد | پلتفرم جامع آموزش آنلاین',
    short_name: 'تک‌یاد',
    description: 'مرجع تخصصی دوره‌ها و کلاس‌های آنلاین و مهارتی برنامه‌نویسی و هوش مصنوعی',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0284c7',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
