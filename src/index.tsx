// import React from "react";
// import { createRoot } from "react-dom/client";

// import App from "./App";
// import ReactDOM from "react-dom";
import React from "react";
import ReactDOM from "react-dom/client";
//import App from "./App";
import { App } from "./App"; // <-- use curly braces for named export
import { ThemeProvider } from "./contexts/ThemeContext";

//const container = document.getElementById("root") as HTMLElement;
//const root = createRoot(container);

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
ReactDOM.createRoot(document.getElementById("root")!).render(
 <ThemeProvider>  <React.StrictMode>
    <App />
  </React.StrictMode>
  </ThemeProvider>
);