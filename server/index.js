const database = require("mongoose");
const dotenv = require("dotenv");
var cors = require("cors");
const express = require("express");
const { logRequests } = require("./Routes/middlewares");
const http = require("http");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

var path = require("path");
global.expressServerRoot = path.resolve(__dirname);

//import Routes
const LiveChatRoutes = require("./Routes/LiveChatRoutes");
const AuthRoutes = require("./Routes/AuthRoutes");
const IdentityRoutes = require("./Routes/IdentityRoutes");

//initiate dotenv
dotenv.config();

database.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log("connected to db..."));
database.connection.on("connected", function () {
	console.log("Mongoose default connection is open to ", process.env.DB_CONNECT);
});

database.connection.on("error", function (err) {
	console.log("Mongoose default connection has occured " + err + " error");
});

database.connection.on("disconnected", function () {
	console.log("Mongoose default connection is disconnected");
});

process.on("SIGINT", function () {
	database.connection.close(function () {
		console.log("Mongoose default connection is disconnected due to application termination");
		process.exit(0);
	});
});

app.prepare().then(() => {
	const expressServer = express();
	const httpServer = http.createServer(expressServer);
	const io = new Server(httpServer, {
		path: "/live",
		cors: {
			origin: process.env.NEXT_PUBLIC_SERVER_URL,
			methods: ["GET", "POST"],
			credentials: true,
		},
		maxHttpBufferSize: 10e6,
		transports: ["websocket"],
	});

	//Middlewares body parser
	expressServer.use(express.json({ limit: "10mb" }));
	// need cookieParser middleware before we can do anything with cookies
	expressServer.use(cookieParser());
	expressServer.use(
		cors({
			origin: [process.env.NEXT_PUBLIC_SERVER_URL],
		})
	);

	//route middlewares
	expressServer.use("/api/chat/enablement", LiveChatRoutes);
	expressServer.use("/api/admin/", AuthRoutes);
	expressServer.use("/api/chat/identity", IdentityRoutes);

	// api.[Domain]/api/is/alive
	expressServer.get("/api/is/alive", logRequests, async (request, response) => {
		const { body } = request;
		response.status(200).send({ status: 200, message: "Server is up and running, status is healthy" });
	});

	// api.[Domain]/api/setToken
	expressServer.post("/api/setToken", logRequests, async (request, response) => {
		const { body } = response;
		// create and assign token
		const token = jwt.sign({ _id: user._id }, process.env.JWT_TOEKN_SECRET);
	});

	expressServer.all("*", (req, res) => {
		return handle(req, res);
	});

	// Socket.io configuration
	var chattersPool = [];
	io.on("connection", (socket) => {
		const pairNewUser = (personA) => {
			chattersPool.map((user, index) => {
				if (!user.actionData.pairFound && user.socketId !== personA.socketId) {
					socket.to(user.socketId).emit("CLIENT_PAIRED", { action: "CLIENT_PAIRED", pairedPersonData: personA });
					socket.to(personA.socketId).emit("CLIENT_PAIRED", { action: "CLIENT_PAIRED", pairedPersonData: user });
					user.actionData.pairFound = true;
				}
			});
		};

		socket.on("CLIENT_INTRODUCTION", (data) => {
			const userAlreadyPresent = chattersPool.filter((user, index) => user.socketId === data.socketId).length > 0;
			if (!userAlreadyPresent) chattersPool = [...chattersPool, data];
			pairNewUser(data);
		});

		socket.on("PEER_STARTED_TYPING", (data) => {
			//console.log("PEER_STARTED_TYPING", data);
			socket.to(data.actionData.pairedPersonSocketId).emit("PEER_STARTED_TYPING", { typing: data.actionData.typing });
		});

		socket.on("PEER_STOPPED_TYPING", (data) => {
			//console.log("PEER_STOPPED_TYPING", data);
			socket.to(data.actionData.pairedPersonSocketId).emit("PEER_STOPPED_TYPING", { typing: data.actionData.typing });
		});

		socket.on("SEND_MESSAGE", (data) => {
			data.actionData.chatData.type = "received";
			data.actionData.chatData.newlyAdded = true;
			data.actionData.chatData.msg = data.actionData.chatData.isImage ? data.actionData.chatData.msg.toString("base64") : data.actionData.chatData.msg;
			console.log("SEND_MESSAGE", Buffer.byteLength(JSON.stringify(data)));
			socket.to(data.actionData.pairedPersonSocketId).emit("SEND_MESSAGE", { chatData: data.actionData.chatData });
		});

		socket.on("disconnecting", (reason) => {
			console.log("User disconnected with socketId :: ", socket.id, reason);
		});
	});

	httpServer.listen(8080, "0.0.0.0", (err) => {
		if (err) {
			console.log("Server ERR :: ", err);
			return;
		}
		console.log("Server up and running on 8080");
	});
});
