interface Note {
	title: string;
	content: string;
	color: string;
	createdDate: Date;
	pinned: boolean;
	id: number;
}

class NotepadApp {
	private notes: Note[] = [];
	private storage!: IStorageService<Note>;

	*generator(i: number) {
		let q = i;
		while (true) {
			q++;
			yield q;
		}
	}
	private elo: any;

	constructor(localStorageService: LocalStorageService<Note>) {
		this.storage = localStorageService;
		this.notes = localStorageService.retrieve();
		this.elo = this.generator(
			this.notes.toSorted((a, b) => b.id - a.id)[0]?.id ?? 0
		);
		this.renderNotes();
	}
	private renderNotes() {
		const appDiv = document.getElementById('notes');
		if (appDiv) {
			appDiv.innerHTML = '';
			this.notes
				.toSorted(
					(a, b) =>
						Number(b.pinned) - Number(a.pinned) ||
						b.createdDate.getTime() - a.createdDate.getTime()
				)
				.forEach((note) => {
					const noteDiv = document.createElement('div');
					noteDiv.classList.add('note');
					if (note.pinned) {
						noteDiv.classList.add('pinned');
					}

					noteDiv.innerHTML = `
                    <div style="background-color: ${note.color}">
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <p>Created on: ${new Date(note.createdDate)
											.toISOString()
											.slice(0, 16)
											.replace('T', ' ')}</p>
                    <button onclick="notepadApp.editNoteForm(${
											note.id
										})">Edit</button>
                    <button onclick="notepadApp.deleteNote(${
											note.id
										})">Delete</button>
                    </div>
                `;

					appDiv.appendChild(noteDiv);
				});
		}
	}

	private editNoteId: number | null = null;

	editNoteForm(id: number | null) {
		document.getElementById('noteForm')?.remove();
		this.editNoteId = id;
		const currentNote = this.notes.find((note) => note.id === id);
		const formDiv = document.createElement('div');
		formDiv.innerHTML = `
        <div id="noteForm">
            <h3>${currentNote ? 'Edit' : 'Add'} Note</h3>
            <label for="editTitle">Title:</label>
            <input type="text" id="editTitle" ${
							currentNote ? `value="${currentNote.title}"` : ''
						} required><br>
            <label for="editContent">Content:</label>

            <textarea id="editContent" required ${
							currentNote
								? `>${currentNote.content}`
								: 'placeholder="Enter note content...">'
						} </textarea><br>
            <label for="editColor">Color:</label>
            <input type="color" id="editColor" ${
							currentNote ? `value="${currentNote.color}"` : `value="#ffffff"`
						}  required><br>
            <label for="editPinned">Pinned:</label>
            <input type="checkbox" id="editPinned" ${
							currentNote && currentNote.pinned ? 'checked' : ''
						}><br>
            <button onclick="notepadApp.saveEditedNote()">${
							id !== null ? 'Save' : 'Add'
						}</button>
            <button onclick="notepadApp.cancelEdit()">Cancel</button>
        </div>`;

		const appDiv = document.getElementById('app');
		if (appDiv) {
			appDiv.appendChild(formDiv);
		}
	}

	addNote(
		title: string,
		content: string,
		color: string,
		pinned: boolean = false
	) {
		const id = this.elo.next().value;
		const newNote: Note = {
			title,
			content,
			color,
			createdDate: new Date(),
			pinned,
			id,
		};

		this.notes.push(newNote);
		this.storage.save(this.notes);
		this.renderNotes();
	}

	editNote(
		id: number,
		title: string,
		content: string,
		color: string,
		pinned: boolean
	) {
		let note = this.notes.find((note) => note.id === id);
		let noteIndex = this.notes.findIndex((note) => note.id === id);
		this.notes.splice(noteIndex, 1, {
			...note,
			title,
			content,
			color,
			pinned,
		} as Note);

		this.renderNotes();
		this.storage.save(this.notes);
	}

	deleteNote(id: number) {
		this.notes = this.notes.filter((note) => note.id !== id);
		this.storage.save(this.notes);
		this.renderNotes();
	}

	saveEditedNote() {
		const editTitleInput = document.getElementById(
			'editTitle'
		) as HTMLInputElement;
		const editContentTextarea = document.getElementById(
			'editContent'
		) as HTMLTextAreaElement;
		const editColorInput = document.getElementById(
			'editColor'
		) as HTMLInputElement;
		const editPinnedCheckbox = document.getElementById(
			'editPinned'
		) as HTMLInputElement;

		if (
			editTitleInput &&
			editContentTextarea &&
			editColorInput &&
			editPinnedCheckbox
		) {
			const editedTitle = editTitleInput.value;
			const editedContent = editContentTextarea.value;
			const editedColor = editColorInput.value;
			const editedPinned = editPinnedCheckbox.checked;

			if (this.editNoteId !== null) {
				this.editNote(
					this.editNoteId,
					editedTitle,
					editedContent,
					editedColor,
					editedPinned
				);
			} else {
				this.addNote(editedTitle, editedContent, editedColor, editedPinned);
			}
		}

		this.cancelEdit();
		this.renderNotes();
	}

	cancelEdit() {
		this.editNoteId = null;
		document.getElementById('noteForm')?.remove();
	}

	addNewNoteButton() {
		const addNoteButton = document.createElement('button');
		addNoteButton.textContent = 'Add Note';
		addNoteButton.onclick = () => this.editNoteForm(null);

		const appDiv = document.getElementById('app');
		if (appDiv) {
			appDiv.prepend(addNoteButton);
		}
	}
}
interface IStorageService<T> {
	save(items: T[]): void;
	retrieve(): T[];
}

class LocalStorageService<T> implements IStorageService<T> {
	private memoryKey: string;
	constructor(private readonly key: string) {
		this.memoryKey = key;
	}

	retrieve(): T[] {
		const notesString = localStorage.getItem(this.memoryKey);
		if (notesString) {
			// unsafe AF
			return JSON.parse(notesString, this.dateReviewer);
		} else {
			return [];
		}
	}

	save(items: T[]) {
		localStorage.setItem(this.memoryKey, JSON.stringify(items));
	}

	private dateReviewer(key: any, value: any) {
		if (typeof value === 'string') {
			console.log(value);

			const a = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/.exec(
				value
			);
			if (a) {
				return new Date(a[0]);
			}
		}
		return value;
	}
}

// Initialize the app
const localStorageService = new LocalStorageService<Note>('notes');
const notepadApp = new NotepadApp(localStorageService);
notepadApp.addNewNoteButton();
