import { Dates } from 'cafe-utility'

export type Target = {
    url: string
    lastErrorAt: number
    lastUsedAt: number
}

let lastUsedIndex = 0

export function getHealthyTarget(targets: Target[]): Target {
    const healthyIfLastErrorIsBefore = Date.now() - Dates.hours(2)
    const healthyTargets = targets.filter(x => x.lastErrorAt < healthyIfLastErrorIsBefore)

    if (healthyTargets.length === 0) {
        return targets[0] // Fallback to first target if none are healthy
    }

    // Round-robin selection among healthy targets
    const selectedTarget = healthyTargets[lastUsedIndex % healthyTargets.length]
    lastUsedIndex = (lastUsedIndex + 1) % healthyTargets.length

    return selectedTarget
}

export function markTargetAsUnhealthy(targets: Target[], targetUrl: string): void {
    const target = targets.find(t => t.url === targetUrl)
    if (target) {
        target.lastErrorAt = Date.now()
    }
}
