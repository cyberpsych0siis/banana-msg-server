export default {
    "registerUser": "INSERT INTO users (username, password, publickey) VALUES (:username, :pw, :b64publickey)",
    "checkUsername": "SELECT password, userId FROM users WHERE username = :username",
    "doesUserExist": "SELECT EXISTS(SELECT 1 FROM users WHERE username = :username) as ex",
    "selectMessagesForUser": "SELECT fromUser, textBody, timestamp FROM messages WHERE toUser = :forUser AND status = 1",
    "selectMessagesForUser": "SELECT fromUser, textBody, timestamp FROM messages WHERE toUser = :forUser AND status = 1",
    "setChecked": "UPDATE messages SET status = 2 WHERE messageId = :messageId",
    "webfinger": "SELECT username FROM users WHERE username = :username",
    "getPubkey": "SELECT publickey FROM users WHERE username = :username",

    "sendMessageToLocalUserInbox": "INSERT INTO messages (fromUser,  toUser, textBody, status, timestamp) VALUES (:fromUser, :toUser, :textBody, 1, :timestamp)",
    "addMessageToLocalConvo": "INSERT INTO messages(conversationId, fromUser, textBody, timestamp) VALUES (:conversationId, :fromUser, :textBody, :timestamp)",
    "createNewLocalConvo": "INSERT INTO conversations (startedBy) VALUES(:startedBy)",
    "addUserToLocalConvo": "INSERT INTO users_in_conversation(conversationId, userUri) VALUES(:conversationId, :userUri)",
    "doesConvoExist": "SELECT EXISTS(SELECT * FROM conversations WHERE conversations.conversationId = :conversationId) as ex",
    "doesUserParticipateInConversation": "SELECT EXISTS(SELECT * FROM users_in_conversation WHERE conversationId = :convId AND userUri = :userUri) as ex",
    "getMessagesForUser": "SELECT messages.conversationId, messages.messageId, messages.fromUser, messages.textBody, messages.timestamp, messages.attachmentId, messages.status FROM messages WHERE messages.conversationId IN (SELECT users_in_conversation.conversationId FROM users_in_conversation WHERE userUri = :userUri) AND messages.status = 1 ORDER BY timestamp DESC"
}