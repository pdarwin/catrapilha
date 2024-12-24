import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get("/config.json"); // Ensure config.json is in public/
        if (res.status !== 200) {
          throw new Error("Failed to fetch config.json");
        }
        const data = await res.data;
        setConfig(data);
      } catch (err) {
        console.error("Error loading config:", err);
        setError(err);
      }
    };

    fetchConfig();
  }, []);

  if (error) {
    return <div>Error loading configuration.</div>; // You can customize this
  }

  if (!config) {
    return <div>Loading configuration...</div>; // Or a spinner
  }

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};
