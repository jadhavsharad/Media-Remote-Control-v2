import { cn } from "@/lib/utils"

const base = "p-4 flex item-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 duration-300 transform transition-all cursor-pointer active:scale-95"

interface IconButtonProps {
  label: string
  onClick?: () => void
  scale?: boolean
  className?: string
  disabled?: boolean
  children: React.ReactNode
}

const IconButton = ({ label, onClick, scale, className, disabled, children }: IconButtonProps) => {
  return (
    <button disabled={disabled} aria-label={label} title={label} onClick={onClick} className={cn(base, scale && "active:scale-125 ", disabled && "opacity-50 cursor-not-allowed", className)}>
      {children}
    </button>
  )
}

export default IconButton
