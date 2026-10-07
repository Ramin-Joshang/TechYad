import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'تک‌یاد | پلتفرم جامع آموزش آنلاین',
    short_name: 'تک‌یاد',
    description: 'مرجع تخصصی دوره‌ها و کلاس‌های آنلاین و مهارتی برنامه‌نویسی و هوش مصنوعی',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F5FF',
    theme_color: '#6D4AFF',
    icons: [
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
