type TypeBadgeProps = {
  category: string | null | undefined
}

const categoryClassMap: Record<string, string> = {
  frontend: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  fuel_processing: 'bg-amber-100 text-amber-800 border-amber-200',
  reactor: 'bg-sky-100 text-sky-800 border-sky-200',
  backend: 'bg-rose-100 text-rose-800 border-rose-200',
  uncategorized: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function TypeBadge({ category }: TypeBadgeProps) {
  const key = category ?? 'uncategorized'
  const classes = categoryClassMap[key] ?? categoryClassMap.uncategorized

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {key.replace(/_/g, ' ')}
    </span>
  )
}
