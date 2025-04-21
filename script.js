let totalSteps = 0;
let totalBurned = 0;
let totalConsumed = 0;

// Calendar initialization
let calendar;
let events = [];

// Data storage
let appData = {
  workouts: [],
  meals: [],
  events: [],
  todos: [],
  sleepLogs: [],
  goals: [
    { id: 1, name: 'Daily Steps', target: 10000, current: 0 },
    { id: 2, name: 'Weekly Workouts', target: 5, current: 0 },
    { id: 3, name: 'Daily Calories', target: 2000, current: 0 }
  ]
};

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar-container');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: appData.events,
    eventClick: function(info) {
      alert('Event: ' + info.event.title);
    }
  });
  calendar.render();

  loadData();
  initCharts();
  initCalendar();
});

// Load data from localStorage
function loadData() {
  const savedData = localStorage.getItem('wellnessTrackerData');
  if (savedData) {
    appData = JSON.parse(savedData);
    updateUI();
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('wellnessTrackerData', JSON.stringify(appData));
}

// Initialize charts
let weeklyChart;
function initCharts() {
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  weeklyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Steps',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#5d00ff',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Update dashboard
function updateDashboard() {
  // Update today's summary
  const today = new Date().toISOString().split('T')[0];
  const todayWorkouts = appData.workouts.filter(w => w.date === today);
  const todayMeals = appData.meals.filter(m => m.date === today);
  
  const todaySummary = document.getElementById('today-summary');
  todaySummary.innerHTML = `
    <p>Steps: ${todayWorkouts.reduce((sum, w) => sum + w.steps, 0)}</p>
    <p>Calories Burned: ${todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0)}</p>
    <p>Calories Consumed: ${todayMeals.reduce((sum, m) => sum + m.calories, 0)}</p>
  `;

  // Update goals
  const goalsList = document.getElementById('goals-list');
  goalsList.innerHTML = appData.goals.map(goal => `
    <div class="goal-item">
      <span>${goal.name}</span>
      <span>${goal.current}/${goal.target}</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(goal.current/goal.target)*100}%"></div>
      </div>
    </div>
  `).join('');

  // Update weekly chart
  updateWeeklyChart();
}

// Update weekly chart
function updateWeeklyChart() {
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const weeklyData = last7Days.map(date => 
    appData.workouts
      .filter(w => w.date === date)
      .reduce((sum, w) => sum + w.steps, 0)
  );

  weeklyChart.data.datasets[0].data = weeklyData;
  weeklyChart.update();
}

// Workout templates
const workoutTemplates = {
  running: {
    steps: 10000,
    caloriesBurned: 500,
    duration: 60,
    type: 'cardio'
  },
  weightlifting: {
    steps: 2000,
    caloriesBurned: 300,
    duration: 45,
    type: 'strength'
  },
  yoga: {
    steps: 1000,
    caloriesBurned: 200,
    duration: 60,
    type: 'flexibility'
  }
};

function loadTemplate(type) {
  const template = workoutTemplates[type];
  document.getElementById('steps').value = template.steps;
  document.getElementById('calories-burned').value = template.caloriesBurned;
  document.getElementById('duration').value = template.duration;
  document.getElementById('workout-type').value = template.type;
}

// Enhanced workout logging
function logWorkout() {
  const workout = {
    date: document.getElementById('workout-date').value,
    steps: parseInt(document.getElementById('steps').value),
    caloriesBurned: parseInt(document.getElementById('calories-burned').value),
    duration: parseInt(document.getElementById('duration').value),
    type: document.getElementById('workout-type').value
  };

  if (!workout.date || isNaN(workout.steps) || isNaN(workout.caloriesBurned)) {
    alert('Please fill out all required fields.');
    return;
  }

  appData.workouts.push(workout);
  saveData();
  clearWorkoutInputs();
}

// Enhanced meal logging
function logMeal() {
  const meal = {
    date: new Date().toISOString().split('T')[0],
    name: document.getElementById('meal-name').value,
    calories: parseInt(document.getElementById('meal-calories').value),
    sugars: parseInt(document.getElementById('meal-sugars').value)
  };

  if (!meal.name || isNaN(meal.calories)) {
    alert('Please fill out all required fields.');
    return;
  }

  appData.meals.push(meal);
  saveData();
  clearMealInputs();
}

function updateSummary() {
  document.getElementById('total-steps').textContent = totalSteps;
  document.getElementById('total-burned').textContent = totalBurned;
  document.getElementById('total-consumed').textContent = totalConsumed;
}

function addToLog(message) {
  const logList = document.getElementById('log-list');
  const entry = document.createElement('p');
  entry.innerHTML = message;
  logList.prepend(entry);
}

function clearWorkoutInputs() {
  document.getElementById('workout-date').value = '';
  document.getElementById('steps').value = '';
  document.getElementById('calories-burned').value = '';
  document.getElementById('duration').value = '';
  document.getElementById('workout-type').value = '';
}

function clearMealInputs() {
  document.getElementById('meal-name').value = '';
  document.getElementById('meal-calories').value = '';
  document.getElementById('meal-sugars').value = '';
}

function scheduleEvent() {
  const date = document.getElementById('event-date').value;
  const name = document.getElementById('event-name').value;
  const details = document.getElementById('event-details').value;

  if (!date || !name) {
    alert('Please fill out the required fields.');
    return;
  }

  const event = {
    title: name,
    start: date,
    description: details,
    backgroundColor: '#5d00ff',
    borderColor: '#5d00ff'
  };

  events.push(event);
  calendar.addEvent(event);
  
  // Add to schedule list
  const scheduleList = document.getElementById('schedule-list');
  const eventItem = document.createElement('div');
  eventItem.className = 'event-item';
  eventItem.innerHTML = `
    <strong>${name}</strong> - ${date}
    <p>${details}</p>
  `;
  scheduleList.prepend(eventItem);

  // Clear inputs
  document.getElementById('event-date').value = '';
  document.getElementById('event-name').value = '';
  document.getElementById('event-details').value = '';
}

// Section navigation
function showSection(sectionId) {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => section.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
}

// To-Do List functions
function addTodo() {
  const input = document.getElementById('todo-item');
  const text = input.value.trim();
  
  if (text) {
    appData.todos.push({
      id: Date.now(),
      text: text,
      completed: false
    });
    saveData();
    updateUI();
    input.value = '';
  }
}

function toggleTodo(id) {
  const todo = appData.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveData();
    updateUI();
  }
}

function deleteTodo(id) {
  appData.todos = appData.todos.filter(t => t.id !== id);
  saveData();
  updateUI();
}

// Calendar functions
function addEvent() {
  const name = document.getElementById('event-name').value;
  const time = document.getElementById('event-time').value;
  
  if (name && time) {
    const event = {
      title: name,
      start: time,
      allDay: false
    };
    
    appData.events.push(event);
    calendar.addEvent(event);
    saveData();
    
    document.getElementById('event-name').value = '';
    document.getElementById('event-time').value = '';
  }
}

// Sleep tracker functions
function logSleep() {
  const date = document.getElementById('sleep-date').value;
  const start = document.getElementById('sleep-start').value;
  const end = document.getElementById('sleep-end').value;
  
  if (date && start && end) {
    appData.sleepLogs.push({
      date: date,
      start: start,
      end: end
    });
    saveData();
    updateUI();
    
    document.getElementById('sleep-date').value = '';
    document.getElementById('sleep-start').value = '';
    document.getElementById('sleep-end').value = '';
  }
}

// Workout functions
function loadWorkout(type) {
  const workouts = {
    running: {
      name: 'Running',
      duration: '30-60 minutes',
      description: 'Cardio workout focusing on endurance and stamina'
    },
    weightlifting: {
      name: 'Weightlifting',
      duration: '45-60 minutes',
      description: 'Strength training focusing on muscle growth'
    },
    yoga: {
      name: 'Yoga',
      duration: '30-45 minutes',
      description: 'Flexibility and balance exercises'
    }
  };
  
  const workout = workouts[type];
  if (workout) {
    alert(`${workout.name}\nDuration: ${workout.duration}\n${workout.description}`);
  }
}

// Update UI
function updateUI() {
  // Update to-do list
  const todoList = document.getElementById('todo-list-items');
  todoList.innerHTML = appData.todos.map(todo => `
    <li class="${todo.completed ? 'completed' : ''}">
      <span onclick="toggleTodo(${todo.id})">${todo.text}</span>
      <button onclick="deleteTodo(${todo.id})">×</button>
    </li>
  `).join('');

  // Update sleep log
  const sleepLog = document.getElementById('sleep-log');
  sleepLog.innerHTML = appData.sleepLogs.map(log => `
    <div class="sleep-entry">
      <strong>${log.date}</strong>
      <p>Sleep: ${log.start} - ${log.end}</p>
    </div>
  `).join('');
}

// Initialize app
loadData();
