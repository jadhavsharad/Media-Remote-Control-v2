import { cn } from "@/lib/utils"

const spacing: Record<string, string> = {
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
  xl: "my-8",
}

const Divider = ({ line, size = "md" }: { line?: boolean, size?: "sm" | "md" | "lg" | "xl" }) => {
  if (line) return <div className="w-full rounded-full h-px bg-zinc-200 dark:bg-white/20" />
  return <div className={cn(spacing[size])} />
}

export default Divider