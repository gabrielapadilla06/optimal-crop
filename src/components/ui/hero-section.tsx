"use client"

import { useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Particles } from "@/components/magicui/particles"

interface HeroSectionProps {
  title: string
  subtitle: string
  buttonText: string
  heroImage: string
}

export default function HeroSection({ title, subtitle, buttonText, heroImage }: HeroSectionProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="hero" className="relative mx-auto mt-16 max-w-7xl px-6 text-center md:px-8">
      {/* Particles Background */}
      <Particles className="absolute inset-0 -z-10" quantity={100} staticity={50} color="#000000" ease={50} />

      {/* Gradient Blur at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-[1]" />

      <div className="relative z-10">
        <h1 className="pt-8 py-6 text-5xl font-medium leading-none tracking-tighter text-gray-900 sm:text-6xl md:text-7xl lg:text-8xl">
          {title}
        </h1>
        <p className="pb-8 mb-20 text-balance text-lg tracking-tight text-gray-600 md:text-xl">{subtitle}</p>
        <div className="mt-12">
          <Image
            src={heroImage || "/placeholder.svg"}
            alt="Hero Image"
            width={260}
            height={260}
            className="mx-auto rounded-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export { HeroSection }