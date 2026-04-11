"use client"

import { usePathname } from "next/navigation"
import { BsFillHouseDoorFill } from "react-icons/bs"
import { IoGrid, IoLayers, IoSettings } from "react-icons/io5"

const items = [
  { icon: <BsFillHouseDoorFill />, label: "Home", href: "/" },
  { icon: <IoLayers />, label: "Active Tabs", href: "/active-tabs" },
  { icon: <IoGrid />, label: "Quick Launch", href: "/quick-launch" },
  { icon: <IoSettings />, label: "Settings", href: "/Settings" },
]

const Navigation = () => {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1 text-lg">
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className={`${pathname === item.href ? "text-sky-500 bg-zinc-200 dark:bg-white/10" : ""} hover:text-sky-500 hover:bg-zinc-200 dark:hover:bg-white/10 hover:-translate-y-1 hover:scale-110 px-6 py-3 rounded-full duration-300 transform transition-all`}
          title={item.label}
          aria-label={item.label}
        >
          {item.icon}
        </a>
      ))}
    </nav>
  )
}

export default Navigation
