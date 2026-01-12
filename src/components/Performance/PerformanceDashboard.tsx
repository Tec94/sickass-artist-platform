import React, { useState, useEffect } from 'react'
import { perfMonitor, type PerformanceReport, type MetricSummary } from '../../utils/performanceMonitor'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<PerformanceReport | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const report = perfMonitor.getReport()
    setReport(report)

    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      setReport(perfMonitor.getReport())
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [isOpen])

  const handleClearMetrics = () => {
    perfMonitor.clear()
    setReport(perfMonitor.getReport())
  }

  const handleExportMetrics = () => {
    const data = perfMonitor.export()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.8) return 'text-green-500'
    if (value <= threshold) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (!isOpen || !report) return null

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-gray-950 border-l border-gray-800 shadow-2xl z-50">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <iconify-icon icon="solar:chart-square-linear" width="20" height="20" class="text-cyan-500"></iconify-icon>
            <h2 className="text-lg font-bold text-white">Performance</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition"
          >
            <iconify-icon icon="solar:close-circle-linear" width="20" height="20" class="text-gray-400"></iconify-icon>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Alerts Section */}
          {report.alerts.length > 0 && (
            <div className="bg-red-950/30 border border-red-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <iconify-icon icon="solar:danger-triangle-linear" width="16" height="16" class="text-red-500"></iconify-icon>
                <span className="text-sm font-semibold text-red-400">
                  {report.alerts.length} Slow Operations
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {report.alerts.slice(0, 5).map((alert, idx) => (
                  <div key={idx} className="text-xs text-red-300 bg-red-950/50 p-2 rounded">
                    <div className="font-medium">{alert.name}</div>
                    <div className="text-red-400">{alert.value.toFixed(0)}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div>
            <div className="space-y-2">
              {Object.entries(report.summary).map(([name, stats]) => {
                const s = stats as MetricSummary
                const thresholds: Record<string, number> = {
                  'image-load': 800,
                  'lightbox-open': 300,
                  'filter-apply': 500,
                  'like-response': 1000,
                  'scroll-render': 100,
                  'query-fetch': 500,
                }
                const threshold = thresholds[name] || Infinity
                const statusColor = getStatusColor(s.avg, threshold)

                return (
                  <div key={name} className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300 capitalize">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${statusColor} font-semibold`}>
                          {s.avg.toFixed(0)}ms
                        </span>
                        <span className="text-xs text-gray-500">
                          ({s.count} ops)
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">min</span>
                        <div className="text-gray-300">{s.min.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-500">p95</span>
                        <div className="text-gray-300">{s.p95.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-500">max</span>
                        <div className="text-gray-300">{s.max.toFixed(0)}ms</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-gray-800 rounded overflow-hidden">
                      <div
                        className={`h-full ${
                          s.avg <= threshold * 0.8
                            ? 'bg-green-500'
                            : s.avg <= threshold
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((s.avg / threshold) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Metrics */}
          {report.metrics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <iconify-icon icon="solar:bolt-linear" width="16" height="16" class="text-cyan-500"></iconify-icon>
                <span className="text-sm font-semibold text-white">Recent Activity</span>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {report.metrics.slice(-10).reverse().map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-gray-900/50 p-2 rounded">
                    <span className="text-gray-300">{metric.name}</span>
                    <span className="text-gray-400">{metric.value.toFixed(0)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleClearMetrics}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition flex items-center justify-center gap-2"
          >
            <iconify-icon icon="solar:check-circle-linear" width="16" height="16"></iconify-icon>
            Clear Metrics
          </button>
          <button
            onClick={handleExportMetrics}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition flex items-center justify-center gap-2"
          >
            <iconify-icon icon="solar:chart-square-linear" width="16" height="16"></iconify-icon>
            Export Report
          </button>
          <div className="text-xs text-gray-500 text-center pt-2">
            Press Ctrl/Cmd + Shift + P to view in console
          </div>
        </div>
      </div>
    </div>
  )
}
