// API Configuration (To be updated after AWS deployment)
const API_URL = 'YOUR_API_GATEWAY_ENDPOINT_URL';

let allNotes = []; // Store notes locally for search and filtering

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const notesList = document.getElementById('notesList');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('searchInput');

    // Fetch notes on load
    fetchNotes();

    // Event Listeners
    addBtn.addEventListener('click', handleAddOrUpdate);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', handleSearch);

    async function handleAddOrUpdate() {
        const id = document.getElementById('noteId').value;
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;
        const category = document.getElementById('noteCategory').value;
        const isPinned = document.getElementById('notePinned').checked;

        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }

        const note = {
            id: id || Date.now().toString(),
            title,
            content,
            category,
            isPinned
        };

        showLoader();
        
        try {
            // Check if API_URL is configured
            if (API_URL !== 'YOUR_API_GATEWAY_ENDPOINT_URL') {
                const method = id ? 'PUT' : 'POST';
                await fetch(API_URL, {
                    method,
                    body: JSON.stringify(note),
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                // Local Fallback: localStorage
                if (id) {
                    const index = allNotes.findIndex(n => n.id === id);
                    allNotes[index] = { ...allNotes[index], ...note, lastModified: new Date().toISOString() };
                } else {
                    allNotes.push({ ...note, lastModified: new Date().toISOString() });
                }
                saveToLocalStorage();
            }
            
            renderNotes(allNotes);
            resetForm();
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            hideLoader();
        }
    }

    async function fetchNotes() {
        showLoader();
        try {
            if (API_URL !== 'YOUR_API_GATEWAY_ENDPOINT_URL') {
                const response = await fetch(API_URL);
                allNotes = await response.json();
            } else {
                // Local Fallback: localStorage
                const saved = localStorage.getItem('cloud_notes');
                allNotes = saved ? JSON.parse(saved) : [];
            }
            renderNotes(allNotes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            hideLoader();
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('cloud_notes', JSON.stringify(allNotes));
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        const filtered = allNotes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
        renderNotes(filtered);
    }

    function renderNotes(notesToRender) {
        notesList.innerHTML = '';
        
        // Sort: Pinned first, then by last modified
        const sorted = [...notesToRender].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastModified) - new Date(a.lastModified);
        });

        sorted.forEach(note => {
            const div = document.createElement('div');
            div.className = `note-card ${note.isPinned ? 'pinned' : ''}`;
            div.innerHTML = `
                ${note.isPinned ? '<span class="pin-icon">📌</span>' : ''}
                <div class="card-actions">
                    <button class="action-btn edit-btn" onclick="editNote('${note.id}')">✎</button>
                    <button class="action-btn delete-btn" onclick="deleteNote('${note.id}')">✕</button>
                </div>
                <span class="tag ${note.category}">${note.category}</span>
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <span class="timestamp">Last modified: ${new Date(note.lastModified).toLocaleString()}</span>
            `;
            notesList.appendChild(div);
        });
    }

    window.editNote = (id) => {
        const note = allNotes.find(n => n.id === id);
        document.getElementById('noteId').value = note.id;
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteCategory').value = note.category;
        document.getElementById('notePinned').checked = note.isPinned;
        
        addBtn.innerText = 'Update Note';
        cancelBtn.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteNote = async (id) => {
        if (confirm('Delete this note?')) {
            try {
                if (API_URL !== 'YOUR_API_GATEWAY_ENDPOINT_URL') {
                    await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
                }
                allNotes = allNotes.filter(n => n.id !== id);
                saveToLocalStorage();
                renderNotes(allNotes);
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    function resetForm() {
        document.getElementById('noteId').value = '';
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        document.getElementById('noteCategory').value = 'General';
        document.getElementById('notePinned').checked = false;
        addBtn.innerText = 'Add Note';
        cancelBtn.style.display = 'none';
    }

    function showLoader() { loader.style.display = 'block'; }
    function hideLoader() { loader.style.display = 'none'; }
});
