import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQSection() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        <div className="space-y-6">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 px-3 py-1 text-sm font-medium">FAQ</Badge>
          <h2 className="text-4xl font-bold tracking-tight lg:text-5xl">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What is a food byproduct?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                --
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How does sustainabite works?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                --
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export {FAQSection}