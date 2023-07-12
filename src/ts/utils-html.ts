


export function html(tmpl: string) {
	const template = document.createElement("template");
	if (tmpl) {
		template.innerHTML = tmpl;
	}
	return template.content;
}