import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Application Form",
  description: "Administrative access for Application Form management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
