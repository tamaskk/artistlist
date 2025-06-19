'use client'

import { useState } from 'react'
import { checkExpiredAds } from '@/service/artist.service'

export default function CronTester() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckExpiredAds = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await checkExpiredAds()
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cron Job Tester</h1>
        
        <div className="mb-6">
          <button
            onClick={handleCheckExpiredAds}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Check Expired Ads'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <strong>Success:</strong> {result.message}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Results Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Processed:</span> {result.results?.processed || 0}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {result.results?.updated || 0}
                </div>
                <div>
                  <span className="font-medium">Errors:</span> {result.results?.errors || 0}
                </div>
              </div>
            </div>

            {result.results?.details && result.results.details.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Details</h3>
                <div className="space-y-2">
                  {result.results.details.map((detail: any, index: number) => (
                    <div key={index} className="text-sm bg-white p-2 rounded border">
                      {detail.adId && (
                        <div><strong>Ad ID:</strong> {detail.adId}</div>
                      )}
                      {detail.artistId && (
                        <div><strong>Artist ID:</strong> {detail.artistId}</div>
                      )}
                      {detail.title && (
                        <div><strong>Title:</strong> {detail.title}</div>
                      )}
                      {detail.name && (
                        <div><strong>Artist Name:</strong> {detail.name}</div>
                      )}
                      {detail.status && (
                        <div><strong>Status:</strong> {detail.status}</div>
                      )}
                      {detail.action && (
                        <div><strong>Action:</strong> {detail.action}</div>
                      )}
                      {detail.error && (
                        <div className="text-red-600"><strong>Error:</strong> {detail.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <strong>Timestamp:</strong> {result.timestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 