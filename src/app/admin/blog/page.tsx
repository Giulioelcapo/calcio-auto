import type { Metadata } from "next";
import { BlogAdminApp } from "@/components/BlogAdminApp";

export const metadata: Metadata = {
  title: "Admin blog",
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return (
    <div className="py-2">
      <BlogAdminApp />
    </div>
  );
}
