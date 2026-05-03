document.addEventListener('DOMContentLoaded', () => {
// 1. Initialize Lucide icons if available
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
} else if (typeof window.lucide !== 'undefined') {
  window.lucide.createIcons();
}

// 2. Goal Configuration & Weights (Adding up to 0.8 / 80%)
const metricsGoal = {
  fcrWeight: 0.1, crsWeight: 0.3, ahtWeight: 0.1, qaWeight: 0.3,
  fcrGoal: 68, crsGoal: 85, qaGoal: 80, ahtGoal: 14
};

// 3. DOM Elements Selection
const fcrInput = document.getElementById('fcrInput'),
    crsInput = document.getElementById('crsInput'),
    ahtInput = document.getElementById('ahtInput'),
    qaInput = document.getElementById('qaInput'),
    calcBtn = document.getElementById('bscBtn'),
    clearBtn = document.getElementById('clearBtn'),
    resultDisplay = document.getElementById('totalBSC'),
    resultContainer = document.getElementById('resultContainer'),
    progressFillCircle = document.getElementById('progressFillCircle'),
    metricsLegendList = document.getElementById('metricsLegendList'),
    achievementMessage = document.getElementById('achievementMessage'),
    statusBadge = document.getElementById('statusBadge'),
    performanceTips = document.getElementById('performanceTips');

// Adjust font size inside the score circle
if (resultDisplay) {
  resultDisplay.style.fontSize = "1.85rem"; 
  resultDisplay.style.fontWeight = "700";
  resultDisplay.style.letterSpacing = "-0.03em";
}

// Dynamic styles for animations and faded placeholders
if (!document.getElementById('customAnimationStyles')) {
  const style = document.createElement('style');
  style.id = 'customAnimationStyles';
  style.innerHTML = `
      input::placeholder {
          color: #64748b !important;
          opacity: 0.5 !important;
      }
      @keyframes alertSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
      }
      @keyframes alertFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-8px); }
      }
      @keyframes pulsePopOut {
          0% { transform: scale(0.6); opacity: 0; }
          65% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
      }
      @keyframes attentionShake {
          0%, 100% { transform: scale(1) rotate(0deg); }
          15%, 45% { transform: scale(1.05) rotate(-3deg); }
          30%, 60% { transform: scale(1.05) rotate(3deg); }
          75% { transform: scale(1.01) rotate(0deg); }
      }
      .shake-attention {
          animation: attentionShake 1.8s ease-in-out infinite !important;
      }
  `;
  document.head.appendChild(style);
}

// 4. Mathematical Score Calculation
function getMetricAchievement(actual, goal, isInverse = false) {
  if (!actual || actual <= 0) return 0;
  const numActual = Number(actual);
  if (isInverse && numActual <= 1) return 0;

  return isInverse ? goal / numActual : numActual / goal;
}

// Color Interpolation Helper
function interpolateColor(color1, color2, factor) {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// Hex to RGB Helper for Hover Transformations
function hexToRgba(hex, alpha) {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c = hex.substring(1).split('');
      if(c.length == 3){
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c>>16)&255, (c>>8)&255, c&255].join(',') + ',' + alpha + ')';
  }
  return hex;
}

// Generates progressive coloring based on custom rules
function getProgressiveColor(score) {
  if (score >= 100) return 'rgb(16, 185, 129)'; 
  if (score >= 75 && score < 100) return 'rgb(59, 130, 246)'; 

  const clamped = Math.max(0, score);
  const red = [239, 68, 68];       
  const orange = [249, 115, 22];    
  const blue = [59, 130, 246];     

  if (clamped <= 33.33) {
      return interpolateColor(red, orange, clamped / 33.33);
  } else {
      return interpolateColor(orange, blue, (clamped - 33.33) / 41.67);
  }
}

// 5. Clear Error Styling from Input
function resetInputError(inputEl) {
  inputEl.style.borderColor = '';
  inputEl.style.backgroundColor = '';
  inputEl.style.boxShadow = '';
}

// Attach real-time input listeners to clear error styles
[fcrInput, crsInput, ahtInput, qaInput].forEach(input => {
  if (input) {
      input.addEventListener('input', () => resetInputError(input));
  }
});

// 6. High-Visibility Inline UI Alert for Incomplete Inputs
function showInputError(missingMetrics) {
  let existingAlert = document.getElementById('inputValidationError');
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.id = 'inputValidationError';
  
  Object.assign(alertDiv.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      borderLeft: '4px solid #ef4444',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      width: '100%',
      boxSizing: 'border-box',
      animation: 'alertSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: '1'
  });

  const missingText = missingMetrics.join(', ');

  alertDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
          <div style="color: #ef4444; flex-shrink: 0; display: flex; align-items: center;">
              <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
          </div>
          <span style="color: #991b1b; font-size: 0.8rem; font-weight: 600; line-height: 1.4;">
              Missing values for: <strong>${missingText}</strong>. Please enter them to compute score.
          </span>
      </div>
      <button id="dismissAlertBtn" style="background: none; border: none; cursor: pointer; color: #f87171; display: flex; align-items: center; padding: 4px; transition: color 0.15s ease;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#f87171'">
          <i data-lucide="x" style="width: 16px; height: 16px;"></i>
      </button>
  `;

  const inputParent = fcrInput.closest('div').parentElement;
  inputParent.insertBefore(alertDiv, inputParent.firstChild);
  
  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('dismissAlertBtn').addEventListener('click', dismissAlert);

  setTimeout(dismissAlert, 5000);

  function dismissAlert() {
      if (alertDiv && alertDiv.parentNode) {
          alertDiv.style.animation = 'alertFadeOut 0.25s ease forwards';
          alertDiv.addEventListener('animationend', () => {
              if (alertDiv.parentNode) alertDiv.remove();
          });
      }
  }
}

// 7. Performance Tips Generation for Lyft Live Chat
function generatePerformanceTips(fcr, crs, aht, qa, isSuccess) {
  let tipsHtml = '';
  
  const gridWrapper = `
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); 
      gap: 16px; 
      margin-top: 16px; 
      width: 100%;
      box-sizing: border-box;
      align-items: stretch;
  `;
  
  const getCardStyle = (accentColor) => `
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 3.5px solid ${accentColor};
      border-radius: 8px;
      box-sizing: border-box;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 84px;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                  box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                  background-color 0.25s ease, 
                  border-color 0.25s ease;
  `;

  const headerRowStyle = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      width: 100%;
      box-sizing: border-box;
      gap: 16px;
      height: 100%;
  `;

  const iconBox = (bg, color) => `
      height: 36px; width: 36px; border-radius: 6px; 
      background: ${bg}; color: ${color}; 
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: transform 0.2s ease;
  `;

  if (isSuccess) {
      tipsHtml = `
          <div style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Operational Status</div>
          <div style="${gridWrapper}">
              <div style="${getCardStyle('#10b981')} cursor: default;">
                  <div style="${headerRowStyle}">
                      <div style="display: flex; align-items: center; gap: 12px;">
                          <div style="${iconBox('#ecfdf5', '#059669')}"><i data-lucide="check-circle-2" style="width:16px; height:16px;"></i></div>
                          <span style="color: #0f172a; font-size: 0.85rem; font-weight: 600;">Performance Standard Met</span>
                      </div>
                  </div>
              </div>
          </div>
      `;
  } else {
      let modules = '';
      const data = [
          { id: 'FCR', val: parseFloat(fcr), goal: metricsGoal.fcrGoal, name: 'First Contact Resolution', desc: 'Ensure ride adjustments, cancellations, and driver/rider matching queries are completely resolved in the initial live chat session without transfers.', icon: 'target', bg: '#fff7ed', text: '#c2410c', metricColor: '#ea580c' },
          { id: 'CSAT', val: parseFloat(crs), goal: metricsGoal.crsGoal, name: 'Customer Satisfaction', desc: 'Deliver rapid, empathetic responses for ride issues, driver disputes, or lost item recovery to boost live rating scores.', icon: 'smile', bg: '#fff1f2', text: '#be123c', metricColor: '#e11d48' },
          { id: 'AHT', val: parseFloat(aht), goal: metricsGoal.ahtGoal, name: 'Average Handle Time', desc: 'Avoid over-texting. Optimize concurrent chat sessions and use macro templates efficiently to resolve passenger/driver tickets quicker.', icon: 'clock', bg: '#f0f9ff', text: '#0369a1', metricColor: '#0284c7', inverse: true },
          { id: 'QA', val: parseFloat(qa), goal: metricsGoal.qaGoal, name: 'Quality Assurance', desc: 'Always verify user identities, accurately apply promotional credits, and maintain strict protocol compliance on safety/damage reports.', icon: 'shield-check', bg: '#f5f3ff', text: '#6d28d9', metricColor: '#7c3aed' }
      ];

      data.forEach((item, index) => {
          const isUnder = item.inverse ? item.val > item.goal : item.val < item.goal;
          if (isUnder) {
              modules += `
                  <div onclick="document.getElementById('modal-${index}').showModal()" 
                       class="diagnostic-card"
                       data-metric-color="${item.metricColor}"
                       style="${getCardStyle(item.metricColor)}"
                       onmouseenter="
                          const col = this.getAttribute('data-metric-color');
                          this.style.backgroundColor = '${hexToRgba(item.metricColor, 0.04)}';
                          this.style.borderColor = col;
                          this.style.boxShadow = '0 6px 16px ' + '${hexToRgba(item.metricColor, 0.12)}';
                          this.style.transform = 'translateY(-2px)';
                          this.querySelector('.chevron-arrow').style.transform = 'translateX(2px)';
                       " 
                       onmouseleave="
                          this.style.backgroundColor = '#ffffff';
                          this.style.borderColor = '#e2e8f0';
                          this.style.boxShadow = 'none';
                          this.style.transform = 'translateY(0px)';
                          this.querySelector('.chevron-arrow').style.transform = 'translateX(0px)';
                       "
                  >
                      <div style="${headerRowStyle}">
                          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                              <div style="${iconBox(item.bg, item.text)}"><i data-lucide="${item.icon}" style="width:16px; height:16px;"></i></div>
                              <div>
                                  <h4 style="margin: 0; color: #0f172a; font-size: 0.85rem; font-weight: 600; letter-spacing: -0.01em;">${item.id} Diagnostic</h4>
                                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                                      <p style="margin: 0; color: #64748b; font-size: 0.725rem; font-weight: 400;">Review details</p>
                                      <i data-lucide="info" style="width: 11px; height: 11px; color: #94a3b8; stroke-width: 2px;"></i>
                                  </div>
                              </div>
                          </div>
                          <i data-lucide="chevron-right" class="chevron-arrow" style="width: 16px; height: 16px; color: #94a3b8; flex-shrink: 0; transition: transform 0.2s ease;"></i>
                      </div>

                      <dialog id="modal-${index}" onclick="event.stopPropagation()" style="
                          border: none; border-radius: 8px; padding: 24px; width: calc(100% - 32px); max-width: 360px; margin: auto; background: #ffffff; box-shadow: 0 12px 32px -6px rgba(0, 0, 0, 0.08); outline: none; box-sizing: border-box; animation: modalEnter 0.15s cubic-bezier(0.16, 1, 0.3, 1);
                      ">
                          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                              <div style="${iconBox(item.bg, item.text)}"><i data-lucide="${item.icon}" style="width:16px; height:16px;"></i></div>
                              <h3 style="margin: 0; color: #0f172a; font-size: 0.925rem; font-weight: 700;">${item.name}</h3>
                          </div>
                          <p style="color: #475569; font-size: 0.8rem; line-height: 1.55; text-align: left; margin: 0 0 18px 0; border-left: 2px solid ${item.metricColor}; padding-left: 10px;">
                              ${item.desc}
                          </p>
                          <div style="display: flex; justify-content: flex-end;">
                              <button onclick="document.getElementById('modal-${index}').close()" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #ffffff; color: #475569;">
                                  Dismiss
                              </button>
                          </div>
                      </dialog>
                  </div>
              `;
          }
      });

      tipsHtml = `
          <div style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Lyft Chat Support Optimization</div>
          <div style="${gridWrapper}">${modules}</div>
      `;
  }

  performanceTips.innerHTML = tipsHtml;
  performanceTips.style.display = 'block';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// 8. Dynamic Confetti Celebration (Optimized for 3.5s)
function triggerConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);

  const pieceCount = 35; 
  const baseColors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';

      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = baseColors[Math.floor(Math.random() * baseColors.length)];
      
      const scale = 0.45 + Math.random() * 0.75;
      piece.style.width = (10 * scale) + 'px';
      piece.style.height = (22 * scale) + 'px';

      piece.style.setProperty('--x-drift', (Math.random() * 250 - 125) + 'px');
      piece.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg');
      
      piece.style.animationDelay = (Math.random() * 0.5) + 's';

      confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
      confettiContainer.remove();
  }, 4000);
}

// 9. Additive Weighted Sum Calculation
function performCalculation() {
  const inputChecks = [
      { el: fcrInput, name: 'FCR' },
      { el: crsInput, name: 'CSAT' },
      { el: ahtInput, name: 'AHT' },
      { el: qaInput, name: 'QA' }
  ];
  
  let missingMetrics = [];
  const oldAlert = document.getElementById('inputValidationError');
  if (oldAlert) oldAlert.remove();

  inputChecks.forEach(item => {
      if (!item.el.value.trim()) {
          missingMetrics.push(item.name);
          item.el.style.borderColor = '#ef4444';
          item.el.style.backgroundColor = '#fef2f2';
          item.el.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.12)';
      } else {
          resetInputError(item.el);
      }
  });

  if (missingMetrics.length > 0) {
      showInputError(missingMetrics);
      return;
  }

  // Compute individual achievements
  const fcrAch = getMetricAchievement(fcrInput.value, metricsGoal.fcrGoal),
        crsAch = getMetricAchievement(crsInput.value, metricsGoal.crsGoal),
        qaAch = getMetricAchievement(qaInput.value, metricsGoal.qaGoal),
        ahtAch = getMetricAchievement(ahtInput.value, metricsGoal.ahtGoal, true);

  // Additive Weighted Contributions
  const fcrPoints = fcrAch * (metricsGoal.fcrWeight * 100);
  const crsPoints = crsAch * (metricsGoal.crsWeight * 100);
  const qaPoints = qaAch * (metricsGoal.qaWeight * 100);
  const ahtPoints = ahtAch * (metricsGoal.ahtWeight * 100);
  
  // Final Score
  const finalScore = fcrPoints + crsPoints + qaPoints + ahtPoints + 20;

  resultDisplay.textContent = finalScore.toFixed(2) + "%";

  // Breakdown items for display
  const metricSummary = [
      { label: 'First Contact Resolution', val: fcrPoints, color: '#ea580c' },
      { label: 'Customer Satisfaction', val: crsPoints, color: '#e11d48' },
      { label: 'Average Handle Time', val: ahtPoints, color: '#0284c7' },
      { label: 'Quality Assurance', val: qaPoints, color: '#7c3aed' },
      { label: 'Attendance Base Credit', val: 20, color: '#64748b' }
  ];

  metricsLegendList.innerHTML = `
      <div style="border-top: 1px solid #f1f5f9; padding-top: 4px; margin-top: 4px; width: 100%;">
          ${metricSummary.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f8fafc;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="display: inline-block; width: 3px; height: 14px; border-radius: 2px; background-color: ${item.color};"></span>
                      <span style="font-size: 0.8rem; font-weight: 500; color: #334155;">${item.label}</span>
                  </div>
                  <span style="font-size: 0.8rem; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums;">${item.val.toFixed(1)}%</span>
              </div>
          `).join('')}
      </div>
  `;

  const isSuccess = finalScore >= 100;
  const progressiveColor = getProgressiveColor(finalScore);
  
  // Dynamic isolated ring glow trigger
  if (isSuccess) {
      progressFillCircle.classList.add('circle-glow-success');
  } else {
      progressFillCircle.classList.remove('circle-glow-success');
  }

  progressFillCircle.style.stroke = progressiveColor;
  progressFillCircle.style.strokeWidth = "5";
  progressFillCircle.style.strokeLinecap = "round";
  progressFillCircle.style.transition = "stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease";
  
  const bgCircle = progressFillCircle.previousElementSibling;
  if (bgCircle) {
      bgCircle.style.stroke = "#f1f5f9";
      bgCircle.style.strokeWidth = "5";
  }

  const circumference = 2 * Math.PI * 92;
  const boundedVisualScore = Math.min(finalScore, 100);
  const dashOffset = circumference - (boundedVisualScore / 100 * circumference);
  progressFillCircle.style.strokeDashoffset = dashOffset;

  resultDisplay.style.color = progressiveColor;
  resultDisplay.style.transition = "color 0.3s ease";

  resultContainer.classList.add('show');

  generatePerformanceTips(fcrInput.value, crsInput.value, ahtInput.value, qaInput.value, isSuccess);

  Object.assign(statusBadge.style, {
      backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
      color: isSuccess ? "#15803d" : "#b91c1c",
      border: `1px solid ${isSuccess ? '#dcfce7' : '#fee2e2'}`,
      padding: "3px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "0.675rem", display: "inline-block"
  });
  statusBadge.textContent = isSuccess ? "Exceeds Goals" : "Keep Improving";

  if (isSuccess) {
      triggerConfetti();
      achievementMessage.innerHTML = `<span style="color: #475569; font-size: 0.8rem;"><strong>Mastery Status:</strong> Overachievement unlocked! Lyft operational targets fully exceeded.</span>`;
  } else {
      achievementMessage.innerHTML = `
          <div style="position: relative; padding-top: 36px; width: 100%; box-sizing: border-box;">
              <button id="scrollToTipsBtn" style="
                  position: absolute; top: -16px; right: 0; display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; font-size: 0.725rem; border-radius: 30px; font-weight: 700; cursor: pointer; border: 1px solid #ef4444; background: #ef4444; color: #ffffff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25); transition: opacity 0.2s, transform 0.2s;
                  opacity: 0; transform: scale(0.6); pointer-events: none;
              " aria-label="View performance factors">
                  <i data-lucide="info" style="width: 13px; height: 13px; stroke-width: 2.5px;"></i>
                  Factors
                  <span style="position: absolute; bottom: -4px; right: 22px; width: 8px; height: 8px; background: #ef4444; transform: rotate(45deg); box-sizing: border-box; transition: background 0.2s;" id="tooltipPointer"></span>
              </button>
              <span style="color: #475569; font-size: 0.8rem; line-height: 1.45; display: block;">
                  <strong>Action Plan:</strong> Focus on the live chat metrics below to improve your scorecard.
              </span>
          </div>
      `;

      const btn = document.getElementById('scrollToTipsBtn');
      const pointer = document.getElementById('tooltipPointer');
      if (btn && pointer) {
          btn.addEventListener('mouseover', () => { pointer.style.background = '#dc2626'; });
          btn.addEventListener('mouseout', () => { pointer.style.background = '#ef4444'; });
          
          btn.addEventListener('click', () => {
              performanceTips.scrollIntoView({ behavior: 'smooth', block: 'start' });
              btn.style.animation = 'none';
              btn.classList.remove('shake-attention');
          });
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  requestAnimationFrame(() => {
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (!isSuccess) {
      setTimeout(() => {
          const btn = document.getElementById('scrollToTipsBtn');
          if (btn) {
              btn.style.pointerEvents = 'auto';
              btn.style.opacity = '1';
              btn.classList.add('shake-attention');
          }
      }, 550);
  }
}

// 10. Event listeners for Keydown & Reset Actions
const inputs = [fcrInput, crsInput, ahtInput, qaInput];
inputs.forEach(input => {
  if (input) {
      input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
              event.preventDefault();
              performCalculation();
          }
      });
  }
});

if (calcBtn) calcBtn.addEventListener('click', performCalculation);

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
      inputs.forEach(i => { 
          if(i) {
              i.value = '';
              resetInputError(i);
          }
      });
      resultContainer.classList.remove('show');
      performanceTips.style.display = 'none';
      metricsLegendList.innerHTML = '';
      
      const oldAlert = document.getElementById('inputValidationError');
      if (oldAlert) oldAlert.remove();

      const circumference = 2 * Math.PI * 92;
      progressFillCircle.style.strokeDashoffset = circumference;
      resultDisplay.style.color = "#0f172a";
      
      // Clear glowing aura
      progressFillCircle.classList.remove('circle-glow-success');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
});
