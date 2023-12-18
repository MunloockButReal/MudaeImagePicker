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

function convertToProxyUrl(originalUrl) {
	const encodedUrl = encodeURIComponent(originalUrl);

	const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodedUrl}`;
	return proxyUrl;
}
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

	if (TF1V == '' || TF2V == '') {
		wrapper.innerText = 'Please fill character name and images links first';
		prevImages = '';
		return;
	}

	let input = TF2V.split('\n');
	if (sortAsc) {
		input.reverse();
	}

	if (inputChanged) {
		let links = [];
		const matchLink = (str) => {
			return str.match(/(https|http):.*\.(gif|png)$/);
		};

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
					let link = input[i].trim().split(' ')[1];

					if (link && matchLink(link)) {
						const type =
							link.endsWith('png') || link.endsWith('jpg')
								? 'Image'
								: link.endsWith('gif')
								? 'gif'
								: 'Probably something bad but not THAT bad';

						const imgWrap = document.createElement('div');

						if (link.includes('mudae')) {
							link = convertToProxyUrl(link);
						}

						const img = document.createElement('img');
						if (type === 'Image') {
							img.setAttribute('data-src', link);
						} else {
							img.src = link;
						}

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

						if (type === 'Image') {
							const observer = new IntersectionObserver(
								(entries, observer) => {
									entries.forEach((entry) => {
										if (entry.isIntersecting) {
											const lazyImg = entry.target;
											lazyImg.src = lazyImg.getAttribute('data-src');
											lazyImg.removeAttribute('data-src');
											observer.disconnect();
											// observer.unobserve(lazyImg);

											// console.log(`Image #${number} loaded!`);
										}
									});
								},
								{ root: null, rootMargin: '0px', threshold: 0.01 }
							);
							observer.observe(img);
						}

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
