export interface Status {
  releaseId: number
  reviewerId: string
  isReviewed: boolean
  isSafe: boolean
  additionalComments: string
  reviewDate: Date | null
}
