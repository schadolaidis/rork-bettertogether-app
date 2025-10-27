type SchedulerCallback = () => void;

export class SchedulerService {
  private static intervalId: ReturnType<typeof setInterval> | null = null;
  private static callbacks: Set<SchedulerCallback> = new Set();

  static start(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('[SchedulerService] Error in callback:', error);
        }
      });
    }, 60 * 1000);
  }

  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  static subscribe(callback: SchedulerCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  static trigger(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('[SchedulerService] Error in manual trigger:', error);
      }
    });
  }
}
