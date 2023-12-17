var fieldName = document.getElementById('fieldName');
var fieldImages = document.getElementById('fieldImages');

function copyContent(content, area) {
	// Create a temporary textarea element
	const textarea = document.createElement('textarea');
	textarea.value = content;
	document.body.appendChild(textarea);

	textarea.select();
	document.execCommand('copy');

	if (area) {
		area.innerText = 'Copied!';
		setTimeout(() => {
			area.innerText = textarea.value;
		}, 2000);
	}

	document.body.removeChild(textarea);
}

function convertToProxyUrl(originalUrl) {
	const encodedUrl = encodeURIComponent(originalUrl);

	const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodedUrl}`;

	return proxyUrl;
}
const sortingButton = document.querySelector('.sortingButton');

let sortAsc = true;
sortingButton.addEventListener('click', () => {
	sortingButton.innerText === 'trending_up'
		? (sortingButton.innerText = 'trending_down')
		: (sortingButton.innerText = 'trending_up');
	sortAsc = !sortAsc;
	doTheThing();
});
const doTheThing = () => {
	const TF1V = fieldName.value;
	let TF2V = fieldImages.value;
	const wrapper = document.querySelector('.images');
	wrapper.innerHTML = '';

	if (TF1V == '' || TF2V == '') {
		wrapper.innerText = 'Please fill character name and images links first';

		return;
	}

	const name = TF1V;
	let input = TF2V.split('\n');
	if (sortAsc) {
		input.reverse();
	}

	for (let i = 0; i < input.length; i++) {
		input[i] = input[i].replace(/\*|<|>/g, '');
		const number = input[i].split('.')[0];
		let link = input[i].split(' ')[1];

		if (link && link.startsWith('http')) {
			const imgWrap = document.createElement('div');

			if (link.includes('mudae')) {
				link = convertToProxyUrl(link);
			}

			const img = document.createElement('img');
			img.src = link;
			img.alt = name;

			imgWrap.classList.add('imageContainer');
			const text = document.createElement('span');
			text.innerText = `$c ${name} $ ${number}`;
			text.classList.add('textContent');
			text.title = 'Click to copy';

			text.addEventListener('click', () => {
				copyContent(text.innerText, text);
			});
			imgWrap.appendChild(img);
			imgWrap.appendChild(text);
			wrapper.appendChild(imgWrap);

			let fontSize = window.getComputedStyle(text, null).getPropertyValue('font-size').match(/\d+/)[0];
			while (text.offsetHeight > 55) {
				fontSize--;
				text.style.setProperty('font-size', fontSize + 'px');
				if (fontSize <= 10) break;
			}
		}
	}

	if (wrapper.childNodes.length === 0) {
		wrapper.innerText = 'There could be something wrong with links...';
	}
};

fieldName.addEventListener('input', doTheThing);
fieldImages.addEventListener('input', doTheThing);
doTheThing();
