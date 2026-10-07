import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';

  const itemListElement = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "خانه",
      "item": baseUrl,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 2,
      "name": item.label,
      "item": item.href ? (item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`) : undefined,
    })),
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="راهنمای مسیر (Breadcrumb)" className="w-full py-3 mb-4 select-none">
        <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
          <li className="flex items-center gap-1.5">
            <Link
              href="/"
              className="flex items-center gap-1 text-slate-500 hover:text-[var(--neo-primary)] transition"
              title="صفحه اصلی تک‌یاد"
            >
              <Home className="w-3.5 h-3.5" />
              <span>خانه</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                <ChevronLeft className="w-3 h-3 text-slate-400 shrink-0" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-[var(--neo-primary)] transition font-medium truncate max-w-[150px] sm:max-w-[200px]"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`truncate max-w-[200px] sm:max-w-[320px] ${
                      isLast ? 'text-slate-900 font-bold' : 'text-slate-600'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
