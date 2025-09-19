import { ServerResponse } from 'http'
import fetch, { RequestInit } from 'node-fetch'
import { ResponseContext } from './types'

export async function respondWithFetchPromise(
    id: number,
    response: ServerResponse,
    promise: Promise<ResponseContext | null>
): Promise<boolean> {
    const context = await promise
    if (!context) {
        return false
    }
    for (const [key, value] of Object.entries(context.headers)) {
        const lowerCaseKey = key.toLowerCase()
        if (lowerCaseKey === 'content-length' || lowerCaseKey === 'content-encoding') {
            continue
        }
        response.setHeader(key, value)
    }
    response.statusCode = context.status
    context.json.id = id
    response.end(JSON.stringify(context.json))
    return true
}

export async function fetchWithTimeout(url: string, options: RequestInit): Promise<ResponseContext | null> {
    try {
        const response = await fetch(url, { ...options, timeout: 10_000 })

        // Check if response is ok (status 200-299)
        if (!response.ok) {
            console.error(`HTTP ${response.status} error from ${url}: ${response.statusText}`)
            return null
        }

        // Try to parse JSON, but handle non-JSON responses gracefully
        let jsonData
        try {
            jsonData = await response.json()
        } catch (jsonError) {
            console.error(`Invalid JSON response from ${url}: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`)
            return null
        }

        return {
            status: response.status,
            headers: response.headers.raw(),
            json: jsonData
        }
    } catch (error) {
        console.error(`Fetch error from ${url}:`, error)
        return null
    }
}
