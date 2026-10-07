import { InstructorProfileContainer } from '@/components/instructors/InstructorProfileContainer';
import { fetchInstructor } from '@/lib/server-api';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug?: string, id?: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const identifier = resolvedParams.slug || resolvedParams.id || '';
  const instructor = await fetchInstructor(identifier);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/instructors/${encodeURIComponent(identifier)}`;

  if (!instructor) {
    return {
      title: 'پروفایل استاد | تک‌یاد',
      description: 'رزومه، تخصص‌ها، دوره‌ها و کلاس‌های اساتید برجسته آموزشگاه آنلاین تک‌یاد.',
    };
  }

  const user = instructor.userId || instructor;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'استاد تک‌یاد';
  const specialty = instructor.specialty || user.specialty || 'مدرس برنامه‌نویسی و فناوری اطلاعات';
  const bio = instructor.bio || user.bio || `پروفایل و دوره‌های آموزشی استاد ${fullName} در پلتفرم تک‌یاد.`;
  const cleanBio = bio.replace(/<[^>]*>/g, '').slice(0, 160);
  const avatar = instructor.avatar || user.avatar || `${baseUrl}/images/instructor-default.jpg`;

  return {
    title: `استاد ${fullName} (${specialty}) | تک‌یاد`,
    description: cleanBio,
    keywords: [
      fullName,
      specialty,
      'استاد تک‌یاد',
      'مدرس آنلاین',
      'رزومه استاد',
      'دوره‌های استاد',
      'تک‌یاد',
      'Tecyad',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'profile',
      locale: 'fa_IR',
      url: pageUrl,
      title: `استاد ${fullName} | تک‌یاد`,
      description: cleanBio,
      siteName: 'تک‌یاد | Tecyad',
      images: [
        {
          url: avatar,
          width: 800,
          height: 800,
          alt: fullName,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `استاد ${fullName} | تک‌یاد`,
      description: cleanBio,
      images: [avatar],
    },
  };
}

export default async function InstructorProfilePage({ 
  params 
}: { 
  params: Promise<{ id?: string, slug?: string }> 
}) {
  const resolvedParams = await params;
  const identifier = resolvedParams.id || resolvedParams.slug || '';
  const instructor = await fetchInstructor(identifier);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/instructors/${encodeURIComponent(identifier)}`;

  const user = instructor?.userId || instructor;
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'استاد تک‌یاد';

  const personJsonLd = instructor ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "jobTitle": instructor.specialty || user?.specialty || "مدرس و برنامه‌نویس",
    "description": (instructor.bio || user?.bio || '').replace(/<[^>]*>/g, '').slice(0, 300),
    "image": instructor.avatar || user?.avatar,
    "url": pageUrl,
    "worksFor": {
      "@type": "EducationalOrganization",
      "name": "تک‌یاد | Tecyad",
      "url": "https://tecyad.ir"
    }
  } : null;

  return (
    <>
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      )}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: 'اساتید تک‌یاد', href: '/instructors' },
              { label: `استاد ${fullName}` },
            ]}
          />
        </div>
      </div>
      <InstructorProfileContainer id={identifier} initialData={instructor} />
    </>
  );
}
