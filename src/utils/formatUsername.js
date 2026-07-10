export const formatUsername = (username) => {
  if (username === undefined) {
    return undefined
  }
  return username.includes(' ') ? username.split(' ').splice(0, 2).join(' ') : username
}
