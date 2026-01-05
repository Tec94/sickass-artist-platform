import React from 'react'

interface TestErrorComponentProps {
  shouldThrow?: boolean
  errorType?: 'network' | 'auth' | 'validation' | 'unknown'
}

export const TestErrorComponent: React.FC<TestErrorComponentProps> = ({
  shouldThrow = false,
  errorType = 'unknown'
}) => {
  if (shouldThrow) {
    throw new Error(getErrorMessage(errorType))
  }
  
  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="text-green-800 font-medium">Test Component</h3>
      <p className="text-green-600 text-sm">This component is working correctly.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
      >
        Reload
      </button>
    </div>
  )
}

function getErrorMessage(errorType: string): string {
  switch (errorType) {
    case 'network':
      return 'Network error: Failed to fetch data'
    case 'auth':
      return 'Authentication error: NOT_AUTHENTICATED'
    case 'validation':
      return 'Validation error: INVALID_INPUT'
    case 'unknown':
    default:
      return 'Unknown error occurred'
  }
}