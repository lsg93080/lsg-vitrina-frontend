export interface TagsSection {
  selectedESRB: {
    id?: number
    name?: string
    label?: string
    imageURL?: string
  }
  selectedPlatforms: any[]
  tags: Array<{ id: number; name: string }>
}
