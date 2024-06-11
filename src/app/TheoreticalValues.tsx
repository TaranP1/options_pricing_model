import React, { useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"

// Function to generate a Gaussian random number using Box-Muller transform
function getGaussianRandom(): number {
  let u = 0, v = 0
  // Ensure u and v are not zero
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Cumulative distribution function for the standard normal distribution
const cumulativeDistributionFunction = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)))

// Error function approximation
const erf = (x: number) => {
  // Coefficients for the approximation
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  // Approximate the error function
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return sign * y
}

// Function to perform various financial calculations
const performCalculations = (data: string[]) => {
  // Parse input data
  const stockPrice = parseFloat(data[0])
  const strikePrice = parseFloat(data[1])
  const timeToExpiration = parseFloat(data[2]) / 365
  const riskFreeRate = parseFloat(data[3]) / 100
  const volatility = parseFloat(data[4]) / 100
  const dividendYield = parseFloat(data[5]) / 100
  const optionType = data[6]
  const model = data[7]
  const numSteps = parseFloat(data[8])
  const upFactor = parseFloat(data[9])

  // Calculate d1 and d2 for Black-Scholes model
  const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate - dividendYield + (volatility ** 2) / 2) * timeToExpiration) / (volatility * Math.sqrt(timeToExpiration))
  const d2 = d1 - volatility * Math.sqrt(timeToExpiration)
  const pdf = Math.exp(-0.5 * d1 ** 2) / Math.sqrt(2 * Math.PI)

  // Initialize Greeks
  let D = 0
  let G = pdf / (stockPrice * volatility * Math.sqrt(timeToExpiration))
  let V = (stockPrice * pdf * Math.sqrt(timeToExpiration)) / 100
  let T = ((-stockPrice * pdf * volatility * Math.exp(-dividendYield * timeToExpiration) / (2 * Math.sqrt(timeToExpiration))) - (riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * cumulativeDistributionFunction(d2))) / 365
  let R = 0

  // Calculate Delta and Rho based on option type
  if (optionType === 'call') {
    D = cumulativeDistributionFunction(d1)
    R = (strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * cumulativeDistributionFunction(d2)) / 100
  } else {
    D = cumulativeDistributionFunction(d1) - 1
    R = (-strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * cumulativeDistributionFunction(-d2)) / 100
  }

  // Black-Scholes model calculations
  if (model === "BS") {
    if (optionType === 'call') {
      const N_d1 = cumulativeDistributionFunction(d1)
      const N_d2 = cumulativeDistributionFunction(d2)
      const result = stockPrice * Math.exp(-dividendYield * timeToExpiration) * N_d1 - strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * N_d2
      return [result.toFixed(2), D.toFixed(5), G.toFixed(5), V.toFixed(5), T.toFixed(5), R.toFixed(5)]
    } else {
      const N_minus_d1 = cumulativeDistributionFunction(-d1)
      const N_minus_d2 = cumulativeDistributionFunction(-d2)
      const result = strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * N_minus_d2 - stockPrice * Math.exp(-dividendYield * timeToExpiration) * N_minus_d1
      return [result.toFixed(2), D.toFixed(5), G.toFixed(5), V.toFixed(5), T.toFixed(5), R.toFixed(5)]
    }
  } 
  // Binomial model calculations
  else if (model === "B") {
    const dt = timeToExpiration / numSteps
    const u = upFactor // Up factor
    const d = 1 / u // Down factor
    const p = (Math.exp((riskFreeRate - dividendYield) * dt) - d) / (u - d) // Probability of up move
    const discountFactor = Math.exp(-riskFreeRate * dt) // Discount factor per step

    // Initialize stock price tree
    let stockPriceTree = Array(numSteps + 1).fill(0).map(() => Array(numSteps + 1).fill(0))
    for (let i = 0; i <= numSteps; i++) {
      for (let j = 0; j <= i; j++) {
        stockPriceTree[j][i] = stockPrice * Math.pow(u, i - j) * Math.pow(d, j)
      }
    }

    // Initialize option value tree
    let optionPriceTree = Array(numSteps + 1).fill(0).map(() => Array(numSteps + 1).fill(0))
    for (let j = 0; j <= numSteps; j++) {
      if (optionType === 'call') {
        optionPriceTree[j][numSteps] = Math.max(0, stockPriceTree[j][numSteps] - strikePrice)
      } else {
        optionPriceTree[j][numSteps] = Math.max(0, strikePrice - stockPriceTree[j][numSteps])
      }
    }

    // Step backwards through the tree
    for (let i = numSteps - 1; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        optionPriceTree[j][i] = discountFactor * (p * optionPriceTree[j][i + 1] + (1 - p) * optionPriceTree[j + 1][i + 1])
      }
    }

    const result = optionPriceTree[0][0]
    return [result.toFixed(2), D.toFixed(5), G.toFixed(5), V.toFixed(5), T.toFixed(5), R.toFixed(5)]
  } 
  // Monte Carlo model calculations
  else {
    const dt = timeToExpiration / numSteps
    const discountFactor = Math.exp(-riskFreeRate * timeToExpiration)
    const drift = (riskFreeRate - dividendYield - 0.5 * volatility * volatility) * dt
    const diffusion = volatility * Math.sqrt(dt)

    let payoffSum = 0

    // Simulate stock price paths and calculate payoff
    for (let i = 0; i < numSteps; i++) {
      let S = stockPrice

      for (let t = 0; t < numSteps; t++) {
        const gaussRandom = getGaussianRandom()
        S = S * Math.exp(drift + diffusion * gaussRandom)
      }

      if (optionType === 'call') {
        payoffSum += Math.max(S - strikePrice, 0)
      } else {
        payoffSum += Math.max(strikePrice - S, 0)
      }
    }

    const result = (payoffSum / numSteps) * discountFactor
    return [result.toFixed(2), D.toFixed(5), G.toFixed(5), V.toFixed(5), T.toFixed(5), R.toFixed(5)]
  }
}

interface TheoreticalValuesProps {
  table: string[]
}

// React functional component to display theoretical values
const TheoreticalValues: React.FC<TheoreticalValuesProps> = ({ table }) => {
  const placeHolderRefs = useRef<string[]>(new Array(6).fill("N/A"))

  // Update placeholder values based on input data
  if (table[0] === "error") {
    placeHolderRefs.current = new Array(6).fill("N/A")
  } else {
    placeHolderRefs.current = performCalculations(table)
  }

  return (
    <div className='flex flex-col space-y-8' style={{ marginBottom: '180px' }}>
      {[
        'Option Price/Value',
        'Delta',
        'Gamma',
        'Vega',
        'Theta',
        'Rho'
      ].map((label, index) => (
        <div key={index} className='flex items-center justify-between' style={{ padding: '0 30px', marginRight: '100px' }}>
          <p className='font-bold text-black text-base' style={{ flexBasis: '280px' }}>{label}</p>
          <Input
            disabled
            style={{ width: '150px', marginLeft: '140px' }}
            className='text-right'
            placeholder={placeHolderRefs.current[index]}
          />
        </div>
      ))}
    </div>
  )
}

export default TheoreticalValues
