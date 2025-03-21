"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  })
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          N: Number.parseFloat(formData.N),
          P: Number.parseFloat(formData.P),
          K: Number.parseFloat(formData.K),
          temperature: Number.parseFloat(formData.temperature),
          humidity: Number.parseFloat(formData.humidity),
          ph: Number.parseFloat(formData.ph),
          rainfall: Number.parseFloat(formData.rainfall),
        }),
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const data = await response.json()
      setPrediction(data.prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crop Prediction Model</CardTitle>
          <CardDescription>Enter the soil and environmental parameters to predict the suitable crop.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="N">Nitrogen (N) [0 - 140]</Label>
                <Input
                  id="N"
                  name="N"
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  value={formData.N}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="P">Phosphorus (P) [5 - 145]</Label>
                <Input
                  id="P"
                  name="P"
                  type="number"
                  step="0.01"
                  placeholder="5.0"
                  value={formData.P}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="K">Potassium (K) [5 - 205]</Label>
                <Input
                  id="K"
                  name="K"
                  type="number"
                  step="0.01"
                  placeholder="5.0"
                  value={formData.K}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C) [10 - 44]</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.01"
                  placeholder="10.0"
                  value={formData.temperature}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (%) [15 - 99]</Label>
                <Input
                  id="humidity"
                  name="humidity"
                  type="number"
                  step="0.01"
                  placeholder="15.0"
                  value={formData.humidity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">pH [3.5 - 9.9]</Label>
                <Input
                  id="ph"
                  name="ph"
                  type="number"
                  step="0.01"
                  placeholder="3.5"
                  value={formData.ph}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="rainfall">Rainfall (mm) [20 - 298]</Label>
                <Input
                  id="rainfall"
                  name="rainfall"
                  type="number"
                  step="0.01"
                  placeholder="20.0"
                  value={formData.rainfall}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Predict Crop"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          {error && <div className="text-red-500 text-sm mb-2 w-full text-center">{error}</div>}
          {prediction && (
            <div className="bg-green-50 p-4 rounded-md w-full text-center">
              <h3 className="font-medium text-green-800">Recommended Crop:</h3>
              <p className="text-green-700 text-xl font-bold">{prediction}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}

