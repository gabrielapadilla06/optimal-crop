'use client'

import { ArrowRightIcon, ChatBubbleIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"

import feature1Image from "@/images/feature1.png"
import feature2Image from "@/images/feature2.png"
import feature3Image from "@/images/feature3.png"
import { DropletIcon, LeafyGreenIcon } from "lucide-react"

interface BentoCardProps {
  name: string
  background: React.ReactNode
  Icon: React.ElementType
  href: string
  cta: string
}

const BentoCard = ({
  name,
  background,
  Icon,
  href,
  cta,
}: BentoCardProps) => (
  <div
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-xl",
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      "h-[400px]"
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-neutral-300" />
      <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
        {name}
      </h3>
    </div>

    <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
)

export default function BentoGrid() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row items-center gap-12">

        {/* Bento Card */}
        <div className="w-full lg:w-1/2">
          <BentoCard
            name="Optimal Crop Prediction"
            Icon={LeafyGreenIcon}
            href="/crop-prediction"
            cta="Predict"
            background={
              <img 
                src={feature1Image.src}
                alt="Optimal Crop Prediction"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            }
          />
        </div>

        {/* Bento Card */}
        <div className="w-full lg:w-1/2">
          <BentoCard
            name="Chat"
            Icon={ChatBubbleIcon}
            href="/chat"
            cta="Chat"
            background={
              <img 
                src={feature2Image.src}
                alt="Chat"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            }
          />
        </div>

        {/* Bento Card */}
        <div className="w-full lg:w-1/2">
          <BentoCard
            name="Irrigation Plan"
            Icon={DropletIcon}
            href="/irrigation"
            cta="Create plan"
            background={
              <img 
                src={feature3Image.src}
                alt="Irrigation"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            }
          />
        </div>
      </div>
    </div>
  )
}


function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export{ BentoGrid }