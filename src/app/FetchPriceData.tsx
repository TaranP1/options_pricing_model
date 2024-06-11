import axios from 'axios'
import * as ss from 'simple-statistics'
import React, { useState, useEffect } from 'react'
import ParentUI from './AllInputs'
const API_KEY = "3S7KoVxb7RUVitNi0e9GiAZ6bKNmq7Ed" //Initialize Polygon API Key

// Function to get the current and previous year date in YYYY-MM-DD format
const getRangeDateFormatted = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return [`${year}-${month}-${day}`, `${year - 1}-${month}-${day}`]
}

// Function to calculate volatility from an array of prices
const calculateVolatility = (prices: number[]) => {
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }
  return ss.standardDeviation(returns)
}

// Function to fetch stock data (price and dividends) for a given ticker
const fetchStockData = async (ticker: string) => {
  const [date1, date2] = getRangeDateFormatted()

  try {
    const yearlyData = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date2}/${date1}?adjusted=true&sort=asc&apiKey=${API_KEY}`)
    const dividend = await axios.get(`https://api.polygon.io/v3/reference/dividends?ticker=${ticker}&limit=10&apiKey=${API_KEY}`)
    const prices: number[] = yearlyData.data.results.map((result: any) => result.c)

    const index = yearlyData.data.results.length - 1
    return [yearlyData.data.results[index].o, yearlyData.data.results[index].c, dividend.data.results[0].cash_amount, calculateVolatility(prices)]
  } catch (err) {
    throw err
  }
}

// Function to fetch the stock name for a given ticker
const fetchStockName = async (ticker: string) => {
  try {
    const response = await axios.get(`https://api.polygon.io/v3/reference/tickers?ticker=${ticker}&market=stocks&active=true&limit=100&apiKey=${API_KEY}`)
    return response.data.results[0].name
  } catch (err) {
    throw err
  }
}

// Main component to fetch price data and render UI
const FetchPriceData = ({ inputedTicker }: { inputedTicker: string }) => {
  // State variables to store fetched data and error state
  const [priceClose, setPriceClose] = useState(0)
  const [priceDiff, setPriceDiff] = useState(0)
  const [divPrice, setDiv] = useState(0)
  const [volatility, setVolatility] = useState(0)
  const [name, setName] = useState<string | null>(null)
  const [error, setError] = useState(false)

  // Effect to fetch data when the ticker changes
  useEffect(() => {
    const getPrice = async () => {
      try {
        const [priceOpen, priceClose, divPrice, vol] = await fetchStockData(inputedTicker)
        const name = await fetchStockName(inputedTicker)
        setPriceClose(priceClose)
        setDiv(divPrice)
        setVolatility(vol)
        setName(name)
        setPriceDiff(priceClose - priceOpen)
        setError(false)
      } catch (err) {
        setError(true)
      }
    }

    getPrice()
  }, [inputedTicker])

  return (
    <div>
      {error ? (
        <div className="flex items-center space-x-2">
          <p className="font-heading text-lg font-normal text-black">Enter Valid Ticker</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <p className="font-heading text-lg font-bold text-black">{name} ({inputedTicker})</p>
          <div className="flex items-center space-x-1">
            <p className="font-heading text-m text-black">${priceClose}</p>
            <p className={`font-heading text-m ${priceDiff < 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}`}>
              {priceDiff < 0 ? '' : '+'}{priceDiff.toFixed(2)} ({priceDiff < 0 ? '-' : '+'}{Math.abs(((priceDiff / priceClose) * 100)).toFixed(2)}%)
            </p>
          </div>
        </div>
      )}

      <p style={{ marginTop: '15px' }}>Select the option and pricing model for calculation. The Input Parameters may be overridden below.</p>
      <ParentUI price={priceClose} dividend={divPrice} vol={volatility} error={error} />
    </div>
  )
}

export default FetchPriceData
