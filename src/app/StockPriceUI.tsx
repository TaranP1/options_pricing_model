"use client"
import React, { useState, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import DeterminePrice from './FetchPriceData'

export default function StockPriceUI() {
  // State to store the inputted ticker symbol, initialized with "AAPL"
  const [inputedTicker, setInputedTicker] = useState("AAPL")
  // Ref to access the input element directly
  const inputRef = useRef<HTMLInputElement>(null)

  // Function to handle the button click event
  const handleButtonClick = () => {
    if (inputRef.current) {
      // Set the ticker symbol to the uppercase value of the input field
      setInputedTicker(inputRef.current.value.toUpperCase())
      // Clear the input field
      inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col h-full w-full border-2 rounded-lg p-5 max-w-full mx-auto bg-blue-50 border-blue-100" style={{ marginTop: '10px' }}>
      {/* Container with full width and height, border, padding, and background color */}
      <div className="flex items-center space-x-2">
        {/* Input field for ticker symbol */}
        <Input
          ref={inputRef}
          className="w-full"
          placeholder="Input ticker symbol"
          // Handle Enter key press to trigger the button click function
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleButtonClick()
            }
          }}
        />
        {/* Button to fetch the stock price */}
        <Button onClick={handleButtonClick}>Enter</Button>
      </div>
      <div className="flex flex-col h-full w-full border rounded-lg mx-auto mt-2 bg-white border-blue-100" style={{ padding: '10px' }}>
        {/* Component to display the fetched stock price and details */}
        <DeterminePrice inputedTicker={inputedTicker} />
      </div>
    </div>
  )
}
