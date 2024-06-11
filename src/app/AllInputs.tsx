import React, { useState, useRef, useEffect } from 'react'
import { Separator } from '@radix-ui/react-separator'
import TheoreticalValues from './TheoreticalValues'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define the interface for input parameters properties
interface InputParametersProps {
  price: number
  dividend: number
  vol: number
  error: boolean
}

// Function to gather and prepare input data for calculations
const requestData = (
  inputRefs: string[],
  placeHolderRefs: string[],
  optionType: string,
  pricingModel: string,
): string[] => {
  const dataTable: string[] = []

  // Fill dataTable with inputs or placeholders if inputs are null
  for (let i = 0; i <= 5; i++) {
    dataTable.push(inputRefs[i] === "null" ? placeHolderRefs[i] : inputRefs[i])
  }

  // Return error if optionType or pricingModel is not selected
  if (optionType == "null" || pricingModel == "null") {
    return ["error"]
  }

  // Add optionType and pricingModel to dataTable
  dataTable.push(optionType, pricingModel)

  // Handle optional input fields for simulations/steps and up factor
  if (inputRefs.length >= 7 && inputRefs.length < 8) {
    dataTable.push(inputRefs[6] === "null" ? placeHolderRefs[6] : inputRefs[6])
  } else if (inputRefs.length >= 8) {
    dataTable.push(inputRefs[6] === "null" ? placeHolderRefs[6] : inputRefs[6])
    dataTable.push(inputRefs[7] === "null" ? placeHolderRefs[7] : inputRefs[7])
  }
  return dataTable
}

// Function to check if a string is a valid number
function isNumber(value: string): boolean {
  return !isNaN(Number(value))
}

// Parent component for handling UI and state
const AllInputs: React.FC<InputParametersProps> = ({ price, dividend, vol, error }) => {
  // Refs to store input values
  const inputRefs = useRef<string[]>(Array(8).fill("null"))
  const [optionType, setOption] = useState("null")
  const [pricingModel, setModel] = useState("null")
  const [change, setChange] = useState(false)
  const dataTable = useRef<string[]>([])

  // Placeholder values depending on error state and input parameters
  const placeHolderRefs: string[] = (error || price == 0)
    ? ["N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]
    : [
        price.toString(),
        price.toString(),
        "14",
        "5.11",
        `${(vol * 2000).toFixed(2)}%`,
        `${((dividend * 400) / price).toFixed(2)}%`,
        '3',
        `${(Math.exp(vol * Math.sqrt(14 / 3))).toFixed(2)}`
      ]

  // Labels for input elements
  const inputElements: string[] = [
    'Underlying Price',
    'Strike Price',
    'Expiration (days)',
    'Risk-free rate%',
    'Volatility',
    'Dividend Yield%',
    'Simulations/Steps',
    'Up Factor',
  ]

  // Function to gather complete data when inputs change
  const checkCompleteData = () => {
    dataTable.current = requestData(
      inputRefs.current,
      placeHolderRefs,
      optionType,
      pricingModel
    )
  }

  // Effect to check complete data when option type, pricing model, or change state updates
  useEffect(() => {
    checkCompleteData()
  }, [optionType, pricingModel, change])

  // Handlers for selecting option type and pricing model
  const handleOptionChange = (value: string) => {
    setOption(value)
  }

  const handlePricingChange = (value: string) => {
    setModel(value)
  }

  // Handler for updating input values
  const handleInput = (input: string, index: number) => {
    inputRefs.current[index] = input ? input : "null"
    setChange(!change)
  }

  // Determine if input fields should be disabled based on error state and selected pricing model
  const checkDisabled = (er: boolean, index: number) => {
    if (er) {
      return true
    } else if (index == 6 && (pricingModel == "BS" || pricingModel == "null")) {
      return true
    } else if (index == 7 && (pricingModel == "BS" || pricingModel == "null" || pricingModel == "MC")) {
      return true
    }
    return false
  }
  checkCompleteData()

  return (
    <div>
      <div className="flex items-center space-x-20" style={{ marginTop: '20px' }}>
        {/* Option type selection */}
        <div className="flex items-center space-x-4">
          <p className="text-sm font-bold">Option Type</p>
          <Select onValueChange={(value) => handleOptionChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" className="font-bold" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="put">Put</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Pricing model selection */}
        <div className="flex items-center space-x-4">
          <p className="text-sm font-bold">Pricing Model</p>
          <Select onValueChange={(value) => handlePricingChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Model" className="font-bold" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="BS">Black Scholes</SelectItem>
                <SelectItem value="MC">Monte Carlo</SelectItem>
                <SelectItem value="B">Binomial</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Separator line */}
      <Separator className="rounded-lg" style={{ marginTop: '20px', background: 'black' }} />

      <div style={{ backgroundColor: '#f0f0f0', padding: '20px' }}>
        <div className="p-10 flex items-center justify-between" style={{ marginLeft: '40px' }}>
          <p className="font-bold text-blue-500 text-lg">Input Parameters</p>
          <div
            style={{
              flex: '1 1 0%',
              display: 'flex',
              justifyContent: 'center',
              marginLeft: '240px'
            }}
          >
            <p className="font-bold text-blue-500 text-lg">Calculated Theoretical Values</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div style={{ marginLeft: "80px" }}>
            <Separator
              style={{
                height: '480px',
                width: '1px',
                backgroundColor: 'black',
                marginRight: '10px',
                marginBottom: '165px'
              }}
            />
          </div>

          <div className="flex flex-col space-y-8" style={{ marginBottom: '180px' }}>
            {inputElements.map((label, index) => (
              <div key={index} className="flex items-center justify-between" style={{ padding: '0 30px' }}>
                <p className="font-bold text-black text-base" style={{ flexBasis: '280px' }}>
                  {label}
                </p>
                <Input
                  style={{ width: '150px', marginLeft: '140px' }}
                  className="text-right"
                  disabled={checkDisabled(error, index)}
                  placeholder={placeHolderRefs[index]}
                  // Handle input validation and update inputRefs
                  onInput={(e) => {
                    if (isNumber(e.currentTarget.value)) {
                      handleInput(e.currentTarget.value, index)
                    } else {
                      e.currentTarget.value = "Enter valid number"
                    }
                  }}
                  // Clear placeholder text on key down
                  onKeyDown={(e) => {
                    if (e.currentTarget.value === "Enter valid number") {
                      e.currentTarget.value = ""
                    }
                  }}
                  // Clear placeholder text on click
                  onClick={(e) => {
                    if (e.currentTarget.value === "Enter valid number") {
                      e.currentTarget.value = ""
                    }
                  }}
                  // Clear placeholder text on blur
                  onBlur={(e) => {
                    if (e.currentTarget.value === "Enter valid number") {
                      e.currentTarget.value = ""
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              flex: '1 1 0%',
              display: 'flex',
              justifyContent: 'center',
              marginLeft: '205px'
            }}
          >
            <Separator
              style={{
                height: '450px',
                width: '1px',
                backgroundColor: 'black',
                marginRight: '10px',
                marginBottom: '160px'
              }}
            />
          </div>

          {/* Component to display calculated theoretical values */}
          <TheoreticalValues table={dataTable.current} />
        </div>
      </div>
    </div>
  )
}

export default AllInputs
