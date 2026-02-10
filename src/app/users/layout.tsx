import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Acesso",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function UsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
