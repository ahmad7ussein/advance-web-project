"use client"

import { useState, useEffect } from "react"

export function Clock() {
  const [dateTime, setDateTime] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setDateTime(new Date())
    update()

    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!dateTime) return null // ✅ ما يعرضش إشي وقت السيرفر ريندر

  const formattedDate = dateTime.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const formattedTime = dateTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  return (
    <div className="text-sm text-gray-300 hidden sm:block">
      <div className="flex items-center gap-2">
        <span>{formattedDate}</span>
        <span>|</span>
        <span>{formattedTime}</span>
      </div>
    </div>
  )
}
