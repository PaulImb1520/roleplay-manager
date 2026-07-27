export interface HealthRepository {
  checkConnection(): Promise<"reachable" | "unreachable">
}
