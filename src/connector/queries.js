export default {
    "registerUser": "INSERT INTO users (username, password, publickey) VALUES (:username, :pw, :b64publickey)",
    "checkUsername": "SELECT password, userId FROM users WHERE username = :username",
    "doesUserExist": "SELECT EXISTS(SELECT 1 FROM users WHERE username = :username) as ex",
    "selectMessagesForUser": "SELECT fromUser, textBody, timestamp FROM messages WHERE toUser = :forUser AND status = 1",
    "sendMessageToLocalUserInbox": "INSERT INTO messages (fromUser,  toUser, textBody, status, timestamp) VALUES (:fromUser, :toUser,  :textBody, 1, :timestamp)",
    "setChecked": "UPDATE messages SET status = 2 WHERE status = 1 AND toUser = :forUser"
}