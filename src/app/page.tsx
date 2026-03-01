import { fetchApodToday } from "@/lib/api/apod"
import { ApodHero } from "@/components/sections"

export default async function HomePage() {
  const apod = await fetchApodToday().catch(() => null)

  if (!apod) {
    return (
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="heading-lg text-text-primary">Unavailable</h1>
          <p className="body-base mt-3 text-text-secondary">
            Could not load today&apos;s Astronomy Picture of the Day.
            Please try again later.
          </p>
        </div>
      </section>
    )
  }

  return <ApodHero apod={apod} />
}
