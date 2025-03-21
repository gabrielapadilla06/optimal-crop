"use client"

import { TextBentoRight, StarIcon } from "@/components/ui/right-image"
import { TextBentoLeft, ClockIcon } from "@/components/ui/left-image"
import { HeroSection } from "@/components/ui/hero-section"

import heroImage from "@/images/image.jpeg"
import feature1Image from "@/images/feature1.png"
import feature2Image from "@/images/feature2.png"
import feature3Image from "@/images/feature3.png"

export default function Home() {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <HeroSection
          title="Crop AI"
          subtitle="Smart crop planning and care with AI"
          buttonText="Explore"
          heroImage={heroImage.src}
        />

        <div className="gap-10 p-4 py-10 sm:pb-4 md:flex md:justify-between">
          <TextBentoRight
            title="Optimal Crop Prediction"
            subtitle="Feature 1"
            description="Predict the optimal crop, from 22 possible crops, based on weather and soil parameters"
            bentoCard={{
              name: "Optimal Crop Prediction",
              description: "Predict the optimal crop, from 22 possible crops, based on weather and soil parameters",
              backgroundSrc: feature1Image.src,
              Icon: StarIcon,
              href: "#",
              cta: "Feature 1",
            }}
            reversed={true}
          />
        </div>

        <div className="gap-4 p-4 sm:pb-4 md:flex md:justify-between">
          <TextBentoLeft
            bentoCard={{
              name: "Chat",
              description: "Ask any question to an AI and learn everything you need to take care of your crops.",
              backgroundSrc: feature2Image.src,
              Icon: ClockIcon,
              href: "#",
              cta: "Feature 2",
            }}
            title="Chat"
            subtitle="Feature 2"
            description="Ask any question to an AI and learn everything you need to take care of your crops."
          />
        </div>

        <div className="gap-4 p-4 md:flex md:justify-between">
          <TextBentoRight
            title="Irrigation plan"
            subtitle="Feature 3"
            description="Create an irrigation plan based on the specific needs of your crops."
            bentoCard={{
              name: "Irrigation plan",
              description: "Gain insights into your work patterns and optimize your performance.",
              backgroundSrc: feature3Image.src,
              Icon: StarIcon,
              href: "#",
              cta: "Feature 3",
            }}
            reversed={true}
          />
        </div>
      </div>
    </>
  )
}

