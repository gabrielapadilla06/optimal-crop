"use client"

import { BentoGrid } from "@/components/ui/features"

export default function Home() {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        
        <div className="gap-10 p-4 py-10 sm:pb-4 md:flex md:justify-between">
          <BentoGrid />
        </div>
      </div>
    </>
  )
}

