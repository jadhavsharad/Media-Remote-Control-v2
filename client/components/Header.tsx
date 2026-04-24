import { cn } from "@/lib/utils"

const Header = ({ title, className }: { title: string, className?: string }) => {
  return (
    <header className={cn("w-full text-center uppercase ", className)}>
      <h1 className="font-bold">{title}</h1>
    </header>
  )
}

export default Header
