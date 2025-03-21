"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, Droplet, SproutIcon as Seedling, Wheat, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { JSX } from "react"

interface IrrigationDay {
  date: Date
  isStartDay: boolean
  isHarvestDay: boolean
  needsIrrigation: boolean
}

interface IrrigationEvent {
  id: string
  plan_id: string
  event_date: string
  completed: boolean
  notes: string
  created_at: string
}

interface IrrigationCalendarProps {
  plan: IrrigationDay[]
  events?: IrrigationEvent[]
  onDayClick?: (date: Date) => void
}

export function IrrigationCalendar({ plan, events = [], onDayClick }: IrrigationCalendarProps) {
  const firstDay = plan[0]?.date || new Date()
  const [currentMonth, setCurrentMonth] = useState<Date>(firstDay)

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const getPlanForDay = (day: Date) => {
    return plan.find((p) => isSameDay(p.date, day))
  }

  const getEventForDay = (day: Date) => {
    return events.find((e) => isSameDay(new Date(e.event_date), day))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-medium text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          const planDay = getPlanForDay(day)
          const eventDay = getEventForDay(day)
          const isInPlan = !!planDay

          // Calculate the day of the week of the first day of the month
          const firstDayOfMonth = startOfMonth(currentMonth).getDay()

          // Add empty cells for days before the first day of the month
          if (i === 0) {
            const emptyCells = []
            for (let j = 0; j < firstDayOfMonth; j++) {
              emptyCells.push(<div key={`empty-${j}`} className="h-16 border rounded-md bg-muted/20"></div>)
            }
            // Fix: Use JSX.Element[] type and concat instead of spread for TypeScript
            const cells: JSX.Element[] = emptyCells.concat([
              <DayCell
                key={day.toString()}
                day={day}
                planDay={planDay}
                eventDay={eventDay}
                isInPlan={isInPlan}
                onClick={planDay?.needsIrrigation ? () => onDayClick?.(day) : undefined}
              />,
            ])
            return cells
          }

          return (
            <DayCell
              key={day.toString()}
              day={day}
              planDay={planDay}
              eventDay={eventDay}
              isInPlan={isInPlan}
              onClick={planDay?.needsIrrigation ? () => onDayClick?.(day) : undefined}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-4">
        <div className="flex items-center">
          <Seedling className="h-5 w-5 text-green-500 mr-1" />
          <span className="text-sm">Start Day</span>
        </div>
        <div className="flex items-center">
          <Wheat className="h-5 w-5 text-amber-500 mr-1" />
          <span className="text-sm">Harvest Day</span>
        </div>
        <div className="flex items-center">
          <Droplet className="h-5 w-5 text-blue-500 mr-1" />
          <span className="text-sm">Irrigation Day</span>
        </div>
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-600 mr-1" />
          <span className="text-sm">Completed</span>
        </div>
      </div>
    </div>
  )
}

interface DayCellProps {
  day: Date
  planDay: IrrigationDay | undefined
  eventDay: IrrigationEvent | undefined
  isInPlan: boolean
  onClick?: (() => void) | undefined
}

function DayCell({ day, planDay, eventDay, isInPlan, onClick }: DayCellProps) {
  const isIrrigationDay = planDay?.needsIrrigation
  const isCompleted = eventDay?.completed

  return (
    <div
      className={cn(
        "h-16 border rounded-md p-1 flex flex-col",
        isInPlan ? "bg-white" : "bg-muted/20",
        planDay?.isStartDay && "border-green-500 border-2",
        planDay?.isHarvestDay && "border-amber-500 border-2",
        isIrrigationDay && "cursor-pointer hover:bg-gray-50",
      )}
      onClick={onClick}
    >
      <span className="text-sm font-medium">{format(day, "d")}</span>
      {isInPlan && (
        <div className="flex flex-wrap gap-1 mt-auto justify-center">
          {planDay?.isStartDay && <Seedling className="h-4 w-4 text-green-500" />}
          {planDay?.isHarvestDay && <Wheat className="h-4 w-4 text-amber-500" />}
          {planDay?.needsIrrigation &&
            (isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Droplet className="h-4 w-4 text-blue-500" />
            ))}
        </div>
      )}
    </div>
  )
}

