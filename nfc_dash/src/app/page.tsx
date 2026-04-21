import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, slug, category, latitude, longitude')
    .order('id')

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Supabase connection failed</h1>
        <pre>{error.message}</pre>
      </main>
    )
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Locations</h1>
      <ul className="space-y-2">
        {data?.map((location) => (
          <li key={location.id} className="border rounded p-3">
            <div><strong>{location.name}</strong></div>
            <div>Slug: {location.slug}</div>
            <div>Category: {location.category}</div>
            <div>
              Coordinates: {location.latitude}, {location.longitude}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}