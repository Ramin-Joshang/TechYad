import { Construction } from 'lucide-react';
export default function SecurityPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-[var(--neo-primary)]/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-black text-[var(--neo-text-main)] mb-2">امنیت و کنترل دسترسی پیشرفته</h1>
      <p className="text-[var(--neo-text-secondary)] max-w-md">این بخش در دست توسعه است.</p>
    </div>
  );
}
