export default function Loading() {
  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-8 animate-pulse rounded-full bg-accent/20" />
        <p className="label text-text-muted">Loading</p>
      </div>
    </section>
  )
}
