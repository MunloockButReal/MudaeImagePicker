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
		let width = area.offsetWidth;
		let height = area.offsetHeight;
		area.style.setProperty('width', width);
		area.style.setProperty('height', height);
		area.innerText = 'Copied!';
		setTimeout(() => {
			area.innerText = textarea.value;
			area.style.removeProperty('width');
			area.style.removeProperty('height');
		}, 2000);
	}

	document.body.removeChild(textarea);
}

function convertToImgur_Imgchest(link) {
	let image = link.includes('mudae.net')
		? link.split('~')[1].length > 12
			? `https://cdn.imgchest.com/files/${link.split('~')[1]}`
			: `https://i.imgur.com/${link.split('~')[1]}`
		: link;

	return image;
}

function convertToProxyUrl(originalUrl) {
	const encodedUrl = encodeURIComponent(originalUrl);

	const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodedUrl}`;
	return proxyUrl;
}

const matchLink = (str) => {
	return str.match(/(https|http):.*\.(gif|png)$/);
};

const sortingButton = document.querySelector('.sortingButton');

let sortAsc = true;
sortingButton.addEventListener('click', () => {
	sortingButton.innerText === 'trending_down'
		? (sortingButton.innerText = 'trending_up')
		: (sortingButton.innerText = 'trending_down');

	const parent = document.querySelector('.images');
	const childrens = parent.childNodes;

	const childrens_reverse = Array.from(childrens).reverse();

	childrens_reverse.forEach((e) => parent.appendChild(e));
	sortAsc = !sortAsc;
});

// If only name changed -> don't rebuild all elements, just change the names
// If only input changed ->
//// If ammount of links the same - just replace source images
//// If it's less - replace images and remove extra
//// If more - replace images and create new needed elements

// WIP

let prevName = '';
let prevImages = '';
let _links = [];

const doTheThing = async () => {
	const TF1V = fieldName.value;
	const TF2V = fieldImages.value;

	const nameChanged = prevName.replace('\n', '') !== TF1V.replace('\n', '').trim();
	const inputChanged = prevImages !== TF2V;

	const wrapper = document.querySelector('.images');

	const name = TF1V;

	let input = TF2V.split('\n');
	if (sortAsc) {
		input.reverse();
	}

	if (inputChanged) {
		let links = [];

		for (let i = 0; i < input.length; i++) {
			let link = input[i].trim().split(' ')[1];
			if (link && matchLink(link)) {
				links.push(input[i]);
			}
		}

		const ammountOfLinksChanged = links.length != _links.length;

		if (ammountOfLinksChanged) {
			_links = links;
			links = [];

			wrapper.innerHTML = '';

			for (let i = 0; i < input.length; i++) {
				try {
					input[i] = input[i].replace(/\*|<|>/g, '');
					const number = input[i].split('.')[0];
					let orinigalImageUrl = input[i].trim().split(' ')[1];

					if (orinigalImageUrl && matchLink(orinigalImageUrl)) {
						const imgWrap = document.createElement('div');

						const imageUrl = convertToImgur_Imgchest(orinigalImageUrl);

						const img = document.createElement('img');
						const uniqueId = crypto.randomUUID();

						img.loading = 'lazy';
						img.src = imageUrl;
						img.id = input[i].match(/^\d+/)[0];
						img.setAttribute('referrerpolicy', 'no-referrer');
						img.setAttribute('uid', uniqueId);

						img.addEventListener('load', (event) => {
							if (event.target.naturalWidth === 161 || event.target.naturalWidth === 0) {
								document.querySelector(`img[uid="${uniqueId}"]`).src = orinigalImageUrl;
							} else {
								const customEvent = new CustomEvent('imageload', {
									detail: {
										name: uniqueId,
									},
								});
								dispatchEvent(customEvent);
							}
						});

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
				} catch (error) {
					console.log(error);
				}
			}
			prevImages = TF2V;
		}
	}

	if (nameChanged) {
		const textContent = document.querySelectorAll('.textContent');

		textContent.forEach((element) => {
			let number = (element.innerText.split('').reverse().join('').match(/\d+/)[0] + '').split('').reverse().join('');
			element.innerText = element.innerText = `$c ${TF1V} $ ${number}`;
		});
		prevName = TF1V;
	}

	if (wrapper.childNodes.length === 0) {
		wrapper.innerText = 'There could be something wrong with links...';
	}
};

fieldName.addEventListener('input', () => doTheThing());
fieldImages.addEventListener('input', () => doTheThing());
doTheThing();
