import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API client to use backend server
// Set the base URL for the API client to point to the current origin (since API is hosted on the same domain in Vercel)
setBaseUrl(import.meta.env.VITE_BACKEND_URL || window.location.origin);


createRoot(document.getElementById("root")!).render(<App />);
