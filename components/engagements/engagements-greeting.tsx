'use client'

function getGreeting(name: string | null): string {
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${timeGreeting}, ${name}` : timeGreeting
}

export function EngagementsGreeting({ displayName }: { displayName: string | null }) {
  return (
    <h1 className="text-xl font-semibold">{getGreeting(displayName)}</h1>
  )
}
