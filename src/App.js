import "./App.css";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import Header from "./components/layout/Header";

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
  <div className="app-container">
    <Header />

    <main className="main-content">
      {!showChat ? (
        <div className="join-card">
          <h2>Join Chat Room</h2>

          <input
            type="text"
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter room ID"
            onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={joinRoom}>Join Chat</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </main>
  </div>
);
}

export default App;