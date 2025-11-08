// Simple event emitter for notification updates
type EventCallback = (...args: any[]) => void

class NotificationService {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  off(event: string, callback: EventCallback) {
    if (!this.events.has(event)) return
    const callbacks = this.events.get(event)!
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.events.has(event)) return
    const callbacks = this.events.get(event)!
    callbacks.forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`[v0] Error in notification service callback:`, error)
      }
    })
  }
}

export const notificationService = new NotificationService()
