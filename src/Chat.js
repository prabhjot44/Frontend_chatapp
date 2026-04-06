import React, { useEffect, useState, useCallback, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const chatBodyRef = useRef(null);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const time =
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes();

      const messageId = `${socket.id}-${Date.now()}`;

      await socket.emit("send_message", {
        message: currentMessage,
        userName: username,
        roomName: room,
        time: time,
        messageId: messageId,
      });

      setCurrentMessage("");
    }
  };

  // Update a message's status by messageId
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessageList((list) =>
      list.map((msg) =>
        msg.messageId === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  useEffect(() => {
    // Receive message
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);

      // If the message is from someone else, acknowledge delivery
      if (data.userName !== username) {
        socket.emit("message_delivered", {
          messageId: data.messageId,
          roomName: room,
        });
      }
    });

    // Message sent confirmation
    socket.on("message_sent", (data) => {
      updateMessageStatus(data.messageId, "sent");
    });

    // Message delivered
    socket.on("message_delivered", (data) => {
      updateMessageStatus(data.messageId, "delivered");
    });

    // Message seen
    socket.on("message_seen", (data) => {
      updateMessageStatus(data.messageId, "seen");
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("message_delivered");
      socket.off("message_seen");
    };
  }, [socket, username, room, updateMessageStatus]);

  // Emit "message_seen" when the chat window is focused/visible
  useEffect(() => {
    const handleFocus = () => {
      // Mark all unread messages from others as seen
      messageList.forEach((msg) => {
        if (msg.userName !== username && msg.status !== "seen") {
          socket.emit("message_seen", {
            messageId: msg.messageId,
            roomName: room,
          });
        }
      });
    };

    window.addEventListener("focus", handleFocus);

    // Also mark as seen when new messages arrive and window is focused
    if (document.hasFocus()) {
      handleFocus();
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [messageList, socket, username, room]);

  // Render status indicator for your own messages
  const renderStatus = (status) => {
    switch (status) {
      case "sent":
        return <span className="msg-status sent" title="Sent">✓</span>;
      case "delivered":
        return <span className="msg-status delivered" title="Delivered">✓✓</span>;
      case "seen":
        return <span className="msg-status seen" title="Seen">✓✓</span>;
      default:
        return <span className="msg-status sending" title="Sending">○</span>;
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body" ref={chatBodyRef}>
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            const isYou = username === messageContent.userName;
            return (
              <div
                key={messageContent.messageId || index}
                className="message"
                id={isYou ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.userName}</p>
                    {isYou && renderStatus(messageContent.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
