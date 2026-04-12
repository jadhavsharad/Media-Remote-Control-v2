"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BsFillHouseDoorFill } from "react-icons/bs"
import { IoGrid, IoLayers, IoSettings } from "react-icons/io5"


const items = [
  { icon: <BsFillHouseDoorFill />, label: "Home", href: "/" },
  { icon: <IoLayers />, label: "Active Tabs", href: "/tabs" },
  { icon: <IoGrid />, label: "Quick Launch", href: "/quick-launch" },
  { icon: <IoSettings />, label: "Settings", href: "/settings" },
]

const Navigation = ({ className }: { className?: string }) => {
  const pathname = usePathname()
  return (
    <div className={cn("w-fit border border-white/10  p-2 rounded-full   bg-linear-0  to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 z-50", className)}>
      <nav className="flex items-center gap-1 text-lg">
        {items.map((item, index) => (
          <Link key={index} href={item.href} className={`${pathname === item.href ? "text-sky-500 bg-zinc-200 dark:bg-white/10" : ""} hover:text-sky-500 hover:bg-zinc-200  dark:hover:bg-white/10 hover:scale-110 px-6 py-3 rounded-full duration-300 transform transition-all`} title={item.label} aria-label={item.label}>
            {item.icon}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Navigation
