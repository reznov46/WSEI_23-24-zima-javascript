const fieldsContainer = document.querySelectorAll('#fields')[0];
const resultsContainer = document.querySelectorAll('#results')[0];
const addNewFieldBtn = document.querySelectorAll('#addNew')[0];
const fields = [];

function fieldFactory() {
	const enclosing = createEnclosing();
	const input = createField();
	const remove = createRemoveField(input, enclosing);

	enclosing.appendChild(input);
	enclosing.appendChild(remove);
	fieldsContainer.appendChild(enclosing);
	return input;
}

function createEnclosing() {
	const enclosing = document.createElement('div');
	enclosing.setAttribute('class', 'field');
	return enclosing;
}

function createField() {
	const field = document.createElement('input');
	field.setAttribute('class', `input`);
	field.addEventListener('input', handleInput);
	return field;
}
function createRemoveField(field, enclosing) {
	const removeField = document.createElement('button');
	removeField.setAttribute('type', 'button');
	removeField.setAttribute('class', 'removeField');
	removeField.textContent = 'X';
	removeField.addEventListener('click', () => handleRemove(enclosing, field));
	return removeField;
}

function handleRemove(enclosing, field) {
	fields.splice(fields.indexOf(field), 1);
	enclosing.parentElement.removeChild(enclosing);
	handleInput();
}

function handleInput() {
	resultsContainer.childNodes.forEach((node) => node.parentNode.removeChild(node));

	const values = fields.map((field) => parseInt(field.value));
	if (values.some((value) => isNaN(value))) {
		printToResults('One or more values is empty or invalid!');
		return;
	}

	printToResults(formatResults(calculateResults(values)));
}

function calculateResults(values) {
	const sum = values.reduce((pr, cur) => pr + cur);
	const avg = Math.floor(sum / fields.length);
	const min = Math.min(...values);
	const max = Math.max(...values);
	return { sum, avg, min, max };
}

function formatResults({ sum, avg, min, max }) {
	return `Sum: ${sum} </br> Average: ${avg} </br> Min: ${min}
     </br> Max: ${max}`;
}

function printToResults(message) {
	const paragraph = document.createElement('p');
	paragraph.innerHTML = message;
	resultsContainer.appendChild(paragraph);
}

addNewFieldBtn.addEventListener('click', () => {
	fields.push(fieldFactory());
});

for (let i = 0; i < 3; i++) {
	fields[i] = fieldFactory();
}
