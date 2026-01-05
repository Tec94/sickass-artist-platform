import { useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { TestErrorComponent } from '../components/TestErrorComponent'

export const TestErrorPage = () => {
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'validation' | 'unknown' | null>(null)
  const [shouldThrow, setShouldThrow] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Error Boundary Test Page</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Error Type</label>
              <select
                value={errorType || ''}
                onChange={(e) => setErrorType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select error type</option>
                <option value="network">Network Error</option>
                <option value="auth">Authentication Error</option>
                <option value="validation">Validation Error</option>
                <option value="unknown">Unknown Error</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setShouldThrow(true)}
                disabled={!errorType || shouldThrow}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium ${shouldThrow ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Trigger Error
              </button>
            </div>
          </div>
          
          <button
            onClick={() => {
              setShouldThrow(false)
              setErrorType(null)
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded-md"
          >
            Reset
          </button>
        </div>
        
        {/* Page Level Error Boundary Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Page Level Error Boundary</h2>
          <ErrorBoundary level="page">
            <TestErrorComponent shouldThrow={shouldThrow && errorType === 'network'} errorType={errorType || undefined} />
          </ErrorBoundary>
        </div>
        
        {/* Section Level Error Boundary Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Section Level Error Boundary</h2>
          <ErrorBoundary level="section">
            <TestErrorComponent shouldThrow={shouldThrow && errorType === 'auth'} errorType={errorType || undefined} />
          </ErrorBoundary>
        </div>
        
        {/* Component Level Error Boundary Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Component Level Error Boundary</h2>
          <ErrorBoundary level="component">
            <TestErrorComponent shouldThrow={shouldThrow && errorType === 'validation'} errorType={errorType || undefined} />
          </ErrorBoundary>
        </div>
        
        {/* Multiple Error Boundaries Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Multiple Error Boundaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ErrorBoundary level="section" componentName="Widget1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-medium mb-2">Widget 1</h3>
                <TestErrorComponent shouldThrow={shouldThrow && errorType === 'unknown'} errorType={errorType || undefined} />
              </div>
            </ErrorBoundary>
            
            <ErrorBoundary level="section" componentName="Widget2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium mb-2">Widget 2</h3>
                <p className="text-green-600 text-sm">This widget should continue working even if Widget 1 fails.</p>
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  )
}