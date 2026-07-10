export type AppTypeLabel = 'videogame' | 'extension'
export type AppTypeName = 'Videogame' | 'Extension'

export interface AppType {
  id: number
  label: AppTypeLabel
  name: AppTypeName
}
