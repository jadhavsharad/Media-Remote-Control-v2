import { cn } from "@/lib/utils"

const base = "p-4 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 duration-300 transform transition-all cursor-pointer"

interface IconButtonProps {
  label: string
  onClick?: () => void
  scale?: boolean
  className?: string
  children: React.ReactNode
}

const IconButton = ({ label, onClick, scale, className, children }: IconButtonProps) => {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(base, scale && "hover:scale-110", className)}
    >
      {children}
    </button>
  )
}

export default IconButton
