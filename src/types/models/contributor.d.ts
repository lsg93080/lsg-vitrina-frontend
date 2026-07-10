export interface Contributor {
  username: string
  imgUrl: string
  postsQty: number
  videogamesQty: number
  extensionsQty: number
  lastPost: Date
  profileUrl: string
  totalComments: number
  totalRating: number
  downloads: number
}

// Social platforms supported by the backend; extend the backend enum to add new ones.
export type SocialPlatform =
  // Gaming
  | 'discord'
  | 'steam'
  // Dev / Open Source
  | 'github'
  | 'gitlab'
  // General
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'reddit'
  | 'website'

// Backend ContrInfoResponseDto, nested inside ContributorResponseDto.contrInfo.
export interface ContrInfoResponseDto {
  username: string
  imgUrl: string
  bio: string
  postsQty: number
  videogamesQty: number
  extensionsQty: number
  lastPost: string | null
  /** @deprecated Use socials.github / socials.gitlab instead */
  profileUrl: string
  totalComments: number
  totalRating: number
  downloads: number
  // Absent keys mean the social link is not set.
  socials: Partial<Record<SocialPlatform, string>>
}

// Backend ContributorResponseDto: profile data (username, imgUrl, bio, socials) lives in contrInfo, not at the root.
export interface ContributorResponseDto {
  id: string
  userId: string
  email: string
  isReviewer: boolean
  isActive: boolean
  platforms: Array<{ id: number; name: string; icon: string[] }>
  contrInfo: ContrInfoResponseDto
  createdAt: string
  updatedAt: string
}

// Flattened contributor view used in ContrCard: contrInfo fields hoisted to the root.
export interface ContributorCardDto {
  id: string
  userId: string
  username: string
  imgUrl: string | null
  bio: string
  postsQty: number
  videogamesQty: number
  extensionsQty: number
  totalRating: number
  totalComments: number
  downloads: number
  lastPost: string | null
  socials: Partial<Record<SocialPlatform, string>>
}

export interface UpdateContrInfoPayload {
  username?: string
  imgUrl?: string
  bio?: string
  profileUrl?: string
  socials?: Partial<Record<SocialPlatform, string>>
}
