import { ArrowUpRight } from 'lucide-react'

export function Banner() {
  return (
    <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-300">
      <span>Coming Soon 🌲</span>
      <a href="#" className="flex items-center gap-1 text-white hover:opacity-80 transition-opacity">
        Kino for Enterprise
        <ArrowUpRight className="w-4 h-4" />
      </a>
    </div>
  )
}