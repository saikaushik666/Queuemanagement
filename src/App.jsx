import React, { useEffect, useState } from "react";

function App() {
  const [countdown, setCountdown] = useState("Connecting...");
  const [socket, setSocket] = useState(null);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    let ws = new WebSocket("ws://127.0.0.1:8000/ws/queue/");

    ws.onopen = () => {
      console.log("WebSocket connection established.");

      fetch("/api/estimate-travel-time/?lat=40.7128&lng=-74.0060") // Example coordinates
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data.travel_time) {
            ws.send(
              JSON.stringify({ message: "User connected", wait_time: data.travel_time })
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching travel time:", error);
        });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.wait_time) {
          startCountdown(data.wait_time);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    setSocket(ws);

    return () => {
      if (ws) ws.close();
      if (timer) clearInterval(timer);
    };
  }, []);

  const startCountdown = (waitTime) => {
    let timeLeft = waitTime;
    const interval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(interval);
        setCountdown("It's your turn!");
      } else {
        timeLeft--;
        setCountdown(`Time left: ${timeLeft} seconds`);
      }
    }, 1000);
    setTimer(interval);
  };

  return (
    <div>
      <h1>Virtual Queue System</h1>
      <div id="countdown">{countdown}</div>
    </div>
  );
}

export default App;
