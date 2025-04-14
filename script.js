let totalSteps = 0;
let totalBurned = 0;
let totalConsumed = 0;

function logWorkout() {
  const date = document.getElementById('workout-date').value;
  const steps = parseInt(document.getElementById('steps').value);
  const burned = parseInt(document.getElementById('calories-burned').value);

  if (!date || isNaN(steps) || isNaN(burned)) {
    alert('Please fill out all workout fields.');
    return;
  }

  totalSteps += steps;
  totalBurned += burned;

  updateSummary();
  addToLog(`🏃‍♂️ <strong>${date}</strong>: ${steps} steps, ${burned} cal burned`);
  clearWorkoutInputs();
}

function logMeal() {
  const meal = document.getElementById('meal-name').value;
  const calories = parseInt(document.getElementById('meal-calories').value);

  if (!meal || isNaN(calories)) {
    alert('Please fill out all meal fields.');
    return;
  }

  totalConsumed += calories;

  updateSummary();
  addToLog(`🍽️ <strong>${meal}</strong>: ${calories} cal consumed`);
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
}

function clearMealInputs() {
  document.getElementById('meal-name').value = '';
  document.getElementById('meal-calories').value = '';
}
