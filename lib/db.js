const chats = []

export function saveChat({ userId, query, response, language }) {
  const record = {
    userId,
    query,
    response,
    language,
    createdAt: new Date().toISOString(),
  }
  chats.push(record)
  return record
}

export function getChatsByUser(userId) {
  return chats.filter((c) => c.userId === userId)
}
