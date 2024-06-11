import StockPriceUI from './StockPriceUI'
import React from 'react'

export default function App() {
  return (
    <div className="App flex flex-col h-screen w-screen">
      {/* Container for the app with full screen height and width */}
      <header className="App-header flex flex-col p-5">
        {/* Header section with padding */}
        <p className="font-heading text-3xl font-bold text-black">Options Calculator</p>
        {/* Main heading */}
        <p className="text-sm font-bold text-black mt-5">
          Customize your input parameters by entering the option type, strike price, days to expiration (DTE), and risk-free rate, volatility, and (optional) dividend yield% for equities. The calculator uses the latest price for the underlying symbol. Greek values and IV calculations are performed using the Black Scholes Pricing model. Limited to 5 API requests per minute.
        </p>
        {/* Description paragraph */}
      </header>
      <div className="flex-grow">
        {/* Main content area that grows to fill the remaining space */}
        <StockPriceUI />
        {/* Stock price user interface component */}
      </div>
    </div>
  )
}
