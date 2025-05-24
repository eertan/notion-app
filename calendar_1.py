import streamlit as st
import streamlit.components.v1 as components
import datetime
from dateutil.relativedelta import relativedelta # For date calculations
import json


def render_calendar(events):
    # Convert datetime objects to strings (required by react-big-calendar)
    events_for_calendar = [
        {
            "title": event["title"],
            "start": event["start"].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),  # ISO 8601 format
            "end": event["end"].strftime("%Y-%m-%dT%H:%M:%S.%fZ"),      # ISO 8601 format
        }
        for event in events
    ]

    # The JavaScript code to render the calendar (using react-big-calendar)
    calendar_html = f"""
        <link href='https://unpkg.com/react-big-calendar@0.37.0/lib/css/react-big-calendar.css' rel='stylesheet' />
        <div id="calendar"></div>
        <script src='https://unpkg.com/react@18/umd/react.production.min.js' crossorigin></script>
        <script src='https://unpkg.com/react-dom@18/umd/react-dom.production.min.js' crossorigin></script>
        <script src='https://unpkg.com/prop-types@15.8.1/prop-types.min.js' crossorigin></script>
        <script src='https://unpkg.com/moment@2/min/moment.min.js'></script>
        <script src='https://unpkg.com/react-big-calendar@0.37.0/lib/addons/dragAndDrop/umd.js'></script>

        <script type="text/javascript">
            const events = {json.dumps(events_for_calendar)};

            window.onload = function() {{
                const e = React.createElement;
                const BigCalendar = ReactBigCalendar.Calendar;
                const DnDCalendar = ReactBigCalendar.addons.dragAndDropCalendar;


                ReactDOM.render(
                    e(BigCalendar, {{
                        localizer: BigCalendar.momentLocalizer(moment),
                        events: events,
                        defaultDate: new Date(),
                        defaultView: 'month',
                        step: 60,
                        style: {{ height: '600px' }},
                        selectable: true,  // Enable event selection
                        onSelectEvent: (event) => {{
                            alert(event.title); // Example: Show alert on event click
                        }}
                    }}),
                    document.getElementById('calendar')
                );
            }}
        </script>
    """

    # Render the HTML component in Streamlit
    components.html(calendar_html, height=650)
