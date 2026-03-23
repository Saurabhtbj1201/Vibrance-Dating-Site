import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API client to use backend server
setBaseUrl(
	(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, ""),
);

createRoot(document.getElementById("root")!).render(<App />);
