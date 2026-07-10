const updateRepoReleases = (currentReleases, selectedForReview) => {
  const updatedReleases = currentReleases.map((release) => {
    selectedForReview.forEach((reviewer) => {
      let newStatuses = release.statuses === undefined ? [] : [...release.statuses]
      const status = {
        releaseId: release.id,
        reviewerId: reviewer.userId,
        isReviewed: false,
        isSafe: false,
        reviewData: null
      }
      newStatuses.push(status)
      release.statuses = newStatuses
    })
    return release
  })
  return updatedReleases
}

export default updateRepoReleases
