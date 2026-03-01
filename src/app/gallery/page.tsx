import type { Metadata } from "next"
import { GalleryContent } from "@/components/sections"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore the Astronomy Picture of the Day archive.",
  openGraph: {
    title: "Gallery",
    description: "Explore the Astronomy Picture of the Day archive.",
  },
}

export default function GalleryPage() {
  return (
    <section className="min-h-screen px-6 pt-28 pb-16 md:px-10 lg:px-16">
      <header className="mb-12">
        <h1 className="heading-lg text-text-primary">Gallery</h1>
        <p className="body-base mt-3 max-w-lg text-text-secondary">
          Browse the Astronomy Picture of the Day archive.
          Select a date range or discover something unexpected.
        </p>
      </header>

      <GalleryContent />
    </section>
  )
}
