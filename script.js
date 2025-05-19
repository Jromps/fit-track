let totalSteps = 0;
let totalBurned = 0;
let totalConsumed = 0;

// Data storage
let appData = {
  workouts: [],
  meals: [],
  progress: [],
  todos: [],
  sleepLogs: [],
  goals: [
    { id: 1, name: 'Daily Steps', target: 10000, current: 0 },
    { id: 2, name: 'Weekly Workouts', target: 5, current: 0 },
    { id: 3, name: 'Daily Calories', target: 2000, current: 0 }
  ]
};

let sleepChart = null;

// Dashboard functionality
let dashboardLayout = [];
let waterIntake = 0;
let moodHistory = [];

let moodChart = null;

// Wellness Hub Functions
function saveJournalEntry() {
    const entry = document.getElementById('journal-text').value;
    if (!entry.trim()) return;

    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    journalEntries.push({
        id: Date.now(),
        entry: entry,
        date: new Date().toISOString()
    });
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    document.getElementById('journal-text').value = '';
    displayJournalEntries();
}

function displayJournalEntries() {
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const entriesContainer = document.getElementById('journal-entries');
    
    if (journalEntries.length === 0) {
        entriesContainer.innerHTML = '<p class="no-entries">No journal entries yet. Start writing to see your history here!</p>';
        return;
    }

    entriesContainer.innerHTML = journalEntries
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(entry => `
            <div class="journal-entry-item">
                <div class="journal-entry-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="journal-entry-content">${entry.entry}</div>
                <button class="delete-journal-entry" onclick="deleteJournalEntry(${entry.id})">×</button>
            </div>
        `)
        .join('');
}

function deleteJournalEntry(id) {
    if (confirm('Are you sure you want to delete this journal entry?')) {
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const updatedEntries = journalEntries.filter(entry => entry.id !== id);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        displayJournalEntries();
    }
}

// Initialize Wellness Hub
function initWellnessHub() {
    displayJournalEntries();
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

// To-Do List Functions
function addTodo() {
    const todoInput = document.getElementById('todo-item');
    const todoText = todoInput.value.trim();
    
    if (!todoText) return;

    const todoList = document.getElementById('todo-list-items');
    const todoItem = document.createElement('li');
    todoItem.innerHTML = `
        <span>${todoText}</span>
        <button onclick="removeTodo(this)" class="delete-todo">×</button>
    `;
    
    todoList.appendChild(todoItem);
    todoInput.value = '';
    
    // Save to localStorage
    saveTodos();
}

function removeTodo(button) {
    const todoItem = button.parentElement;
    todoItem.remove();
    
    // Save to localStorage
    saveTodos();
}

function saveTodos() {
    const todoItems = Array.from(document.querySelectorAll('#todo-list-items li span')).map(span => span.textContent);
    localStorage.setItem('todos', JSON.stringify(todoItems));
}

function loadTodos() {
    const todoList = document.getElementById('todo-list-items');
    const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    
    savedTodos.forEach(todoText => {
        const todoItem = document.createElement('li');
        todoItem.innerHTML = `
            <span>${todoText}</span>
            <button onclick="removeTodo(this)" class="delete-todo">×</button>
        `;
        todoList.appendChild(todoItem);
    });
}

// Initialize To-Do List
function initTodoList() {
    loadTodos();
}

// Sleep Tracker Functions
function logSleep() {
    const date = document.getElementById('sleep-date').value;
    const start = document.getElementById('sleep-start').value;
    const end = document.getElementById('sleep-end').value;

    if (!date || !start || !end) {
        alert('Please fill in all fields');
        return;
    }

    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);
    
    // Handle overnight sleep
    if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
    }

    const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
    const sleepLog = {
        id: Date.now(),
        date: date,
        start: start,
        end: end,
        duration: duration.toFixed(1)
    };

    // Get existing logs
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    sleepLogs.push(sleepLog);
    localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs));

    // Clear inputs
    document.getElementById('sleep-date').value = '';
    document.getElementById('sleep-start').value = '';
    document.getElementById('sleep-end').value = '';

    // Update display
    displaySleepLogs();
    updateSleepChart();
}

function displaySleepLogs() {
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    const sleepLogContainer = document.getElementById('sleep-log');
    
    if (sleepLogs.length === 0) {
        sleepLogContainer.innerHTML = '<p class="no-entries">No sleep logs yet. Start tracking your sleep!</p>';
        return;
    }

    sleepLogContainer.innerHTML = sleepLogs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(log => `
            <div class="sleep-entry">
                <button class="delete-sleep" onclick="deleteSleepLog(${log.id})">×</button>
                <div class="sleep-entry-header">
                    <h4>${new Date(log.date).toLocaleDateString()}</h4>
                    <span class="sleep-duration">${log.duration} hours</span>
                </div>
                <div class="sleep-times">
                    <p>Bedtime: ${log.start}</p>
                    <p>Wake up: ${log.end}</p>
                </div>
                <div class="sleep-feedback ${log.duration >= 8 ? 'sufficient' : 'insufficient'}">
                    ${log.duration >= 8 ? 'Great sleep duration!' : 'Try to get more sleep'}
                </div>
            </div>
        `)
        .join('');
}

function deleteSleepLog(id) {
    if (confirm('Are you sure you want to delete this sleep log?')) {
        const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
        const updatedLogs = sleepLogs.filter(log => log.id !== id);
        localStorage.setItem('sleepLogs', JSON.stringify(updatedLogs));
        displaySleepLogs();
        updateSleepChart();
    }
}

function updateSleepChart() {
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    const ctx = document.getElementById('sleepChart');
    
    if (sleepLogs.length < 7) {
        document.getElementById('sleep-progress-message').textContent = 'Log 7 days of sleep to see your progress chart';
        return;
    }

    // Get last 7 days of sleep logs
    const last7Days = sleepLogs
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);

    const labels = last7Days.map(log => new Date(log.date).toLocaleDateString());
    const data = last7Days.map(log => parseFloat(log.duration));

    if (sleepChart) {
        sleepChart.destroy();
    }

    sleepChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sleep Duration (hours)',
                data: data,
                borderColor: '#40E0D0',
                backgroundColor: 'rgba(64, 224, 208, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 12,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Sleep Progress'
                }
            }
        }
    });

    // Calculate average sleep duration
    const average = data.reduce((a, b) => a + b, 0) / data.length;
    document.getElementById('sleep-progress-message').textContent = 
        `Average sleep duration: ${average.toFixed(1)} hours`;
}

// Initialize Sleep Tracker
function initSleepTracker() {
    displaySleepLogs();
    updateSleepChart();
}

// Initialize the app
function initApp() {
    // Show dashboard by default
    showSection('dashboard');
    initWellnessHub();
    initTodoList();
    initSleepTracker();
}

// Call initApp when the page loads
document.addEventListener('DOMContentLoaded', initApp);

// Widget Templates
const widgetTemplates = {
    'today-focus': {
        type: 'today-focus',
        title: "Today's Focus",
        content: `
            <div class="focus-item">
                <div class="focus-header">
                    <h4 class="focus-title">Workout Goal</h4>
                    <div class="focus-actions">
                        <button class="edit-focus-btn" onclick="editFocusItem(this)">✎</button>
                        <button class="delete-focus-btn" onclick="deleteFocusItem(this)">×</button>
                    </div>
                </div>
                <p class="focus-content">Complete 30 minutes of cardio</p>
            </div>
            <button class="add-focus-btn" onclick="addNewFocusItem()">+ Add Focus Item</button>
        `
    },
    'mood-tracker': {
        type: 'mood-tracker',
        title: 'Mood Tracker',
        content: `
            <div class="mood-selector">
                <button class="mood-btn" data-mood="very-happy">😄</button>
                <button class="mood-btn" data-mood="happy">😊</button>
                <button class="mood-btn" data-mood="neutral">😐</button>
                <button class="mood-btn" data-mood="sad">😢</button>
                <button class="mood-btn" data-mood="very-sad">😠</button>
                <button class="mood-reset-btn" title="Reset Mood">↺</button>
            </div>
            <div class="mood-history"></div>
        `
    },
    'water-tracker': {
        type: 'water-tracker',
        title: 'Water Intake',
        content: `
            <div class="water-progress">
                <div class="water-goal">
                    <span class="water-target">Daily Goal: 11-15 cups</span>
                    <span class="water-date"></span>
                </div>
                <div class="water-controls">
                    <button class="water-btn" onclick="adjustWater(-1)">-</button>
                    <div class="water-cups">
                        <button class="water-cup" onclick="addWaterCup()">🥤</button>
                        <span class="water-count">0/15</span>
                    </div>
                    <button class="water-btn" onclick="adjustWater(1)">+</button>
                </div>
                <div class="water-stats">
                    <div class="water-stat">
                        <span class="stat-label">Today's Progress</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    'mood-graph': {
        type: 'mood-graph',
        title: 'Mood Progress',
        content: `
            <div class="mood-graph-container">
                <canvas id="moodChart"></canvas>
            </div>
            <div class="mood-stats">
                <div class="mood-stat">
                    <span class="stat-label">Average Mood</span>
                    <span class="stat-value" id="averageMood">-</span>
                </div>
                <div class="mood-stat">
                    <span class="stat-label">Most Common</span>
                    <span class="stat-value" id="mostCommonMood">-</span>
                </div>
            </div>
        `
    }
};

// Widget Functions
function addWidget() {
    const widgetSelect = document.getElementById('widget-select');
    const widgetType = widgetSelect.value;
    
    if (!widgetType || !widgetTemplates[widgetType]) return;

    // Check if widget type already exists
    const existingWidgets = document.querySelectorAll('.widget');
    for (const widget of existingWidgets) {
        if (widget.getAttribute('data-widget-type') === widgetType) {
            alert('This widget type is already added to your dashboard!');
            widgetSelect.value = '';
            return;
        }
    }

    // Create new widget
    const widget = document.createElement('div');
    widget.className = 'widget';
    widget.setAttribute('data-widget-type', widgetType);

    // Get template content
    const template = widgetTemplates[widgetType];
    widget.innerHTML = `
        <div class="widget-header">
            <h3>${template.title}</h3>
            <button class="widget-close" onclick="removeWidget(this)">×</button>
        </div>
        <div class="widget-content">
            ${template.content}
        </div>
    `;

    // Add widget to dashboard
    const dashboardGrid = document.getElementById('dashboard-grid');
    dashboardGrid.appendChild(widget);

    // Save layout
    saveDashboardLayout();
    
    // Reset the dropdown
    widgetSelect.value = '';

    // Initialize widget-specific functionality
    if (widgetType === 'mood-tracker') {
        initMoodTracker(widget);
    } else if (widgetType === 'water-tracker') {
        initWaterTracker(widget);
    }
}

function removeWidget(button) {
    const widget = button.closest('.widget');
    widget.remove();
    saveDashboardLayout();
}

function saveDashboardLayout() {
    const widgets = document.querySelectorAll('.widget');
    const layout = Array.from(widgets).map(widget => ({
        type: widget.getAttribute('data-widget-type')
    }));
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
}

function loadDashboardLayout() {
    const layout = JSON.parse(localStorage.getItem('dashboardLayout') || '[]');
    layout.forEach(item => {
        if (widgetTemplates[item.type]) {
            const template = widgetTemplates[item.type];
            const widget = document.createElement('div');
            widget.className = 'widget';
            widget.setAttribute('data-widget-type', item.type);
            widget.innerHTML = `
                <div class="widget-header">
                    <h3>${template.title}</h3>
                    <button class="widget-close" onclick="removeWidget(this)">×</button>
                </div>
                <div class="widget-content">
                    ${template.content}
                </div>
            `;
            document.getElementById('dashboard-grid').appendChild(widget);
        }
    });
}

// Initialize Dashboard
function initDashboard() {
    // Clear any existing widgets
    const dashboardGrid = document.getElementById('dashboard-grid');
    dashboardGrid.innerHTML = '';
    
    // Clear saved layout
    localStorage.removeItem('dashboardLayout');
}

// Call initDashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initDashboard();
});

// Today's Focus Widget Functions
function addNewFocusItem() {
    const focusItem = document.createElement('div');
    focusItem.className = 'focus-item';
    focusItem.innerHTML = `
        <div class="focus-header">
            <h4 class="focus-title">New Focus</h4>
            <div class="focus-actions">
                <button class="edit-focus-btn" onclick="editFocusItem(this)">✎</button>
                <button class="delete-focus-btn" onclick="deleteFocusItem(this)">×</button>
            </div>
        </div>
        <p class="focus-content">Click to edit</p>
    `;
    
    const addButton = document.querySelector('.add-focus-btn');
    addButton.parentNode.insertBefore(focusItem, addButton);
    saveFocusItems();
}

function editFocusItem(button) {
    const focusItem = button.closest('.focus-item');
    const title = focusItem.querySelector('.focus-title').textContent;
    const content = focusItem.querySelector('.focus-content').textContent;
    
    focusItem.innerHTML = `
        <div class="focus-edit-form">
            <input type="text" class="focus-title-input" value="${title}" placeholder="Focus Title">
            <textarea class="focus-content-input" placeholder="Focus Content">${content}</textarea>
            <div class="focus-edit-buttons">
                <button onclick="saveFocusItem(this)">Save</button>
                <button onclick="cancelFocusEdit(this)">Cancel</button>
            </div>
        </div>
    `;
}

function saveFocusItem(button) {
    const focusItem = button.closest('.focus-item');
    const titleInput = focusItem.querySelector('.focus-title-input');
    const contentInput = focusItem.querySelector('.focus-content-input');
    
    focusItem.innerHTML = `
        <div class="focus-header">
            <h4 class="focus-title">${titleInput.value}</h4>
            <div class="focus-actions">
                <button class="edit-focus-btn" onclick="editFocusItem(this)">✎</button>
                <button class="delete-focus-btn" onclick="deleteFocusItem(this)">×</button>
            </div>
        </div>
        <p class="focus-content">${contentInput.value}</p>
    `;
    
    saveFocusItems();
}

function cancelFocusEdit(button) {
    const focusItem = button.closest('.focus-item');
    const title = focusItem.querySelector('.focus-title-input').value;
    const content = focusItem.querySelector('.focus-content-input').value;
    
    focusItem.innerHTML = `
        <div class="focus-header">
            <h4 class="focus-title">${title}</h4>
            <div class="focus-actions">
                <button class="edit-focus-btn" onclick="editFocusItem(this)">✎</button>
                <button class="delete-focus-btn" onclick="deleteFocusItem(this)">×</button>
            </div>
        </div>
        <p class="focus-content">${content}</p>
    `;
}

function deleteFocusItem(button) {
    if (confirm('Are you sure you want to delete this focus item?')) {
        button.closest('.focus-item').remove();
        saveFocusItems();
    }
}

function saveFocusItems() {
    const focusItems = Array.from(document.querySelectorAll('.focus-item')).map(item => ({
        title: item.querySelector('.focus-title').textContent,
        content: item.querySelector('.focus-content').textContent
    }));
    localStorage.setItem('focusItems', JSON.stringify(focusItems));
}

// Mood Tracker Functions
function updateMood(mood) {
    const moodHistory = document.querySelector('.mood-history');
    const now = new Date();
    const moodEntry = {
        mood: mood,
        time: now.toISOString()
    };
    
    // Save to localStorage
    const moodHistoryData = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    moodHistoryData.push(moodEntry);
    localStorage.setItem('moodHistory', JSON.stringify(moodHistoryData));
    
    // Update display
    displayMoodHistory();
    
    // Update selected state
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-mood') === mood) {
            btn.classList.add('selected');
        }
    });

    // Update the mood graph if it exists
    updateMoodGraph();
}

function displayMoodHistory() {
    const moodHistory = document.querySelector('.mood-history');
    const moodHistoryData = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    
    moodHistory.innerHTML = moodHistoryData
        .slice(-5) // Show last 5 entries
        .reverse()
        .map(entry => `
            <div class="mood-entry">
                <span class="mood-emoji">${getMoodEmoji(entry.mood)}</span>
                <span class="mood-time">${new Date(entry.time).toLocaleTimeString()}</span>
            </div>
        `)
        .join('');
}

function getMoodEmoji(mood) {
    const emojis = {
        'very-happy': '😄',
        'happy': '😊',
        'neutral': '😐',
        'sad': '😢',
        'very-sad': '😠'
    };
    return emojis[mood] || '😐';
}

// Water Tracker Functions
const WATER_GOAL = 15;

function addWaterCup() {
    waterIntake = Math.min(waterIntake + 1, WATER_GOAL);
    updateWaterDisplay();
    saveWaterIntake();
}

function adjustWater(amount) {
    waterIntake = Math.max(0, Math.min(waterIntake + amount, WATER_GOAL));
    updateWaterDisplay();
    saveWaterIntake();
}

function updateWaterDisplay() {
    const waterCount = document.querySelector('.water-count');
    const progressFill = document.querySelector('.progress-fill');
    
    if (waterCount) {
        waterCount.textContent = `${waterIntake}/${WATER_GOAL}`;
    }
    
    if (progressFill) {
        const percentage = (waterIntake / WATER_GOAL) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    // Show confetti when goal is reached
    if (waterIntake === WATER_GOAL) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

function saveWaterIntake() {
    localStorage.setItem('waterIntake', waterIntake.toString());
}

// Initialize widget-specific functionality
function initMoodTracker(widget) {
    const moodButtons = widget.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            updateMood(mood);
        });
    });
    
    // Initialize mood history display
    displayMoodHistory();

    // Initialize mood graph if it exists
    updateMoodGraph();
}

function initWaterTracker(widget) {
    // Load saved water intake
    waterIntake = parseInt(localStorage.getItem('waterIntake') || '0');
    updateWaterDisplay();
    
    // Set today's date
    const waterDate = widget.querySelector('.water-date');
    if (waterDate) {
        waterDate.textContent = new Date().toLocaleDateString();
    }
}

// Mood Graph Functions
function updateMoodGraph() {
    const moodHistoryData = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    if (moodHistoryData.length === 0) return;

    // Get last 7 days of mood data
    const last7Days = moodHistoryData
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .slice(-7);

    // Group moods by day
    const moodByDay = {};
    last7Days.forEach(entry => {
        const date = new Date(entry.time).toLocaleDateString();
        if (!moodByDay[date]) {
            moodByDay[date] = [];
        }
        moodByDay[date].push(entry.mood);
    });

    // Calculate average mood for each day
    const labels = Object.keys(moodByDay);
    const data = labels.map(date => {
        const moods = moodByDay[date];
        const moodValues = moods.map(mood => getMoodValue(mood));
        return moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    });

    // Update stats
    updateMoodStats(moodHistoryData);

    // Create or update chart
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    if (moodChart) {
        moodChart.destroy();
    }

    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Trend',
                data: data,
                borderColor: '#40E0D0',
                backgroundColor: 'rgba(64, 224, 208, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 4,
                    ticks: {
                        callback: function(value) {
                            return getMoodEmojiByValue(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Mood: ${getMoodEmojiByValue(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

function getMoodValue(mood) {
    const values = {
        'very-happy': 4,
        'happy': 3,
        'neutral': 2,
        'sad': 1,
        'very-sad': 0
    };
    return values[mood] || 2;
}

function getMoodEmojiByValue(value) {
    const emojis = ['😠', '😢', '😐', '😊', '😄'];
    return emojis[Math.round(value)] || '😐';
}

function updateMoodStats(moodHistoryData) {
    // Calculate average mood
    const moodValues = moodHistoryData.map(entry => getMoodValue(entry.mood));
    const average = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    const averageMoodElement = document.getElementById('averageMood');
    if (averageMoodElement) {
        averageMoodElement.textContent = getMoodEmojiByValue(average);
    }

    // Calculate most common mood
    const moodCounts = moodHistoryData.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {});
    
    const mostCommonMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    const mostCommonMoodElement = document.getElementById('mostCommonMood');
    if (mostCommonMoodElement) {
        mostCommonMoodElement.textContent = getMoodEmoji(mostCommonMood);
    }
}
