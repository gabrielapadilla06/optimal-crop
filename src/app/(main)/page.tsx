"use client"

import { TextBentoRight, StarIcon } from "@/components/ui/right-image"
import { TextBentoLeft, ClockIcon } from "@/components/ui/left-image"
import { HeroSection } from "@/components/ui/hero-section"
import { FAQSection } from "@/components/ui/faqs"  

import cristalesImage from "@/images/image.jpeg"
import pinguinoImage from "@/images/image.jpeg"

export default function Home() {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <HeroSection
          title="Sustainabite"
          subtitle="Creating the next generation of sustainable food"
          buttonText="Explore"
          heroImage={cristalesImage.src}
        />

        <div className="gap-10 p-4 py-10 sm:pb-4 md:flex md:justify-between">
          <TextBentoRight
            title="Sustainabite"
            subtitle="Meet"
            description="an AI-powered tool to reduce food byproduct waste by usign them in new formulations."
            buttonText="Learn More"
            buttonHref="/solution"
            bentoCard={{
              name: "Advanced Analytics",
              description: "Gain insights into your work patterns and optimize your performance.",
              backgroundSrc: pinguinoImage.src,
              Icon: StarIcon,
              href: "#",
              cta: "Explore Analytics",
            }}
            reversed={true}
          />
        </div>

        <div className="gap-4 p-4 sm:pb-4 md:flex md:justify-between">
          <TextBentoLeft
            bentoCard={{
              name: "Smart Time Blocking",
              description: "Automatically block time for focused work and personal activities.",
              backgroundSrc: pinguinoImage.src,
              Icon: ClockIcon,
              href: "#",
              cta: "Learn More",
            }}
            title="Did you know?"
            subtitle="Problem"
            description="Industrial food processing generates vast amounts of waste and by-products, often ranging between 30% to 60% by weight of the total production"
          />
        </div>

        <div className="gap-4 p-4 md:flex md:justify-between">
          <FAQSection />
        </div>
      </div>
    </>
  )
}

