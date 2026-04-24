import { cn } from "@/lib/utils"

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("dark:bg-white/5 bg-zinc-100 rounded-xl p-4 flex flex-col gap-4 my-4", className)}>
      {children}
    </div>
  )
}

export default Card
