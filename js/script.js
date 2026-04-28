// 1. Configuration Data
const metricsGoal = {
    fcrWeight: 0.10,
    crsWeight: 0.30,
    ahtWeight: 0.10,
    qaWeight: 0.30,
    fcrGoal: 68,
    crsGoal: 85,
    qaGoal: 80,
    ahtGoal: 14
};

// 2. Select Elements
const fcrInput = document.querySelector('#fcrInput');
const crsInput = document.querySelector('#crsInput');
const ahtInput = document.querySelector('#ahtInput');
const qaInput = document.querySelector('#qaInput');
const calcBtn = document.querySelector('#bscBtn');
const clearBtn = document.querySelector('#clearBtn');
const resultDisplay = document.querySelector('#totalBSC');
const resultContainer = document.querySelector('#resultContainer');
const progressFill = document.querySelector('#progressFill');
const achievementMessage = document.querySelector('#achievementMessage');

// 3. Calculation Logic
function calculateMetricScore(actual, goal, weight, isInverse = false) {
    if (!actual || actual <= 0) return 0;
   
    let achievement;
    if (isInverse) {
        // For AHT: Lower actual results in higher achievement
        achievement = goal / Number(actual);
    } else {
        // Standard achievement: Actual / Goal
        achievement = Number(actual) / goal;
    }
   
    // Weighting the achievement (e.g., achievement * 10% weight * 100 for percentage)
    return achievement * (weight * 100);
}

// 4. Main Event Listener
calcBtn.addEventListener('click', () => {
    const fcrScore = calculateMetricScore(fcrInput.value, metricsGoal.fcrGoal, metricsGoal.fcrWeight);
    const crsScore = calculateMetricScore(crsInput.value, metricsGoal.crsGoal, metricsGoal.crsWeight);
    const qaScore = calculateMetricScore(qaInput.value, metricsGoal.qaGoal, metricsGoal.qaWeight);
    const ahtScore = calculateMetricScore(ahtInput.value, metricsGoal.ahtGoal, metricsGoal.ahtWeight, true);
   
    const total = fcrScore + crsScore + qaScore + ahtScore;
    
    // Add 20% to reach 100% max (converting 80% max to 100% max)
    const finalScore = total + 20;
   
    // Update display
    resultDisplay.textContent = finalScore.toFixed(2) + "%";
    
    // Update progress bar
    const progressPercentage = Math.min(finalScore, 100);
    progressFill.style.width = progressPercentage + "%";
    
    // Show result container
    resultContainer.classList.add('show');
    
    // Update achievement message
    if (finalScore >= 100) {
        achievementMessage.className = 'achievement-message excellent';
        achievementMessage.textContent = '🎉 You have reached BSC (Balanced Scorecard Achievement)!';
    } else {
        achievementMessage.className = 'achievement-message good';
        achievementMessage.textContent = '⭐ Keep improving to reach 100% and achieve BSC!';
    }
});

// 5. Clear Button Event Listener
clearBtn.addEventListener('click', () => {
    fcrInput.value = '';
    crsInput.value = '';
    ahtInput.value = '';
    qaInput.value = '';
    resultContainer.classList.remove('show');
    resultDisplay.textContent = '0.00%';
    progressFill.style.width = '0%';
});