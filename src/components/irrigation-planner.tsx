"use client"

import { useState, useEffect } from "react"
import { addDays, differenceInDays, format, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { IrrigationCalendar } from "@/components/ui/irrigation-calendar"
import { DatePicker } from "@/components/ui/date-picker"
import { toast } from "sonner"
import { useAuth, useUser, useSession } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, CircleIcon } from "lucide-react"

// Define a type for irrigation schedule
type IrrigationFrequency = number | "rare"

interface IrrigationSchedule {
  summer: IrrigationFrequency
  winter: IrrigationFrequency
}

interface Crop {
  id: string
  name: string
  growthDays: number
  irrigationSchedule: IrrigationSchedule
}

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

// Crop data with irrigation requirements
const crops: Crop[] = [
  // Grains
  {
    id: "rice",
    name: "Rice",
    growthDays: 120, // Typical growth period for rice
    irrigationSchedule: {
      summer: 1, // Daily irrigation to maintain shallow flooding
      winter: 1, // Daily irrigation to maintain shallow flooding
    },
  },
  {
    id: "maize",
    name: "Maize",
    growthDays: 90, // Typical growth period for maize
    irrigationSchedule: {
      summer: 10, // Every 10 days in summer
      winter: 10, // Every 10 days in winter
    },
  },

  // Beans and Legumes
  {
    id: "chickpea",
    name: "Chickpea",
    growthDays: 110, // Typical growth period for chickpea
    irrigationSchedule: {
      summer: 15, // Minimal irrigation; one or two irrigations during flowering and pod development
      winter: 15, // Minimal irrigation; one or two irrigations during flowering and pod development
    },
  },
  {
    id: "kidneybeans",
    name: "Kidney Beans",
    growthDays: 95, // Typical growth period for kidney beans
    irrigationSchedule: {
      summer: 10, // Every 10 days during flowering and pod development
      winter: 10, // Every 10 days during flowering and pod development
    },
  },
  {
    id: "pigeonpeas",
    name: "Pigeon Peas",
    growthDays: 150, // Typical growth period for pigeon peas
    irrigationSchedule: {
      summer: 20, // Every 20 days during flowering and pod filling if rainfall is insufficient
      winter: 20, // Every 20 days during flowering and pod filling if rainfall is insufficient
    },
  },
  {
    id: "mothbeans",
    name: "Moth Beans",
    growthDays: 75, // Typical growth period for moth beans
    irrigationSchedule: {
      summer: "rare", // Highly drought-tolerant; supplemental irrigation is rarely needed
      winter: "rare", // Highly drought-tolerant; supplemental irrigation is rarely needed
    },
  },
  {
    id: "mungbean",
    name: "Mung Bean",
    growthDays: 70, // Typical growth period for mung bean
    irrigationSchedule: {
      summer: 12, // Every 12 days during flowering and pod filling
      winter: 12, // Every 12 days during flowering and pod filling
    },
  },
  {
    id: "blackgram",
    name: "Black Gram",
    growthDays: 90, // Typical growth period for black gram
    irrigationSchedule: {
      summer: 12, // Every 12 days during flowering and pod development
      winter: 12, // Every 12 days during flowering and pod development
    },
  },
  {
    id: "lentil",
    name: "Lentil",
    growthDays: 110, // Typical growth period for lentil
    irrigationSchedule: {
      summer: 15, // Minimal irrigation; one or two irrigations during flowering and pod filling
      winter: 15, // Minimal irrigation; one or two irrigations during flowering and pod filling
    },
  },

  // Fruits
  {
    id: "pomegranate",
    name: "Pomegranate",
    growthDays: 180, // Typical growth period for pomegranate
    irrigationSchedule: {
      summer: 10, // Every 10 days during dry periods
      winter: 10, // Every 10 days during dry periods
    },
  },
  {
    id: "banana",
    name: "Banana",
    growthDays: 365, // Typical growth period for banana
    irrigationSchedule: {
      summer: 4, // Every 4 days to maintain consistent soil moisture
      winter: 4, // Every 4 days to maintain consistent soil moisture
    },
  },
  {
    id: "mango",
    name: "Mango",
    growthDays: 150, // Typical growth period for mango
    irrigationSchedule: {
      summer: 15, // Every 15 days during flowering and fruit development
      winter: 15, // Every 15 days during flowering and fruit development
    },
  },
  {
    id: "grapes",
    name: "Grapes",
    growthDays: 165, // Typical growth period for grapes
    irrigationSchedule: {
      summer: 10, // Every 10 days during berry development
      winter: 10, // Every 10 days during berry development
    },
  },
  {
    id: "watermelon",
    name: "Watermelon",
    growthDays: 85, // Typical growth period for watermelon
    irrigationSchedule: {
      summer: 7, // Every 7 days during flowering and fruit development
      winter: 7, // Every 7 days during flowering and fruit development
    },
  },
  {
    id: "muskmelon",
    name: "Muskmelon",
    growthDays: 80, // Typical growth period for muskmelon
    irrigationSchedule: {
      summer: 7, // Every 7 days during flowering and fruit development
      winter: 7, // Every 7 days during flowering and fruit development
    },
  },
  {
    id: "apple",
    name: "Apple",
    growthDays: 150, // Typical growth period for apple
    irrigationSchedule: {
      summer: 14, // Every 14 days during dry periods, especially during fruit development
      winter: 14, // Every 14 days during dry periods, especially during fruit development
    },
  },
  {
    id: "orange",
    name: "Orange",
    growthDays: 180, // Typical growth period for orange
    irrigationSchedule: {
      summer: 14, // Every 14 days during dry periods, especially during flowering and fruit development
      winter: 14, // Every 14 days during dry periods, especially during flowering and fruit development
    },
  },
  {
    id: "papaya",
    name: "Papaya",
    growthDays: 330, // Typical growth period for papaya
    irrigationSchedule: {
      summer: 10, // Every 10 days to maintain consistent soil moisture
      winter: 10, // Every 10 days to maintain consistent soil moisture
    },
  },
  {
    id: "coconut",
    name: "Coconut",
    growthDays: 365, // Typical growth period for coconut
    irrigationSchedule: {
      summer: 20, // Every 20 days during dry periods
      winter: 20, // Every 20 days during dry periods
    },
  },
  // Commercial Crops
  {
    id: "cotton",
    name: "Cotton",
    growthDays: 150, // Typical growth period for cotton
    irrigationSchedule: {
      summer: 7, // Every 7 days during peak water demand periods
      winter: 14, // Every 14 days during cooler periods
    },
  },
  {
    id: "jute",
    name: "Jute",
    growthDays: 120, // Typical growth period for jute
    irrigationSchedule: {
      summer: 7, // Every 7 days during dry periods
      winter: 14, // Every 14 days during cooler periods
    },
  },
  {
    id: "coffee",
    name: "Coffee",
    growthDays: 365, // Coffee plants are perennial
    irrigationSchedule: {
      summer: 14, // Every 14 days during dry periods
      winter: 30, // Every 30 days during cooler periods
    },
  },
]

// Helper function to determine if a date is in summer (simplified)
const isSummer = (date: Date) => {
  const month = date.getMonth()
  // Consider April through September as summer (Northern Hemisphere)
  return month >= 3 && month <= 8
}

export function IrrigationPlanner() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { session } = useSession()

  const [selectedCrop, setSelectedCrop] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [irrigationPlan, setIrrigationPlan] = useState<IrrigationDay[]>([])
  const [planId, setPlanId] = useState<string | null>(null)
  const [savedPlans, setSavedPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [irrigationEvents, setIrrigationEvents] = useState<IrrigationEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventCompleted, setEventCompleted] = useState(false)
  const [eventNotes, setEventNotes] = useState("")

  // Initialize Supabase client with Clerk authentication
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await session?.getToken({
          template: "supabase",
        })
        const headers = new Headers(options?.headers)
        headers.set("Authorization", `Bearer ${clerkToken}`)
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })

  // Fetch saved plans when component mounts
  useEffect(() => {
    if (isSignedIn && user) {
      fetchSavedPlans()
    }
  }, [isSignedIn, user])

  // Fetch irrigation events when plan ID changes
  useEffect(() => {
    if (planId) {
      fetchIrrigationEvents(planId)
    } else {
      setIrrigationEvents([])
    }
  }, [planId])

  const fetchSavedPlans = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("irrigation_plans")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setSavedPlans(data || [])
    } catch (error) {
      console.error("Error fetching saved plans:", error)
      toast.error("Failed to load saved plans")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchIrrigationEvents = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from("irrigation_events")
        .select("*")
        .eq("plan_id", planId)
        .order("event_date", { ascending: true })

      if (error) throw error

      setIrrigationEvents(data || [])
    } catch (error) {
      console.error("Error fetching irrigation events:", error)
      toast.error("Failed to load irrigation events")
    }
  }

  const generateIrrigationPlan = () => {
    if (!selectedCrop || !startDate) {
      toast.error("Missing information", {
        description: "Please select a crop and start date",
      })
      return
    }

    const crop = crops.find((c) => c.id === selectedCrop)
    if (!crop) return

    const plan = []
    const harvestDate = addDays(startDate, crop.growthDays)

    // Generate plan for each day from start to harvest
    let currentDate = new Date(startDate)
    let dayCount = 0

    while (differenceInDays(harvestDate, currentDate) >= 0) {
      const season = isSummer(currentDate) ? "summer" : "winter"
      const irrigationFrequency = crop.irrigationSchedule[season]

      // Handle the case where irrigationFrequency is "rare"
      let needsIrrigation = dayCount % (irrigationFrequency as number) === 0

      plan.push({
        date: new Date(currentDate),
        isStartDay: differenceInDays(currentDate, startDate) === 0,
        isHarvestDay: differenceInDays(currentDate, harvestDate) === 0,
        needsIrrigation,
      })

      currentDate = addDays(currentDate, 1)
      dayCount++
    }

    setIrrigationPlan(plan)
    setPlanId(null) // Reset plan ID when generating a new plan
    setIrrigationEvents([]) // Reset irrigation events when generating a new plan
  }

  const savePlan = async () => {
    if (irrigationPlan.length === 0) {
      toast.error("No plan to save", {
        description: "Please generate an irrigation plan first",
      })
      return
    }

    if (!isSignedIn || !user) {
      toast.error("Authentication required", {
        description: "Please sign in to save your irrigation plan",
      })
      return
    }

    try {
      setIsLoading(true)

      const planData = {
        user_id: user.id,
        crop_id: selectedCrop,
        start_date: startDate?.toISOString(),
        plan: irrigationPlan.map((day) => ({
          date: day.date.toISOString(),
          is_start_day: day.isStartDay,
          is_harvest_day: day.isHarvestDay,
          needs_irrigation: day.needsIrrigation,
        })),
      }

      let response

      if (planId) {
        // Update existing plan
        response = await supabase.from("irrigation_plans").update(planData).eq("id", planId)
      } else {
        // Insert new plan
        response = await supabase.from("irrigation_plans").insert(planData).select()
      }

      if (response.error) throw response.error

      if (response.data && response.data[0]) {
        setPlanId(response.data[0].id)

        // Create irrigation events for the plan
        const irrigationDays = irrigationPlan.filter((day) => day.needsIrrigation)

        if (irrigationDays.length > 0) {
          const eventsData = irrigationDays.map((day) => ({
            plan_id: response.data[0].id,
            event_date: day.date.toISOString(),
            completed: false,
            notes: "",
          }))

          const { error: eventsError } = await supabase.from("irrigation_events").insert(eventsData)

          if (eventsError) {
            console.error("Error creating irrigation events:", eventsError)
          } else {
            // Fetch the newly created events
            fetchIrrigationEvents(response.data[0].id)
          }
        }
      }

      // Refresh the list of saved plans
      await fetchSavedPlans()

      toast.success("Success", {
        description: "Irrigation plan saved successfully",
      })
    } catch (error) {
      console.error("Error saving plan:", error)
      toast.error("Error", {
        description: "Failed to save irrigation plan",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deletePlan = async () => {
    if (!planId) {
      setIrrigationPlan([])
      return
    }

    if (!isSignedIn || !user) {
      toast.error("Authentication required", {
        description: "Please sign in to delete your irrigation plan",
      })
      return
    }

    try {
      setIsLoading(true)

      // With CASCADE delete, we don't need to delete irrigation_events separately
      const { error } = await supabase.from("irrigation_plans").delete().eq("id", planId)

      if (error) throw error

      setIrrigationPlan([])
      setPlanId(null)
      setIrrigationEvents([])

      // Refresh the list of saved plans
      await fetchSavedPlans()

      toast.success("Success", {
        description: "Irrigation plan deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast.error("Error", {
        description: "Failed to delete irrigation plan",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlan = async (id: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.from("irrigation_plans").select("*").eq("id", id).single()

      if (error) throw error

      if (data) {
        setSelectedCrop(data.crop_id)
        setStartDate(new Date(data.start_date))

        // Convert the stored plan back to the format used by the component
        const loadedPlan = data.plan.map((day: any) => ({
          date: new Date(day.date),
          isStartDay: day.is_start_day,
          isHarvestDay: day.is_harvest_day,
          needsIrrigation: day.needs_irrigation,
        }))

        setIrrigationPlan(loadedPlan)
        setPlanId(data.id)

        // Fetch irrigation events for this plan
        fetchIrrigationEvents(data.id)
      }
    } catch (error) {
      console.error("Error loading plan:", error)
      toast.error("Failed to load irrigation plan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDayClick = (day: Date) => {
    // Find if this day needs irrigation
    const planDay = irrigationPlan.find((p) => isSameDay(p.date, day))

    if (planDay?.needsIrrigation) {
      setSelectedDate(day)

      // Check if there's an existing event for this date
      const existingEvent = irrigationEvents.find((e) => isSameDay(new Date(e.event_date), day))

      if (existingEvent) {
        setEventCompleted(existingEvent.completed)
        setEventNotes(existingEvent.notes)
      } else {
        setEventCompleted(false)
        setEventNotes("")
      }
    }
  }

  const saveIrrigationEvent = async () => {
    if (!selectedDate || !planId) return

    try {
      setIsLoading(true)

      // Check if there's an existing event for this date
      const existingEvent = irrigationEvents.find((e) => isSameDay(new Date(e.event_date), selectedDate))

      if (existingEvent) {
        // Update existing event
        const { error } = await supabase
          .from("irrigation_events")
          .update({
            completed: eventCompleted,
            notes: eventNotes,
          })
          .eq("id", existingEvent.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase.from("irrigation_events").insert({
          plan_id: planId,
          event_date: selectedDate.toISOString(),
          completed: eventCompleted,
          notes: eventNotes,
        })

        if (error) throw error
      }

      // Refresh irrigation events
      fetchIrrigationEvents(planId)

      // Reset form
      setSelectedDate(null)
      setEventCompleted(false)
      setEventNotes("")

      toast.success("Irrigation event saved successfully")
    } catch (error) {
      console.error("Error saving irrigation event:", error)
      toast.error("Failed to save irrigation event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Choose crop</label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    Select a crop
                  </SelectItem>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Choose start date</label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={generateIrrigationPlan} className="w-full py-6 text-lg" disabled={isLoading}>
            Generate Irrigation Plan
          </Button>
        </CardContent>
      </Card>

      {irrigationPlan.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Calendar for irrigation that is generated</h2>
              <IrrigationCalendar plan={irrigationPlan} events={irrigationEvents} onDayClick={handleDayClick} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={savePlan} className="py-6 text-lg" disabled={isLoading}>
              Save
            </Button>
            <Button onClick={deletePlan} variant="destructive" className="py-6 text-lg" disabled={isLoading}>
              Delete
            </Button>
          </div>
        </>
      )}

      {selectedDate && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Irrigation Event - {format(selectedDate, "MMMM d, yyyy")}</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={eventCompleted}
                  onCheckedChange={(checked) => setEventCompleted(checked)}
                />
                <label htmlFor="completed" className="text-sm font-medium">
                  Mark as completed
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Notes</label>
                <Textarea
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Add notes about this irrigation event..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setSelectedDate(null)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={saveIrrigationEvent} disabled={isLoading}>
                  Save Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {savedPlans.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Saved Plans</h2>
            <div className="space-y-2">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadPlan(plan.id)}
                >
                  <div>
                    <p className="font-medium">{crops.find((c) => c.id === plan.crop_id)?.name || plan.crop_id}</p>
                    <p className="text-sm text-gray-500">{new Date(plan.start_date).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPlanId(plan.id)
                      deletePlan()
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {irrigationEvents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Irrigation Events</h2>
            <div className="space-y-2">
              {irrigationEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center">
                    {event.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <CircleIcon className="h-5 w-5 text-gray-300 mr-2" />
                    )}
                    <div>
                      <p className="font-medium">{format(new Date(event.event_date), "MMMM d, yyyy")}</p>
                      {event.notes && <p className="text-sm text-gray-500">{event.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

