const areaNoteInput = document.querySelector('#fieldImages');
const noteWrapper = document.querySelector('#noteWrapper');

const respectLimitationsCheckbox = document.querySelector('#respectLimitations');
const nitroCheckbox = document.querySelector('#nitro');

let respectLimitations = respectLimitationsCheckbox.checked;
let nitro = respectLimitationsCheckbox.checked;

[respectLimitationsCheckbox, nitroCheckbox].forEach((element) => {
	element.addEventListener('input', () => {
		respectLimitations = respectLimitationsCheckbox.checked;
		nitro = nitroCheckbox.checked;
		separateNotes();
	});
});

const fetchText = async (path) => {
	let answer;
	await fetch(path)
		.then((responce) => responce.text())
		.then((data) => (answer = data));
	return answer;
};
const separateNotes = async () => {
	let maxLength = 1000000;

	if (respectLimitations) {
		if (nitro) {
			maxLength = 4000;
		} else maxLength = 2000;
	}
	// const noteListDefault = await fetchText('../ignore/noteList.txt');

	const noteList = areaNoteInput.value.length != 0 ? areaNoteInput.value : await fetchText('../ignore/noteList.txt');

	noteWrapper.innerHTML = '';
	const listArray = noteList.split('\n');

	const noteArrays = {};

	listArray.forEach((e) => {
		const note = e.split('|');

		if (note && note.length > 1) {
			const char = note[0].trim();
			const _note = note[1].trim();

			if (noteArrays[_note]) {
				noteArrays[_note].push(char);
			} else {
				noteArrays[_note] = [char];
			}
		}
	});

	console.log(noteArrays);

	for (const note in noteArrays) {
		// if (noteArrays.hasOwnProperty(note)) {
		// 	const values = noteArrays[note];

		// 	// Combine values into a single string with separators
		// 	const fullText = '$n ' + values.join(' $ ') + ' $ ' + note;

		// 	// Calculate how many messages are needed
		// 	const numMessages = Math.ceil(fullText.length / maxLength);

		// 	for (let i = 0; i < numMessages; i++) {
		// 		const startIdx = i * maxLength;
		// 		const endIdx = (i + 1) * maxLength;
		// 		const partialText = fullText.substring(startIdx, endIdx);

		// 		const textarea = document.createElement('code');
		// 		textarea.innerText = partialText.trim();
		// 		textarea.classList.add('notes');
		// 		noteWrapper.appendChild(textarea);
		// 	}
		// }
		if (noteArrays.hasOwnProperty(note)) {
			const values = noteArrays[note];

			const separator = ' $ ';
			const header = `$n ${values[0]} ${values.length > 1 ? ' $ ' : ''}`;
			const valuesString = values.slice(1).join(separator);

			let fullText = header + valuesString;
			const messages = [];

			// Split the fullText into messages with maxLength limit
			while (fullText.length > 0) {
				const currentMessage = fullText.substring(0, maxLength);
				fullText = fullText.substring(currentMessage.length);
				messages.push(currentMessage.trim());
			}

			messages.forEach((message, index) => {
				const textarea = document.createElement('code');
				textarea.innerText = message + ' $ ' + note;
				textarea.classList.add('notes');
				noteWrapper.appendChild(textarea);

				console.log(`Message ${index + 1}: ${message}`);
			});

			console.log(
				`Text is split into ${messages.length} ${messages.length > 1 ? 'messages' : 'message'} under ${
					nitro ? 'nitro' : 'basic'
				} message length limitation: ${fullText.length}/${maxLength}`
			);
		}
	}
};

areaNoteInput.addEventListener('input', () => separateNotes());

separateNotes();

function createStringsLimitedSize(string, maxSize) {
	const result = [];
	let currentString = '';

	for (const str of string) {
		if (currentString.length + str.length < maxSize) {
			currentString += str;
		} else {
			result.push(currentString);
			currentString = str;
		}
	}

	if (currentString.length > 0) {
		result.push(currentString);
	}

	return result;
}
