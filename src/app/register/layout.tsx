import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cadastro",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
