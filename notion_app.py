# import streamlit as st
# import json
# import os
# import hashlib
# import datetime
# from streamlit_calendar import calendar
# from calendar_1 import render_calendar


# def load_notes(file_path="notes.json"):
#     """Loads notes from a JSON file."""
#     try:
#         with open(file_path, "r") as f:
#             notes = json.load(f)
#     except (FileNotFoundError, json.JSONDecodeError):  # Handle JSON decoding errors
#         notes = {}  # Return empty dict if file not found or invalid JSON
#     return notes


# def save_notes(notes, file_path="notes.json"):
#     """Saves notes to a JSON file."""
#     with open(file_path, "w") as f:
#         json.dump(notes, f, indent=4)


# def load_tasks(file_path="tasks.json"):
#     """Loads tasks from a JSON file."""
#     try:
#         with open(file_path, "r") as f:
#             return json.load(f)
#     except (FileNotFoundError, json.JSONDecodeError):
#         return {}


# def save_tasks(tasks, file_path="tasks.json"):
#     """Saves tasks to a JSON file."""
#     with open(file_path, "w") as f:
#         json.dump(tasks, f, indent=4)


# def main():
#     selected_tab = st.sidebar.radio("Select Tab", ["Notes", "Tasks"], key="selected_tab")

#     if selected_tab == "Notes":
#         st.title("Notion-like App")

#         notes = load_notes()

#         # Left Pane
#         left_pane = st.sidebar
#         if "uploaded_file_content" not in st.session_state:
#             st.session_state.uploaded_file_content = None
#         uploaded_file = left_pane.file_uploader("Import Notes", type=["txt", "md"])
#         if uploaded_file:
#             file_hash = hashlib.md5(uploaded_file.read()).hexdigest()
#             if file_hash != st.session_state.get("last_uploaded_file_hash"):
#                 st.session_state.last_uploaded_file_hash = file_hash
#                 st.session_state.uploaded_file_content = uploaded_file.getvalue().decode("utf-8")
#                 # Process the uploaded file here (e.g., extract title and content)
#                 # ...

#         if st.session_state.get("uploaded_file_content"): # Show form if content exists
#             with left_pane.form("upload_form", clear_on_submit=True):

#                 # new_note_title = st.text_input("New Note Title:", key="upload_title")
#                 new_note_title = st.text_input("New Note Title:", key="upload_title", value=st.session_state.upload_name)
#                 new_note_content = st.text_area("New Note Content:", value=st.session_state.get("uploaded_file_content", ""))
#                 # print(new_note_title)
#                 # save_button_disabled1 = True
#                 # if new_note_title:
#                 #     save_button_disabled1 = False
#                 # print(save_button_disabled1)
#                 if st.form_submit_button("Save Note"):
#                     notes[new_note_title] = {"content": new_note_content, "created": datetime.datetime.now().isoformat(), "last_edited": datetime.datetime.now().isoformat()}
#                     save_notes(notes)
#                     st.session_state.selected_note = new_note_title
#                     st.session_state.uploaded_file_content = None  # Clear after saving
#                     # st.session_state.show_import_form = False  # Hide the form
#                     print("this should make it invisible!")

#         sort_by = st.sidebar.selectbox("Sort by", ["Name", "Last Modified", "Created"])

#         if sort_by == "Name":
#             sorted_notes = sorted(notes.keys())
#         elif sort_by == "Last Modified":
#             sorted_notes = sorted(notes, key=lambda note: datetime.datetime.fromisoformat(notes[note].get("last_edited", "")), reverse=True) # Latest first
#         elif sort_by == "Created":
#             sorted_notes = sorted(notes, key=lambda note: datetime.datetime.fromisoformat(notes[note].get("created", "")), reverse=True) # Latest first

#         # Initialize selected_note in session state if not present
#         if "selected_note" not in st.session_state:
#             st.session_state.selected_note = "--Select Note--"

#         # Calculate index for the radio button
#         index = 0  # Default to "--Select Note--"
#         if st.session_state.selected_note in sorted_notes:
#             index = sorted_notes.index(st.session_state.selected_note) + 1

#         # Simplified radio button without the key
#         selected_note = left_pane.radio(
#             "Notes",
#             ["--Select Note--"] + sorted_notes,
#             index=index
#         )

#         # Update session state only if there's a change
#         if selected_note != st.session_state.selected_note:
#             st.session_state.selected_note = selected_note
#             st.rerun()

#         if selected_note == "--Select Note--" and not st.session_state.get("new_note_mode"):
#             if st.button("New Note", key="new_note_button"):
#                 st.session_state.new_note_mode = True
#                 # Clear any previously entered new note title
#                 if "new_note_title" in st.session_state:
#                     del st.session_state["new_note_title"]
#                 st.rerun()

#         elif st.session_state.get("new_note_mode"): # New note mode
#             new_note_title = st.text_input("New Note Title", key="new_note_title")
#             new_note_content = st.text_area("New Note Content", key="new_note_content")
#             if st.button("Save Note", key="save_button"):


#                 notes[new_note_title] = {"content": new_note_content, "created": datetime.datetime.now().isoformat(), "last_edited": datetime.datetime.now().isoformat()}
#                 save_notes(notes)
#                 st.session_state.selected_note = new_note_title
#                 st.session_state.new_note_mode = False # Exit new note mode
#                 st.rerun()

#         elif selected_note != "--Select Note--": # Existing note selected
#             initial_note_content = notes[selected_note]['content']
#             created_date = datetime.datetime.fromisoformat(notes[selected_note]["created"]).strftime("%Y-%m-%d %H:%M:%S")
#             edited_date = datetime.datetime.fromisoformat(notes[selected_note]["last_edited"]).strftime("%Y-%m-%d %H:%M:%S")
#             st.write(f"Created: {created_date}")
#             st.write(f"Last Edited: {edited_date}")
#             note_content = st.text_area("Edit Note", value=initial_note_content, key=selected_note)
#             save_button_disabled2 = initial_note_content == note_content

#             if st.button("Save Note", key="save_button", disabled=save_button_disabled2):
#                 notes[selected_note]['content'] = note_content
#                 notes[selected_note]["last_edited"] = datetime.datetime.now().isoformat()
#                 save_notes(notes)
#                 st.rerun()

#             if st.button("Delete Note", key="delete_button"):
#                 if st.warning(f"Are you sure you want to delete '{selected_note}'?"):
#                     del notes[selected_note]
#                     save_notes(notes)
#                     st.session_state.selected_note = "--Select Note--"# Resets selected note in radio button
#                     st.rerun()
#     elif selected_tab == "Tasks":
#         st.title("Tasks")

#         tasks = load_tasks()
        
#         # 1. Add task section
#         with st.expander("Add New Task", expanded=False):
#             col1, col2, col3 = st.columns([2, 2, 1])
#             with col1:
#                 new_task = st.text_input("Task Name", key="new_task_calendar")
#             with col2:
#                 new_date = st.date_input("Due Date", key="new_date_calendar")
#             with col3:
#                 if st.button("Add", key="add_task_calendar"):
#                     if new_task:
#                         tasks[new_task] = {"done": False, "due_date": new_date.strftime("%Y-%m-%d")}
#                         save_tasks(tasks)
#                         st.rerun()

#         # 2. Task List Section
#         st.subheader("Task List")
        
#         # Group tasks by date
#         tasks_by_date = {}
#         for task_name, task_data in tasks.items():
#             due_date = task_data.get("due_date")
#             if due_date:
#                 if due_date not in tasks_by_date:
#                     tasks_by_date[due_date] = []
#                 tasks_by_date[due_date].append((task_name, task_data))

#         # Display tasks by date
#         sorted_dates = sorted(tasks_by_date.keys())
        
#         for date in sorted_dates:
#             with st.expander(f" {date}", expanded=True):
#                 for task_name, task_data in sorted(tasks_by_date[date]):
#                     col1, col2 = st.columns([4, 1])  
#                     with col1:
#                         done = task_data.get("done", False)
#                         if st.checkbox(
#                             task_name,
#                             value=done,
#                             key=f"cal_task_{task_name}_{date}"
#                         ):
#                             if not done:  # Task was just checked
#                                 tasks[task_name]["done"] = True
#                                 save_tasks(tasks)
#                                 st.rerun()
#                         else:
#                             if done:  # Task was just unchecked
#                                 tasks[task_name]["done"] = False
#                                 save_tasks(tasks)
#                                 st.rerun()
#                     with col2:
#                         if st.button("", key=f"del_cal_{task_name}_{date}", use_container_width=True):  
#                             del tasks[task_name]
#                             save_tasks(tasks)
#                             st.rerun()

#         # 3. Calendar Visualization
#         st.markdown("---")
#         st.subheader("Calendar")
        
#         # View selector and navigation
#         col1, col2, col3 = st.columns([2, 2, 2])
#         with col1:
#             view_type = st.selectbox("View", ["Monthly", "Weekly"], key="calendar_view")
#         with col2:
#             today = datetime.datetime.now()
#             if view_type == "Monthly":
#                 selected_date = st.date_input("Select Month", today, key="month_selector")
#                 start_date = selected_date.replace(day=1)
#                 if selected_date.month == 12:
#                     end_date = selected_date.replace(year=selected_date.year + 1, month=1, day=1)
#                 else:
#                     end_date = selected_date.replace(month=selected_date.month + 1, day=1)
#                 end_date = end_date - datetime.timedelta(days=1)
#             else:  # Weekly
#                 selected_date = st.date_input("Select Week", today, key="week_selector")
#                 start_date = selected_date - datetime.timedelta(days=selected_date.weekday())
#                 end_date = start_date + datetime.timedelta(days=6)

#         # Calendar grid styling
#         st.markdown("""
#         <style>
#         .calendar-day {
#             border: 1px solid #ddd;
#             padding: 10px;
#             min-height: 100px;
#             background-color: white;
#         }
#         .calendar-day.today {
#             background-color: #e6f3ff;
#         }
#         .task-item {
#             margin: 2px 0;
#             padding: 2px 5px;
#             border-radius: 3px;
#             font-size: 0.9em;
#             background-color: #f0f0f0;
#         }
#         .task-done {
#             text-decoration: line-through;
#             color: #666;
#         }
#         .task-item:hover {
#             background-color: #e0e0e0;
#         }
#         </style>
#         """, unsafe_allow_html=True)

#         # Generate calendar
#         if view_type == "Monthly":
#             # Calculate weeks
#             current_date = start_date
#             weeks = []
#             week = []
            
#             # Add days from previous month to start the week
#             for _ in range(current_date.weekday()):
#                 week.append(None)
            
#             while current_date <= end_date:
#                 week.append(current_date)
#                 if len(week) == 7:
#                     weeks.append(week)
#                     week = []
#                 current_date += datetime.timedelta(days=1)
            
#             # Add remaining days
#             if week:
#                 while len(week) < 7:
#                     week.append(None)
#                 weeks.append(week)
            
#             # Display calendar grid
#             st.write(f"### {start_date.strftime('%B %Y')}")
#             st.write("Mon Tue Wed Thu Fri Sat Sun".replace(" ", "&nbsp;" * 4), unsafe_allow_html=True)
            
#             for week in weeks:
#                 cols = st.columns(7)
#                 for day, col in zip(week, cols):
#                     with col:
#                         if day is not None:
#                             is_today = day == datetime.datetime.now().date()
#                             day_str = day.strftime("%Y-%m-%d")
                            
#                             st.markdown(f"""
#                             <div class="calendar-day{'today' if is_today else ''}">
#                                 <strong>{day.day}</strong>
#                                 <div class="tasks">
#                                     {"".join([
#                                         f'<div class="task-item{" task-done" if task_data.get("done") else ""}">{task_name[:10] + "..." if len(task_name) > 10 else task_name}</div>'
#                                         for task_name, task_data in tasks.items()
#                                         if task_data.get("due_date") == day_str
#                                     ]) or "&nbsp;"}
#                                 </div>
#                             </div>
#                             """, unsafe_allow_html=True)
#                         else:
#                             st.markdown('<div class="calendar-day">&nbsp;</div>', unsafe_allow_html=True)
        
#         else:  # Weekly view
#             st.write(f"### Week of {start_date.strftime('%B %d, %Y')}")
#             cols = st.columns(7)
#             for i, day in enumerate((start_date + datetime.timedelta(days=n) for n in range(7))):
#                 with cols[i]:
#                     is_today = day == datetime.datetime.now().date()
#                     day_str = day.strftime("%Y-%m-%d")
                    
#                     st.markdown(f"""
#                     <div class="calendar-day{'today' if is_today else ''}">
#                         <strong>{day.strftime('%a %d')}</strong>
#                         <div class="tasks">
#                             {"".join([
#                                 f'<div class="task-item{" task-done" if task_data.get("done") else ""}">{task_name}</div>'
#                                 for task_name, task_data in tasks.items()
#                                 if task_data.get("due_date") == day_str
#                             ])}
#                         </div>
#                     </div>
#                     """, unsafe_allow_html=True)

# if __name__ == "__main__":
#     if "selected_note" not in st.session_state:
#         st.session_state.selected_note = "--Select Note--"
#     if "new_note_mode" not in st.session_state:
#         st.session_state.new_note_mode = False
#     if "last_uploaded_file_id" not in st.session_state:
#         st.session_state.last_uploaded_file_hash = None
#     if "show_import_form" not in st.session_state:
#         st.session_state.show_import_form = False
#     if "upload_name" not in st.session_state:
#         st.session_state.upload_name = ""
#     if "new_task_mode" not in st.session_state:
#         st.session_state.new_task_mode = False

#     main()
def order_dict_keys(dictionary):
    """Orders the keys of a dictionary alphabetically and returns a new dictionary."""
    return dict(sorted(dictionary.items()))

import streamlit as st
import datetime
from notes.note_manager import NoteManager
from tasks.task_manager import TaskManager
from ui.note_ui import render_notes_tab
from ui.task_ui import render_tasks_tab

def main():
    # Initialize managers
    note_manager = NoteManager()
    task_manager = TaskManager()
    

    # Main navigation
    selected_tab = st.sidebar.radio("Select Tab", ["Notes", "Tasks"], key="selected_tab")

    if selected_tab == "Notes":
        render_notes_tab(note_manager)
    elif selected_tab == "Tasks":
        render_tasks_tab(task_manager)

if __name__ == "__main__":
    if "selected_note" not in st.session_state:
        st.session_state.selected_note = "--Select Note--"
    if "new_note_mode" not in st.session_state:
        st.session_state.new_note_mode = False
    main()