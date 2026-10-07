'use client';

import React from 'react';

interface EnamadLogoProps {
  className?: string;
}

/**
 * Official Enamad (Electronic Trust Seal) Component for tecyad.ir
 * Uses the exact parameters provided by trustseal.enamad.ir
 */
export function EnamadLogo({ className = '' }: EnamadLogoProps) {
  return (
    <div
      className={`inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-[var(--neo-border)] shadow-xs hover:shadow-md hover:border-[var(--neo-primary)]/40 transition-all duration-300 group ${className}`}
      title="نماد اعتماد الکترونیکی تک‌یاد (اینماد)"
    >
      <a
        referrerPolicy="origin"
        target="_blank"
        rel="noopener noreferrer"
        href="https://trustseal.enamad.ir/?id=8094174&Code=PlK3MWEGHXQgZpPIDcCa6AbEfa9vAQ1g"
        className="flex items-center justify-center w-full h-full"
      >
        <img
          referrerPolicy="origin"
          src="https://trustseal.enamad.ir/logo.aspx?id=8094174&Code=PlK3MWEGHXQgZpPIDcCa6AbEfa9vAQ1g"
          alt="نماد اعتماد الکترونیکی تک‌یاد"
          style={{ cursor: 'pointer' }}
          // @ts-expect-error custom attribute required by enamad seal verification
          code="PlK3MWEGHXQgZpPIDcCa6AbEfa9vAQ1g"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </a>
    </div>
  );
}

export default EnamadLogo;
