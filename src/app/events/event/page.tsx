import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evento",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EventsPage() {
  return <div>Events Page</div>;
}
