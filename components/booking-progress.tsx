"use client"

import { Check } from "lucide-react"

interface BookingProgressProps {
  currentStep: 1 | 2 | 3
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const steps = [
    { number: 1, label: "Select Room" },
    { number: 2, label: "Payment" },
    { number: 3, label: "Confirmation" },
  ]

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  step.number < currentStep
                    ? "bg-[#FF6B35] border-[#FF6B35]"
                    : step.number === currentStep
                      ? "border-[#FF6B35] bg-white"
                      : "border-gray-300 bg-white"
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <span className={`font-semibold ${step.number === currentStep ? "text-[#FF6B35]" : "text-gray-400"}`}>
                    {step.number}
                  </span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${step.number <= currentStep ? "text-gray-900" : "text-gray-400"}`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 -mt-6">
                <div
                  className={`h-full transition-colors ${step.number < currentStep ? "bg-[#FF6B35]" : "bg-gray-300"}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
