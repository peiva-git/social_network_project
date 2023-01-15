import {MongoClient, ObjectId} from "mongodb";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const mongoUri = "mongodb://mongo:27017";

const dbName = "programmazionewebdb";
const usersCollection = "users";
const messagesCollection = "messages";

export async function createNewUser(user) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const foundUser = await findOneUserByUsername(user.username);
        if (!foundUser) {
            const salt = crypto.randomBytes(64).toString("hex");
            const hash = crypto.createHash("sha256").update(user.password + salt).digest("hex");
            const result = await client.db(dbName).collection(usersCollection).insertOne({
                name: user.name,
                surname: user.surname,
                username: user.username,
                bio: user.bio,
                followers: [],
                salt: salt,
                hash: hash,
            });
            const token = jwt.sign({username: user.username, userId: result.insertedId}, process.env.TOKEN_SECRET);
            await client.db(dbName).collection(usersCollection).updateOne({username: user.username}, {$set: {token: token}});
            return token;
        }
    } catch (e) {
        console.error(e);
        throw "Couldn't create new user: " + e.message;
    } finally {
        await client.close();
    }
}

export async function authenticateUser(username, password) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const user = await client.db(dbName).collection(usersCollection).findOne({username: username});
        if (!user) {
            return null;
        }
        const receivedHash = crypto.createHash("sha256").update(password + user.salt).digest("hex");
        if (receivedHash === user.hash) {
            return user.token;
        } else {
            return null;
        }
    } catch (e) {
        console.error(e);
        throw "Couldn't authenticate user: " + e.message;
    } finally {
        await client.close();
    }
}

export async function getUserInfo(userId) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(usersCollection).find({_id: ObjectId(userId)}).project({
            name: 1,
            surname: 1,
            username: 1,
            bio: 1
        }).next();
    } catch (e) {
        console.error(e);
        throw "Couldn't get user info: " + e.message;
    } finally {
        await client.close();
    }
}

export async function getMessagesFromUser(userId) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const cursor = await client.db(dbName).collection(messagesCollection).find({sender: ObjectId(userId)}).project({
            text: 1,
            date: 1,
            likes: 1
        });
        const messages = await cursor.toArray();
        await cursor.close();
        return messages;
    } catch (e) {
        console.error(e);
        throw "Couldn't get user messages: " + e.message;
    } finally {
        await client.close();
    }
}

export async function createNewMessage(message) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        message.sender = ObjectId(message.sender);
        return await client.db(dbName).collection(messagesCollection).insertOne(message);
    } catch (e) {
        console.error(e);
        throw "Couldn't create new message: " + e.message;
    } finally {
        await client.close();
    }
}

export async function getMessageFromUser(userId, messageId) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(messagesCollection).findOne(
            {
                sender: ObjectId(userId),
                _id: ObjectId(messageId)
            });
    } catch (e) {
        console.error(e);
        throw "Couldn't get user message: " + e.message;
    } finally {
        await client.close();
    }
}

export async function getUsersFollowers(userId) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const cursor = client.db(dbName).collection(usersCollection).find({
            _id: ObjectId(userId)
        }).project({
            followers: 1,
            _id: 0
        });
        const users = await cursor.toArray();
        await cursor.close();
        // only one user found for the given ID anyway
        return users[0].followers;
    } catch (e) {
        console.error(e);
        throw "Couldn't find user's followers: " + e.message;
    } finally {
        await client.close();
    }
}

export async function addFollowFromUsernameToUser(username, userId) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(usersCollection).updateOne({
            _id: ObjectId(userId)
        }, {
            $push: {followers: username}
        });
    } catch (e) {
        console.error(e);
        throw "Couldn't add follower to the given user: " + e.message;
    } finally {
        await client.close();
    }
}

export async function removeFollowFromUsernameToUser(username, userId) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(usersCollection).updateOne({
            _id: ObjectId(userId)
        }, {
            $pull: {followers: username}
        });
    } catch (e) {
        console.error(e);
        throw "Couldn't remove follower from the given user: " + e.message;
    } finally {
        await client.close();
    }
}

export async function getUsersFeed(username) {
    const client = new MongoClient(mongoUri);
    try {
        const messages = [];
        const usersCursor = await client.db(dbName).collection(usersCollection).find({followers: username});
        for await (const user of usersCursor) {
            const messagesCursor = client.db(dbName).collection(messagesCollection).find({sender: user._id});
            for await (const message of messagesCursor) {
                message.sender = user.username;
                messages.push(message);
            }
        }
        return messages;
    } catch (e) {
        console.error(e);
        throw "Couldn't retrieve user's feed: " + e.message;
    } finally {
        await client.close();
    }
}

export async function addLikeToMessage(messageId, username) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(messagesCollection).updateOne({
                _id: ObjectId(messageId)
            }, {
                $push: {likes: username}
            });
    } catch (e) {
        console.error(e);
        throw "Couldn't increment number of likes: " + e.message;
    } finally {
        await client.close();
    }
}

export async function removeLikeFromMessage(messageId, username) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(messagesCollection).updateOne({
            _id: ObjectId(messageId)
        }, {
            $pull: {likes: username}
        });
    } catch (e) {
        console.error(e);
        throw "Couldn't decrement number of likes: " + e.message;
    } finally {
        await client.close();
    }
}

export async function searchUsers(query) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const formattedQuery = query.toLowerCase().trim();
        const matchedUsers = [];
        let cursor = client.db(dbName).collection(usersCollection).find().project({
            name: 1,
            surname: 1,
            username: 1,
            bio: 1
        });
        for await (const user of cursor) {
            const formattedNameAndSurname = user.name.trim().toLowerCase().concat(user.surname.trim().toLowerCase());
            if (formattedNameAndSurname.includes(formattedQuery)) {
                matchedUsers.push(user);
            }
        }
        return matchedUsers;
    } catch (e) {
        console.error(e);
        throw "Couldn't retrieve searched users: " + e.message;
    } finally {
        await client.close();
    }
}

export async function getDetailedUserInfo(username) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(usersCollection).find({username: username}).project({
            name: 1,
            surname: 1,
            username: 1,
            bio: 1,
            followers: 1,
            token: 1
        }).next();
    } catch (e) {
        console.error(e);
        throw "Couldn't retrieve user info: " + e.message;
    } finally {
        await client.close();
    }
}

async function findOneUserByUsername(username) {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        return await client.db(dbName).collection(usersCollection).findOne({username: username});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
