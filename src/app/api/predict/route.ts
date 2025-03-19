import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

// Define the expected input structure
interface PredictionInput {
  N: number
  P: number
  K: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}

export const maxDuration = 30 // Extend function timeout to 30 seconds

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = (await request.json()) as PredictionInput

    // Validate the input
    const { N, P, K, temperature, humidity, ph, rainfall } = body

    if (
      typeof N !== "number" ||
      typeof P !== "number" ||
      typeof K !== "number" ||
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof ph !== "number" ||
      typeof rainfall !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input: all values must be numbers" }, { status: 400 })
    }

    const prediction = await runPythonPrediction({
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall,
    })

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function runPythonPrediction(data: PredictionInput): Promise<string> {
  return new Promise((resolve, reject) => {
    // Determine the Python executable based on the platform
    const isPythonInstalled = async () => {
      try {
        const pythonProcess = spawn(process.platform === "win32" ? "python" : "python3", ["--version"])
        return new Promise((resolve) => {
          pythonProcess.on("exit", (code) => resolve(code === 0))
        })
      } catch {
        return false
      }
    }

    const scriptPath = path.join(process.cwd(), "src", "python", "predict.py")

    // Use 'python' on Windows and 'python3' on other platforms
    const pythonCommand = process.platform === "win32" ? "python" : "python3"

    // Spawn Python process with shell option for Windows
    const pythonProcess = spawn(pythonCommand, [scriptPath], {
      shell: process.platform === "win32", // This helps with Windows path issues
    })

    let result = ""
    let errorOutput = ""

    // Send the data to the Python script
    pythonProcess.stdin.write(JSON.stringify(data))
    pythonProcess.stdin.end()

    // Collect the output
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString()
      console.error("Python stderr:", data.toString())
    })

    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(result.trim())
      } else {
        console.error(`Python process exited with code ${code}`)
        console.error(`Error output: ${errorOutput}`)
        reject(new Error(`Prediction failed with code ${code}`))
      }
    })

    // Handle process errors
    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python process:", err)
      reject(new Error("Failed to start Python process"))
    })
  })
}

