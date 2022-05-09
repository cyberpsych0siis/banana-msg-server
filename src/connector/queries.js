export default {
    "registerUser": "INSERT INTO users (username, password, publickey) VALUES (:username, :pw, :b64publickey)",
    "checkUsername": "SELECT password, userId FROM users WHERE username = :username",
    "doesUserExist": "SELECT EXISTS(SELECT 1 FROM users WHERE username = :username) as ex"
}