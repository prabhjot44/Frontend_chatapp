import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

return (
  <header className="header">
    <h1 onClick={() => navigate("/")}>💬 ChatApp</h1>

    <div>
      {user ? (
        <>
          <span>Hi, {user.username}</span>
          <button className="danger" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <button onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="primary"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </>
      )}
    </div>
  </header>
);
};

export default Header;