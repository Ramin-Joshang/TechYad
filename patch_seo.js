const fs = require('fs');

const generateMetadataCode = (type) => `
export async function generateMetadata({ params }: { params: Promise<{ slug?: string, id?: string }> }) {
  const resolvedParams = await params;
  const identifier = resolvedParams.slug || resolvedParams.id;
  
  try {
    // In a real app we would fetch the actual data here to populate the metadata
    // For now, we will provide a generic but structured dynamic metadata
    return {
      title: \`\${identifier} | TechYad\`,
      description: \`اطلاعات کامل در مورد \${identifier} در تک‌یاد\`,
      openGraph: {
        title: \`\${identifier} | TechYad\`,
        description: \`اطلاعات کامل در مورد \${identifier} در تک‌یاد\`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: \`\${identifier} | TechYad\`,
        description: \`اطلاعات کامل در مورد \${identifier} در تک‌یاد\`,
      }
    };
  } catch(e) {
    return { title: 'TechYad' };
  }
}
`;

const filesToPatch = [
    'frontend/src/app/(public)/courses/[slug]/page.tsx',
    'frontend/src/app/(public)/classes/[slug]/page.tsx',
    'frontend/src/app/(public)/instructors/[id]/page.tsx',
    'frontend/src/app/(public)/blog/[slug]/page.tsx',
];

filesToPatch.forEach(file => {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/export const metadata = \{[\s\S]*?\};/g, generateMetadataCode('dynamic'));
        fs.writeFileSync(file, code);
    }
});
