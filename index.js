
        const loginScreen = document.getElementById('loginScreen');
        const loginForm = document.getElementById('loginForm');
        const userNameOrEmailInput = document.getElementById('userNameOrEmail');
        const appContainer = document.getElementById('appContainer');
        const userInfo = document.getElementById('userInfo');
        const modeToggle = document.getElementById('modeToggle');
        const notesGrid = document.getElementById('notesGrid');
        const createNoteBtn = document.getElementById('createNoteBtn');
        const searchBar = document.getElementById('searchBar');
        const sortSelector = document.getElementById('sortSelector');
        const noteTitleInput = document.getElementById('noteTitle');
        const noteContentInput = document.getElementById('noteContent');
        const noteCategoryInput = document.getElementById('noteCategory');
        const noteBgImageInput = document.getElementById('noteBgImage');
        const wordCountDisplay = document.getElementById('wordCountDisplay');
        const WORD_LIMIT = 400;
 




        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        let loggedInUser = localStorage.getItem('loggedInUser');

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString();
        };

     

        const handleLogin = (e) => {
            e.preventDefault();
            const input = userNameOrEmailInput.value.trim();
            if (input) {
           

                const userName = input.includes('@') ? input.split('@')[0] : input;
                localStorage.setItem('loggedInUser', userName);
                loggedInUser = userName;
                initApp();
            }
        };

        const initApp = () => {
            if (loggedInUser) {
                loginScreen.classList.add('hidden');
                appContainer.classList.remove('hidden');
                userInfo.textContent = `Aapka Swagat Hai, ${loggedInUser}!`;
                renderNotes();
            } else {
                loginScreen.classList.remove('hidden');
                appContainer.classList.add('hidden');
            }
        };

       
        const toggleDarkMode = () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
            modeToggle.textContent = isDark ? '🌕 Light Mode' : '☀️ Dark Mode';
        };

    
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            modeToggle.textContent = '🌕 Light Mode';
        }

        const saveNotes = () => {
            localStorage.setItem('notes', JSON.stringify(notes));
        };
        
       
        const debounce = (func, delay) => {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        };

        const updateNote = (id, field, value) => {
            const noteIndex = notes.findIndex(n => n.id === id);
            if (noteIndex !== -1) {
                notes[noteIndex][field] = value;
                notes[noteIndex].lastEditedDate = new Date().toISOString(); 
                saveNotes();
                
                renderNotes(); 
            }
        };

        const debouncedUpdateNote = debounce(updateNote, 1000);

        const createNote = () => {
            const content = noteContentInput.value.trim();
       
            const wordMatch = content.match(/\b\w+\b/g);
            if (wordMatch && wordMatch.length > WORD_LIMIT) {
                alert(`Note ${WORD_LIMIT} words se zyada nahi ho sakta!`);
                return;
            }

            if (noteTitleInput.value.trim() || content) {
                const now = new Date().toISOString();
                const newNote = {
                    id: Date.now(),
                    title: noteTitleInput.value.trim() || 'Untitled Note',
                    content: content,
                    dateCreated: now,
                    lastEditedDate: now,
                    category: noteCategoryInput.value,
                    backgroundImage: noteBgImageInput.value.trim(),
                    isPinned: false, 
                };
                notes.unshift(newNote); 
                saveNotes();
                renderNotes();

                
                noteTitleInput.value = noteContentInput.value = noteBgImageInput.value = '';
                noteCategoryInput.value = '';
                updateWordCount(); 
            } else {
                alert('Kripya title ya content daalein.');
            }
        };

        const deleteNote = (id) => {
            if (confirm('Kya aap sach mein yeh note delete karna chahte hain?')) {
                notes = notes.filter(note => note.id !== id);
                saveNotes();
                renderNotes();
            }
        };

        const togglePin = (id) => {
            const noteIndex = notes.findIndex(n => n.id === id);
            if (noteIndex !== -1) {
                notes[noteIndex].isPinned = !notes[noteIndex].isPinned;
                saveNotes();
                renderNotes(); 
            }
        };

        
        const updateWordCount = () => {
            const content = noteContentInput.value;
            const wordMatch = content.match(/\b\w+\b/g);
            const wordCount = wordMatch ? wordMatch.length : 0;
            
            wordCountDisplay.textContent = `Word Count: ${wordCount} / ${WORD_LIMIT}`;

            if (wordCount > WORD_LIMIT) {
           
                const truncatedContent = wordMatch.slice(0, WORD_LIMIT).join(' ');
                noteContentInput.value = truncatedContent;
                wordCountDisplay.style.color = 'red';
            } else {
                wordCountDisplay.style.color = 'inherit';
            }
        };



        const sortNotes = (currentNotes, criteria) => {
            currentNotes.sort((a, b) => {
               
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;

             
                switch (criteria) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'dateCreated':
                        return new Date(b.dateCreated) - new Date(a.dateCreated); 
                    case 'lastEditedDate':
                        return new Date(b.lastEditedDate) - new Date(a.lastEditedDate); 
                    case 'category':
                        
                        if (a.category < b.category) return -1;
                        if (a.category > b.category) return 1;
                        return new Date(b.dateCreated) - new Date(a.dateCreated);
                    default:
                        return 0;
                }
            });
            return currentNotes;
        };

        const filterNotes = (currentNotes, searchTerm) => {
            if (!searchTerm) return currentNotes;
            const term = searchTerm.toLowerCase();

            return currentNotes.filter(note =>
                note.title.toLowerCase().includes(term) ||
                note.content.toLowerCase().includes(term) ||
                formatDate(note.dateCreated).toLowerCase().includes(term)
            );
        };
        
        const renderNotes = () => {
            const searchTerm = searchBar.value;
            const sortCriteria = sortSelector.value;
            
            let displayedNotes = filterNotes(notes, searchTerm);
          
            displayedNotes = sortNotes([...displayedNotes], sortCriteria); 

            notesGrid.innerHTML = '';

            displayedNotes.forEach(note => {
                const noteElement = document.createElement('div');
           
                noteElement.className = `note-card ${note.category} ${note.isPinned ? 'pinned' : ''}`;
                noteElement.setAttribute('data-id', note.id);
                noteElement.setAttribute('draggable', 'true'); 

               
                if (note.backgroundImage) {
                    noteElement.style.backgroundImage = `url(${note.backgroundImage})`;
                    noteElement.style.backgroundSize = 'cover';
                    noteElement.style.color = 'white';
                }

                noteElement.innerHTML = `
                    <div class="note-title" contenteditable="true" data-field="title" aria-label="Note title: ${note.title}" tabindex="11">${note.title}</div>
                    <div class="note-content" contenteditable="true" data-field="content" aria-label="Note content" tabindex="12">${note.content}</div>
                    <div class="note-footer">
                        <span>Bana: ${formatDate(note.dateCreated)}</span>
                        <span>Badla: ${formatDate(note.lastEditedDate)}</span>
                        <div class="note-actions">
                            <button class="pin-btn" aria-label="${note.isPinned ? 'Unpin' : 'Pin'} note" tabindex="13">${note.isPinned ? '⬇️ Unpin' : '📌 Pin'}</button>
                            <button class="delete-btn delete" aria-label="Note delete karein" tabindex="14">🗑️ Delete</button>
                        </div>
                    </div>
                `;
                noteElement.querySelector('.note-title').addEventListener('input', (e) => {
                    debouncedUpdateNote(note.id, 'title', e.target.textContent);
                });
                noteElement.querySelector('.note-content').addEventListener('input', (e) => {
                    debouncedUpdateNote(note.id, 'content', e.target.textContent);
                });

                noteElement.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note.id));
                noteElement.querySelector('.pin-btn').addEventListener('click', () => togglePin(note.id));

                notesGrid.appendChild(noteElement);
            });
            addDragDropListeners();
        };

        loginForm.addEventListener('submit', handleLogin);
        modeToggle.addEventListener('click', toggleDarkMode);
        createNoteBtn.addEventListener('click', createNote);
        searchBar.addEventListener('input', renderNotes);
        sortSelector.addEventListener('change', renderNotes);
        noteContentInput.addEventListener('input', updateWordCount);

       
        let dragSrcEl = null;

        function handleDragStart(e) {
            this.style.opacity = '0.4';
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
        }
        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); 
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }
        function handleDrop(e) {
            e.stopPropagation(); 
            this.classList.remove('over');

            if (dragSrcEl !== this) {
                const dropId = parseInt(this.getAttribute('data-id'));
                const dragId = parseInt(dragSrcEl.getAttribute('data-id'));
                
                const draggedNote = notes.find(n => n.id === dragId);
                if (draggedNote.isPinned) return; 
                let unpinnedNotes = notes.filter(n => !n.isPinned);
                const pinnedNotes = notes.filter(n => n.isPinned);

                const currentOrder = unpinnedNotes.map(n => n.id);
                const draggedIndex = currentOrder.indexOf(dragId);
                currentOrder.splice(draggedIndex, 1);

                let dropIndex = currentOrder.indexOf(dropId);
                currentOrder.splice(dropIndex, 0, dragId);

                const reorderedUnpinnedNotes = currentOrder.map(id => unpinnedNotes.find(n => n.id === id));
                
                notes = [...pinnedNotes, ...reorderedUnpinnedNotes];
                saveNotes();
                renderNotes(); 
            }
            return false;
        }
        function handleDragEnd() {
            this.style.opacity = '1';
        }

        const addDragDropListeners = () => {
            document.querySelectorAll('.note-card').forEach(note => {
             
                note.removeEventListener('dragstart', handleDragStart);
                note.removeEventListener('dragover', handleDragOver);
                note.removeEventListener('drop', handleDrop);
                note.removeEventListener('dragend', handleDragEnd);
                
                note.addEventListener('dragstart', handleDragStart);
                note.addEventListener('dragover', handleDragOver);
                note.addEventListener('drop', handleDrop);
                note.addEventListener('dragend', handleDragEnd);
            });
        };

        document.addEventListener('keydown', (e) => {
     
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                
                noteTitleInput.focus(); 
            }
           
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                alert('Notes automatic (real-time) save ho rahe hain!');
            }
        });
        
    
        initApp();
