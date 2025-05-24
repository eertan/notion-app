import json
import datetime

class TaskManager:
    def __init__(self, file_path="tasks.json"):
        self.file_path = file_path

    def load_tasks(self):
        """Loads tasks from a JSON file."""
        try:
            with open(self.file_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def save_tasks(self, tasks):
        """Saves tasks to a JSON file."""
        with open(self.file_path, "w") as f:
            json.dump(tasks, f, indent=4)

    def add_task(self, title, due_date):
        """Add a new task."""
        tasks = self.load_tasks()
        tasks[title] = {
            "done": False,
            "due_date": due_date.strftime("%Y-%m-%d")
        }
        self.save_tasks(tasks)

    def toggle_task(self, title):
        """Toggle task completion status."""
        tasks = self.load_tasks()
        if title in tasks:
            tasks[title]["done"] = not tasks[title]["done"]
            self.save_tasks(tasks)

    def delete_task(self, title):
        """Delete a task."""
        tasks = self.load_tasks()
        if title in tasks:
            del tasks[title]
            self.save_tasks(tasks)

    def get_tasks_by_date(self):
        """Group tasks by date."""
        tasks = self.load_tasks()
        tasks_by_date = {}
        for task_name, task_data in tasks.items():
            due_date = task_data.get("due_date")
            if due_date:
                if due_date not in tasks_by_date:
                    tasks_by_date[due_date] = []
                tasks_by_date[due_date].append((task_name, task_data))
        return tasks_by_date