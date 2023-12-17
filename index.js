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
		console.log({ width, height });
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
	sortingButton.innerText === 'trending_up'
		? (sortingButton.innerText = 'trending_down')
		: (sortingButton.innerText = 'trending_up');
	sortAsc = !sortAsc;
	doTheThing();
});

const doTheThing = async (textAreaIsChanged = false) => {
	const TF1V = fieldName.value;
	let TF2V = fieldImages.value;
	const wrapper = document.querySelector('.images');
	wrapper.innerHTML = '';

	const name = TF1V;

	if (TF1V == '' || TF2V == '') {
		wrapper.innerText = 'Please fill character name and images links first';

		return;
	}

	let input = TF2V.split('\n');
	if (sortAsc) {
		input.reverse();
	}

	for (let i = 0; i < input.length; i++) {
		try {
			input[i] = input[i].replace(/\*|<|>/g, '');
			const number = input[i].split('.')[0];
			let link = input[i].split(' ')[1];
			const type =
				link.endsWith('png') || link.endsWith('jpg')
					? 'Image'
					: link.endsWith('gif')
					? 'gif'
					: 'Probably something bad but not THAT bad';

			console.log(type);
			if (link && link.startsWith('http')) {
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

				// if (textAreaIsChanged) {

				if (type === 'Image') {
					const observer = new IntersectionObserver(
						(entries, observer) => {
							entries.forEach((entry) => {
								if (entry.isIntersecting) {
									const lazyImg = entry.target;
									lazyImg.src = lazyImg.getAttribute('data-src');
									observer.unobserve(lazyImg);
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

	if (wrapper.childNodes.length === 0) {
		wrapper.innerText = 'There could be something wrong with links...';
	}
};

fieldName.addEventListener('input', doTheThing);
fieldImages.addEventListener('input', () => {
	doTheThing(true);
});
doTheThing();
