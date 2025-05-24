import streamlit as st
import streamlit_extras as ste
import datetime

def render_tasks_tab(task_manager):
    st.title("Tasks")

    render_add_task_section(task_manager)
    render_task_list(task_manager)
    render_calendar_view(task_manager)

def render_add_task_section(task_manager):
    with st.expander("Add New Task", expanded=False):
        col1, col2, col3 = st.columns([2, 2, 1])
        with col1:
            new_task = st.text_input("Task Name", key="new_task_calendar")
        with col2:
            new_date = st.date_input("Due Date", key="new_date_calendar")
        with col3:
            if st.button("Add", key="add_task_calendar"):
                if new_task:
                    task_manager.add_task(new_task, new_date)
                    st.rerun()

def render_task_list(task_manager):
    st.subheader("Task List")
    tasks_by_date = task_manager.get_tasks_by_date()

    for date in sorted(tasks_by_date.keys()):
        with st.expander(f"📅 {date}", expanded=True):
            for task_name, task_data in sorted(tasks_by_date[date]):
                col1, col2 = st.columns([4, 1])
                with col1:
                    done = task_data.get("done", False)
                    if st.checkbox(task_name, value=done, key=f"cal_task_{task_name}_{date}"):
                        if not done:
                            task_manager.toggle_task(task_name)
                            st.rerun()
                    elif done:
                        task_manager.toggle_task(task_name)
                        st.rerun()
                with col2:
                    if st.button("🗑", key=f"del_cal_{task_name}_{date}", use_container_width=True):
                        task_manager.delete_task(task_name)
                        st.rerun()

def render_calendar_view(task_manager):
    st.markdown("---")
    st.subheader("Calendar")

    if "calendar_view" not in st.session_state:  # Initialize view in session state
            st.session_state.calendar_view = "Monthly"

    if "calendar_date" not in st.session_state:
        st.session_state.calendar_date = datetime.date.today()

    col1, col2, col3 = st.columns([1, 2, 1]) # Added a column for navigation buttons

    with col1:
        if st.button("", key="backward_button", icon="⬅️"):  # Previous button
            t_delta = datetime.timedelta(days=7 if st.session_state.calendar_view == "Weekly" else 30)
            st.session_state.calendar_date -= t_delta
            st.rerun()

    with col2:
        view_type = st.selectbox("View", ["Monthly", "Weekly"], key="calendar_view")

        if "calendar_date" not in st.session_state: # Initialize session state for date
            st.session_state.calendar_date = datetime.date.today()

        if view_type == "Monthly":
            selected_date = st.date_input("Select Month", st.session_state.calendar_date, key="month_selector")
            start_date = selected_date.replace(day=1)
            if selected_date.month == 12:
                end_date = selected_date.replace(year=selected_date.year + 1, month=1, day=1)
            else:
                end_date = selected_date.replace(month=selected_date.month + 1, day=1)
            end_date = end_date - datetime.timedelta(days=1)

        else:  # Weekly
            selected_date = st.date_input("Select Week", st.session_state.calendar_date, key="week_selector")
            start_date = selected_date - datetime.timedelta(days=selected_date.weekday())
            end_date = start_date + datetime.timedelta(days=6)

        st.session_state.calendar_date = selected_date # Update session state with currently selected date


    with col3:
        if st.button("", key="forward_button", icon="➡️"):  # Next button
            t_delta = datetime.timedelta(days=7 if st.session_state.calendar_view == "Weekly" else 30)
            st.session_state.calendar_date += t_delta
            st.rerun()



    render_calendar_grid(task_manager, view_type, start_date, end_date)

def render_calendar_grid(task_manager, view_type, start_date, end_date):
    st.markdown("""
    <style>
    .calendar-day {
        border: 1px solid #ddd;
        padding: 10px;
        min-height: 100px;
        background-color: white;
    }
    .calendar-day.today {
        background-color: #e6f3ff;
    }
    .task-item {
        margin: 2px 0;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 0.9em;
        background-color: #f0f0f0;
    }
    .task-done {
        text-decoration: line-through;
        color: #666;
    }
    .task-item:hover {
        background-color: #e0e0e0;
    }
    </style>
    """, unsafe_allow_html=True)

    tasks = task_manager.load_tasks()

    if view_type == "Monthly":
        render_monthly_view(start_date, end_date, tasks)
    else:
        render_weekly_view(start_date, tasks)

def render_monthly_view(start_date, end_date, tasks):
    st.write(f"### {start_date.strftime('%B %Y')}")
    st.write("Mon Tue Wed Thu Fri Sat Sun".replace(" ", "&nbsp;" * 4), unsafe_allow_html=True)

    current_date = start_date
    weeks = []
    week = []

    for _ in range(current_date.weekday()):
        week.append(None)

    while current_date <= end_date:
        week.append(current_date)
        if len(week) == 7:
            weeks.append(week)
            week = []
        current_date += datetime.timedelta(days=1)

    if week:
        while len(week) < 7:
            week.append(None)
        weeks.append(week)

    for week in weeks:
        cols = st.columns(7)
        for day, col in zip(week, cols):
            with col:
                render_calendar_day(day, tasks)

def render_weekly_view(start_date, tasks):
    st.write(f"### Week of {start_date.strftime('%B %d, %Y')}")
    cols = st.columns(7)
    for i, day in enumerate((start_date + datetime.timedelta(days=n) for n in range(7))):
        with cols[i]:
            render_calendar_day(day, tasks)

def render_calendar_day(day, tasks):
    if day is not None:
        is_today = day == datetime.datetime.now().date()
        day_str = day.strftime("%Y-%m-%d")

        st.markdown(f"""
        <div class="calendar-day{'today' if is_today else ''}">
            <strong>{day.strftime('%a %d') if isinstance(day, datetime.date) else day.day}</strong>
            <div class="tasks">
                {"".join([
                    f'<div class="task-item{" task-done" if task_data.get("done") else ""}">{task_name[:10] + "..." if len(task_name) > 10 else task_name}</div>'
                    for task_name, task_data in tasks.items()
                    if task_data.get("due_date") == day_str
                ]) or "&nbsp;"}
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown('<div class="calendar-day">&nbsp;</div>', unsafe_allow_html=True)
