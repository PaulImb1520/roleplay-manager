/**
 * Puerto de acceso a la tabla `settings`.
 *
 * La tabla es un simple key-value store que persiste configuración
 * global del sistema (proveedor por defecto, modelo, claves de
 * proveedores remotos, etc.). El dominio la consume a través de este
 * puerto; la implementación (Drizzle) vive en infraestructura.
 */
export interface SettingsRepository {
  get(key: string): Promise<string | null>
  getMany(keys: string[]): Promise<Record<string, string | null>>
  set(key: string, value: string): Promise<void>
  setMany(entries: Record<string, string>): Promise<void>
}
