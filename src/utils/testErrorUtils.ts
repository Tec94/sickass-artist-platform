/**
 * Test utilities for simulating various error scenarios in the merch system.
 */

import { ConvexError } from 'convex/values'

export const simulateNetworkError = () => {
  throw new Error('Failed to fetch: Network connection lost')
}

export const simulateInventoryError = () => {
  throw new Error('Item is out of stock')
}

export const simulateAuthError = () => {
  throw new Error('User is not signed in or unauthorized')
}

export const simulateValidationError = () => {
  throw new Error('Invalid input validation failed')
}

export const simulateDuplicateError = () => {
  throw new Error('Item already exists in cart')
}

export const simulateConvexError = (code: string, message: string) => {
  throw new ConvexError({ code, message })
}

export const simulateUnknownError = () => {
  throw new Error('Something very strange happened')
}

export const delayedError = (ms: number, errorFn: () => void) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      try {
        errorFn()
      } catch (e) {
        reject(e)
      }
    }, ms)
  })
}
