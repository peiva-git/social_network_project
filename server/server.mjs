import {
    addFollowFromUsernameToUser,
    addLikeToMessage,
    authenticateUser,
    createNewMessage,
    createNewUser,
    getMessageFromUser,
    getMessagesFromUser,
    getUserInfo,
    getDetailedUserInfo,
    getUsersFeed,
    removeFollowFromUsernameToUser,
    removeLikeFromMessage,
    searchUsers,
    getUsersFollowers
} from "./mongodb.mjs";

import * as dotenv from "dotenv";
import express from "express";
import {expressjwt} from "express-jwt";
import {body, validationResult} from "express-validator";
import cookieParser from "cookie-parser";

const app = express();
const port = 8080;

const SIGNUP_URI = "/api/auth/signup";

function error(error, details) {
    return {
        message: error,
        details: details
    };
}

const unauthorizedErrorMessage = "UnauthorizedError";

function getTokenFromHeaderOrCookie(req) {
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    } else {
        throw Error(unauthorizedErrorMessage);
    }
}

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/api/social/messages",
    expressjwt({
        secret: process.env.TOKEN_SECRET,
        algorithms: ["HS256"],
        credentialsRequired: false,
        getToken: getTokenFromHeaderOrCookie}).unless({
        method: "GET"
    }));
app.use("/api/social/followers/:id", expressjwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: getTokenFromHeaderOrCookie}));
app.use("/api/social/feed", expressjwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: getTokenFromHeaderOrCookie}));
app.use("/api/social/like/:messageId", expressjwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: getTokenFromHeaderOrCookie}));
app.use("/api/social/whoami", expressjwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: getTokenFromHeaderOrCookie}));
app.use((err, req, res, next) => {
    if (err.message === unauthorizedErrorMessage) {
        res.status(401).send({message: "Invalid request token"});
    } else {
        next(err);
    }
});

app.post(SIGNUP_URI,
    body("name").isString(),
    body("surname").isString(),
    body("bio").isString(),
    body("username").isString(),
    body("password").isString(),
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const newUser = {
        name: req.body.name,
        surname: req.body.surname,
        bio: req.body.bio,
        username: req.body.username,
        password: req.body.password
    };
    createNewUser(newUser).then(token => {
        if (token) {
            res.status(200);
            res.send({token: token});
        } else {
            res.status(400);
            res.send({error: "The given username is already in use"});
        }
    }).catch((reason) => {
        res.status(500);
        res.send(error("Unable to create new user", reason));
    });
});

app.post("/api/auth/signin",
    body("username").isString(),
    body("password").isString(),
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const username = req.body.username;
    const password = req.body.password;
    authenticateUser(username, password).then(token => {
        if (token) {
            res.status(200);
            res.send({token: token});
        } else {
            res.status(400);
            res.send({message: "Invalid credentials"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while authenticationg user", reason));
    });
});

app.get("/api/social/users/:id", (req, res) => {
    const userId = req.params.id;
    getUserInfo(userId).then(user => {
        if (user) {
            res.status(200);
            res.send(user);
        } else {
            res.status(204);
            res.send({message: "No user found for the given id"});
        }
    }).catch((reason) => {
        res.status(500);
        res.send(error("Error while getting user info", reason));
    });
});

app.post("/api/social/messages",
    body("text").isString(),
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const newMessage = {
        date: new Date(),
        text: req.body.text,
        likes: [],
        sender: req.auth.userId
    };
    createNewMessage(newMessage).then(result => {
        if (result) {
            res.status(200);
            res.send(result);
        } else {
            res.status(500);
            res.send({error: "Unable to create new message"});
        }
    }).catch((reason) => {
        res.status(500);
        res.send(error("Unable to create new message", reason));
    });
});

app.get("/api/social/messages/:userId", (req, res) => {
    const userId = req.params.userId;
    getMessagesFromUser(userId).then(messages => {
        if (messages.length > 0) {
            res.status(200);
            res.json(messages);
        } else {
            res.status(204);
            res.send({message: "No messages found for the given id"});
        }
    }).catch((reason) => {
        res.status(500);
        res.send(error("Error while getting user messages", reason));
    });
});

app.get("/api/social/messages/:userId/:messageId", (req, res) => {
    const userId = req.params.userId;
    const messageId = req.params.messageId;
    getMessageFromUser(userId, messageId).then(result => {
        if (result) {
            res.status(200);
            res.send(result);
        } else {
            res.status(204);
            res.send({message: "No message found for the given IDs"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while getting user message", reason));
    });
});

app.get("/api/social/followers/:id", (req, res) => {
    const userId = req.params.id;
    getUsersFollowers(userId).then(followers => {
        if (followers) {
            if (followers.length > 0) {
                res.status(200);
                res.send(followers);
            } else {
                res.status(204);
                res.send({message: "No followers found for the given user"});
            }
        } else {
            res.status(204);
            res.send({message: "No user found for the given ID"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while getting user info", reason));
    });
});

app.post("/api/social/followers/:id", (req, res) => {
    const userId = req.params.id;
    const followingUsername = req.auth.username;
    if (req.auth.userId === userId) {
        res.status(400);
        res.send({message: "User not allowed to follow her/himself"});
        return;
    }
    addFollowFromUsernameToUser(followingUsername, userId).then(result => {
        if (result) {
            res.status(200);
            res.send({message: "Follow added to specified user ID"});
        } else {
            res.status(204);
            res.send({message: "No users found for the given IDs"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while adding follow to given user ID", reason));
    });
});

app.delete("/api/social/followers/:id", (req, res) => {
    const userId = req.params.id;
    const unfollowingUsername = req.auth.username;
    removeFollowFromUsernameToUser(unfollowingUsername, userId).then(result => {
        if (result) {
            res.status(200);
            res.send({message: "Follow removed from the specified user ID"});
        } else {
            res.status(204);
            res.send({message: "No users found for the given IDs"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while removing follow from the given user ID", reason));
    });
});

app.get("/api/social/feed", (req, res) => {
    const username = req.auth.username;
    getUsersFeed(username).then(messages => {
        if (messages && messages.length > 0) {
            res.status(200);
            res.send(messages);
        } else {
            res.status(204);
            res.send({message: "No messages found for given username"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while getting user's feed", reason));
    });
});

app.post("/api/social/like/:messageId", (req, res) => {
    const messageId = req.params.messageId;
    const username = req.auth.username;
    addLikeToMessage(messageId, username).then(() => {
        res.status(200);
        res.send({message: "Number of likes updated"});
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while incrementing number of likes", reason));
    });
});

app.delete("/api/social/like/:messageId", (req, res) => {
    const messageId = req.params.messageId;
    const username = req.auth.username;
    removeLikeFromMessage(messageId, username).then(() => {
        res.status(200);
        res.send({message: "Number of likes updated"});
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while decrementing number of likes", reason));
    });
});

app.get("/api/social/search", (req, res) => {
    const query = req.query;
    searchUsers(query.q).then(users => {
        if (users && users.length > 0) {
            res.status(200);
            res.send(users);
        } else {
            res.status(204);
            res.send({message: "No users found for the specified query string"});
        }
    }).catch(reason => {
        res.status(500);
        console.log(reason);
        res.send(error("Error while searching for users", reason));
    });
});

app.get("/api/social/whoami", (req, res) => {
    const username = req.auth.username;
    getDetailedUserInfo(username).then(user => {
        if (user) {
            res.status(200);
            res.send(user);
        } else {
            res.status(204);
            res.send({message: "No user found for the given username"});
        }
    }).catch(reason => {
        res.status(500);
        res.send(error("Error while getting user's info", reason));
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});