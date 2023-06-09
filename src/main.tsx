import React from "react";
import ReactDOM from "react-dom/client";
import "./main.pcss";
import { webGet } from './ts/web-request';
import App from "./views/App";

const svgSymbolsPromise = webGet("/sprite.svg", { contentType: "application/xml" });

document.addEventListener("DOMContentLoaded", function (event) {
	// we make sure the the ajax for the svg/sprites.svg returns
	svgSymbolsPromise.then(function (xmlDoc) {
		// add the symbols to the head (external linking works but has issues - styling, and caching -)
		const firstChildElement = xmlDoc.firstChildElement || xmlDoc.childNodes[0]; // edge does not seem to have .firstChildElement, at least for xlmDoc
		const h = document.querySelector("head");

		if (h != null) {
			h.appendChild(firstChildElement);
		}

    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  
	});
  
});