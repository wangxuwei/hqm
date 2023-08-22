import NiceModal from '@ebay/nice-modal-react';
import React from "react";
import ReactDOM from "react-dom/client";
import "./main.pcss";
import { SYMBOLS } from './ts/svg-symbols';
import { html } from './ts/utils-html';
import App from "./views/App";


document.addEventListener("DOMContentLoaded", function (event) {
	const svgEl = html(SYMBOLS).firstElementChild!;
	svgEl.setAttribute('style', 'display: none'); // in case dom engine move it to body
	document.head.appendChild(svgEl);

	ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<NiceModal.Provider>
			<App />
			</NiceModal.Provider>
		</React.StrictMode>
	);
});