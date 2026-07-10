export enum EsrbRatingValue {
  EVERYONE = 'everyone',
  EVERYONE_10_PLUS = 'everyone10plus',
  TEEN = 'teen',
  MATURE_17_PLUS = 'mature17plus',
  ADULTS_ONLY_18_PLUS = 'adultsOnly18plus',
  RATING_PENDING = 'ratingPending'
}

export interface ESRB {
  id: number
  name: string
  imageURL: string
  label?: string
  value: EsrbRatingValue
}
