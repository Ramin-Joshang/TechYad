import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود و عضویت در تک یاد",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
