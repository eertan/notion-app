import streamlit as st
import hashlib
import datetime

def render_notes_tab(note_manager):
    st.title("Notion-like App")
    notes = note_manager.load_notes()

    # Left Pane
    render_sidebar(note_manager, notes)
    
    # Main content
    render_main_content(note_manager, notes)

def render_sidebar(note_manager, notes):
    left_pane = st.sidebar
    handle_file_upload(note_manager)
    sorted_notes = render_sort_options(notes)
    render_note_list(notes, sorted_notes)

def handle_file_upload(note_manager):
    if "uploaded_file_content" not in st.session_state:
        st.session_state.uploaded_file_content = None
    
    uploaded_file = st.sidebar.file_uploader("Import Notes", type=["txt", "md"])
    if uploaded_file:
        file_hash = hashlib.md5(uploaded_file.read()).hexdigest()
        if file_hash != st.session_state.get("last_uploaded_file_hash"):
            st.session_state.last_uploaded_file_hash = file_hash
            st.session_state.uploaded_file_content = uploaded_file.getvalue().decode("utf-8")

def render_sort_options(notes):
    sort_by = st.sidebar.selectbox("Sort by", ["Name", "Last Modified", "Created"], key="notes_sort_by")
    
    if sort_by == "Name":
        return sorted(notes.keys())
    elif sort_by == "Last Modified":
        return sorted(notes, key=lambda note: datetime.datetime.fromisoformat(notes[note].get("last_edited", "")), reverse=True)
    elif sort_by == "Created":
        return sorted(notes, key=lambda note: datetime.datetime.fromisoformat(notes[note].get("created", "")), reverse=True)

def render_note_list(notes, sorted_notes):
    if "selected_note" not in st.session_state:
        st.session_state.selected_note = "--Select Note--"

    index = 0
    if st.session_state.selected_note in sorted_notes:
        index = sorted_notes.index(st.session_state.selected_note) + 1

    selected_note = st.sidebar.radio(
        "Notes",
        ["--Select Note--"] + sorted_notes,
        index=index
    )

    if selected_note != st.session_state.selected_note:
        st.session_state.selected_note = selected_note
        st.rerun()

def render_main_content(note_manager, notes):
    if st.session_state.selected_note == "--Select Note--":
        render_new_note_button()
    elif st.session_state.get("new_note_mode"):
        render_new_note_form(note_manager)
    else:
        render_existing_note(note_manager, notes)

def render_new_note_button():
    if not st.session_state.get("new_note_mode"):
        if st.button("New Note", key="new_note_button"):
            st.session_state.new_note_mode = True
            if "new_note_title" in st.session_state:
                del st.session_state["new_note_title"]
            st.rerun()

def render_new_note_form(note_manager):
    new_note_title = st.text_input("New Note Title", key="new_note_title")
    new_note_content = st.text_area("New Note Content", key="new_note_content")
    if st.button("Save Note", key="save_button"):
        note_manager.add_note(new_note_title, new_note_content)
        st.session_state.selected_note = new_note_title
        st.session_state.new_note_mode = False
        st.rerun()

def render_existing_note(note_manager, notes):
    selected_note = st.session_state.selected_note
    note = notes[selected_note]
    
    created_date = datetime.datetime.fromisoformat(note["created"]).strftime("%Y-%m-%d %H:%M:%S")
    edited_date = datetime.datetime.fromisoformat(note["last_edited"]).strftime("%Y-%m-%d %H:%M:%S")
    
    st.write(f"Created: {created_date}")
    st.write(f"Last Edited: {edited_date}")
    
    note_content = st.text_area("Edit Note", value=note['content'], key=selected_note)
    
    if note_content != note['content']:
        if st.button("Save Note", key="save_button"):
            note_manager.update_note(selected_note, note_content)
            st.rerun()

    if st.button("Delete Note", key="delete_button"):
        if st.warning(f"Are you sure you want to delete '{selected_note}'?"):
            note_manager.delete_note(selected_note)
            st.session_state.selected_note = "--Select Note--"
            st.rerun()