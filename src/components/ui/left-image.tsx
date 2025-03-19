'use client'

import Image from 'next/image'

interface BentoCardProps {
  name: string
  description: string
  backgroundSrc: string
  Icon: React.ElementType
  href: string
  cta: string
}

const BentoCard = ({
  name,
  backgroundSrc,
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
    <Image 
      src={backgroundSrc || "/placeholder.svg"}
      alt={name}
      layout="fill"
      objectFit="cover"
      className="absolute inset-0 w-full h-full opacity-60"
    />
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
)

interface TextBentoProblemProps {
  bentoCard: BentoCardProps
  title: string
  subtitle: string
  description: string
  reversed?: boolean
}

export default function TextBentoLeft({
  bentoCard,
  title,
  subtitle,
  description,
  reversed = false
}: TextBentoProblemProps) {
  const TextContent = () => (
    <div className="w-full lg:w-1/2 space-y-6">
      <div className="space-y-4">
        <p className="text-sm font-medium text-purple-600">{subtitle}</p>
        <h1 className="text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className={`flex flex-col lg:flex-row items-center gap-12 ${reversed ? 'lg:flex-row-reverse' : ''}`}>
        <div className="w-full lg:w-1/2">
          <BentoCard {...bentoCard} />
        </div>
        <TextContent />
      </div>
    </div>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export { TextBentoLeft, ClockIcon }