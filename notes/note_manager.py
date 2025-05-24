import json
import datetime

class NoteManager:
    def __init__(self, file_path="notes.json"):
        self.file_path = file_path

    def load_notes(self):
        """Loads notes from a JSON file."""
        try:
            with open(self.file_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def save_notes(self, notes):
        """Saves notes to a JSON file."""
        with open(self.file_path, "w") as f:
            json.dump(notes, f, indent=4)

    def add_note(self, title, content):
        """Add a new note."""
        notes = self.load_notes()
        notes[title] = {
            "content": content,
            "created": datetime.datetime.now().isoformat(),
            "last_edited": datetime.datetime.now().isoformat()
        }
        self.save_notes(notes)

    def update_note(self, title, content):
        """Update an existing note."""
        notes = self.load_notes()
        if title in notes:
            notes[title]["content"] = content
            notes[title]["last_edited"] = datetime.datetime.now().isoformat()
            self.save_notes(notes)

    def delete_note(self, title):
        """Delete a note."""
        notes = self.load_notes()
        if title in notes:
            del notes[title]
            self.save_notes(notes)