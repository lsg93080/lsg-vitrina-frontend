import type { ESRB } from '@/types/models/esrb'
import { EsrbRatingValue } from '@/types/models/esrb'

export const ESRB_RATINGS: ESRB[] = [
  {
    id: 1,
    name: 'Everyone',
    label: 'everyone',
    value: EsrbRatingValue.EVERYONE,
    imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/E.svg'
  },
  {
    id: 2,
    name: 'Everyone 10+',
    label: 'everyone10',
    value: EsrbRatingValue.EVERYONE_10_PLUS,
    imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg'
  },
  {
    id: 3,
    name: 'Teen',
    label: 'teen',
    value: EsrbRatingValue.TEEN,
    imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/T.svg'
  },
  {
    id: 4,
    name: 'Mature 17+',
    label: 'mature17',
    value: EsrbRatingValue.MATURE_17_PLUS,
    imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/M.svg'
  },
  {
    id: 5,
    name: 'Adults Only 18+',
    label: 'adults18',
    value: EsrbRatingValue.ADULTS_ONLY_18_PLUS,
    imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/AO.svg'
  },
  {
    id: 6,
    name: 'Rating Pending',
    label: 'rating-pending',
    value: EsrbRatingValue.RATING_PENDING,
    imageURL: 'https://www.esrb.org/wp-content/uploads/2019/05/RP.svg'
  }
]
