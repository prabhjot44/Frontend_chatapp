import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const socketServerUrl = process.env.REACT_APP_SOCKET_SERVER_URL;

  console.log(process.env.REACT_APP_SOCKET_SERVER_URL,'socket56')

  const joinRoom = () => {

    if (username !== "" && room !== "") {
      socketServerUrl.emit("join_room", {
        userName:username,
        roomName: room
      });
      setShowChat(true);

      socketServerUrl.on('user_joined', (data) => {
        console.log(data,"data");

        alert(data)

      });

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
        <Chat socket={socketServerUrl} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
