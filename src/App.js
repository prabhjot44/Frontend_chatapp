import "./App.css";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";

// ✅ ENV URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ✅ FIXED socket connection
const socket = io(API_BASE_URL, {
  transports: ["websocket"], // important for Render
  withCredentials: true,
});

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  // ✅ FIX: listen once (not inside joinRoom)
  useEffect(() => {
    socket.on("user_joined", (data) => {
      console.log(data, "data");
      alert(data);
    });

    // cleanup (important)
    return () => {
      socket.off("user_joined");
    };
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", {
        userName: username,
        roomName: room,
      });

      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>

          <input
            type="text"
            placeholder="John..."
            name="username"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />

          <input
            type="text"
            placeholder="Room ID..."
            name="room"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />

          <button onClick={joinRoom}>Join A Room</button>
        </div>
      ) : (
        <>
        <Chat socket={socket} username={username} room={room} />
        </>
      )}
    </div>
  );
}

export default App;