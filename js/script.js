document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Goal Configurations & Weights
    const metricsGoal = {
        fcrWeight: 0.1, crsWeight: 0.3, ahtWeight: 0.1, qaWeight: 0.3,
        fcrGoal: 68, crsGoal: 85, qaGoal: 80, ahtGoal: 14
    };

    // 3. Cached DOM Selectors
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

    // 4. Mathematical Score Calculation
    function calculateMetricScore(actual, goal, weight, isInverse = false) {
        if (!actual || actual <= 0) return 0;
        const numActual = Number(actual);
        const achievement = isInverse ? goal / numActual : numActual / goal;
        return achievement * (weight * 100);
    }

    // Color Interpolation Helper
    function interpolateColor(color1, color2, factor) {
        const result = color1.slice();
        for (let i = 0; i < 3; i++) {
            result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
        }
        return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
    }

    // 5. Precise Progressive Color Rules
    function getProgressiveColor(score) {
        // Exact 100%+ emerald green
        if (score >= 100) return 'rgb(16, 185, 129)';
        // Exact 75% to 99% solid blue
        if (score >= 75) return 'rgb(59, 130, 246)';

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

    // 6. Generate Contextual Insights with Justified Text Modals
    function generatePerformanceTips(fcr, crs, aht, qa, isSuccess) {
        let tipsHtml = '';
        const cardGrid = `grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full`;
        const cardStyle = `bg-white p-4 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer border-l-4 select-none`;

        if (isSuccess) {
            tipsHtml = `
                <div class="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest mb-2">Operational Status</div>
                <div class="${cardGrid}">
                    <div class="${cardStyle}" style="border-left-color: #10b981; cursor: default;">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-emerald-50 text-emerald-600 rounded-md flex-shrink-0">
                                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                            </div>
                            <span class="text-sm font-semibold text-slate-900">Scorecard Goals Exceeded</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            let modules = '';
            const data = [
                { id: 'FCR', val: parseFloat(fcr), goal: metricsGoal.fcrGoal, name: 'First Call Resolution', desc: 'Focus on fully answering queries within a single contact session. Check specific ID strings or adjustment records and explicitly verify with your customer if all core points were cleared before ending interactions.', icon: 'target', metricColor: '#ea580c', bg: 'bg-orange-50', text: 'text-orange-700' },
                { id: 'CSAT', val: parseFloat(crs), goal: metricsGoal.crsGoal, name: 'Customer Satisfaction', desc: 'Raise survey validation performance by recognizing high-friction friction moments early. Express genuine, direct empathy at the start of interactions to establish positive rapport.', icon: 'smile', metricColor: '#e11d48', bg: 'bg-rose-50', text: 'text-rose-700' },
                { id: 'AHT', val: parseFloat(aht), goal: metricsGoal.ahtGoal, name: 'Average Handle Time', desc: 'Optimize talk & chat time. Leverage standard templates for recurrent technical workflows without sacrificing accuracy.', icon: 'clock', metricColor: '#0284c7', bg: 'bg-sky-50', text: 'text-sky-700', inverse: true },
                { id: 'QA', val: parseFloat(qa), goal: metricsGoal.qaGoal, name: 'Quality Assurance', desc: 'Preserve process-wide integrity by validating core guidelines. Ensure required security checks are completed before making sensitive financial adjustments.', icon: 'shield-check', metricColor: '#7c3aed', bg: 'bg-purple-50', text: 'text-purple-700' }
            ];

            data.forEach((item, index) => {
                const isUnder = item.inverse ? item.val > item.goal : item.val < item.goal;
                if (isUnder) {
                    modules += `
                        <div onclick="document.getElementById('modal-${index}').showModal()" class="${cardStyle}" style="border-left-color: ${item.metricColor};">
                            <div class="flex items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-md flex-shrink-0 ${item.bg} ${item.text}">
                                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-slate-900 font-semibold text-sm m-0 leading-tight">${item.id} Guidance Needed</h4>
                                        <div class="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                                            <span>View details</span>
                                            <i data-lucide="info" class="w-3 h-3"></i>
                                        </div>
                                    </div>
                                </div>
                                <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300 flex-shrink-0"></i>
                            </div>

                            <dialog id="modal-${index}" onclick="event.stopPropagation()" class="border-none rounded-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-[calc(100%-32px)] bg-white shadow-xl focus:outline-none backdrop-blur-md mx-auto my-auto select-none">
                                <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 select-none">
                                    <div class="p-2 rounded-md ${item.bg} ${item.text}">
                                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                                    </div>
                                    <h3 class="text-slate-900 font-bold text-base leading-tight">${item.name}</h3>
                                </div>
                                <p class="text-slate-600 text-sm leading-relaxed mb-6 text-justify" style="text-justify: inter-word; border-left: 3px solid ${item.metricColor}; padding-left: 12px;">
                                    ${item.desc}
                                </p>
                                <div class="flex justify-end select-none">
                                    <button type="button" onclick="document.getElementById('modal-${index}').close()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 font-semibold text-xs transition-colors cursor-pointer select-none">
                                        Dismiss
                                    </button>
                                </div>
                            </dialog>
                        </div>
                    `;
                }
            });

            tipsHtml = `
                <div class="text-[0.7rem] font-bold text-slate-500 uppercase tracking-widest mb-2">Performance Focus Points</div>
                <div class="${cardGrid}">${modules}</div>
            `;
        }

        performanceTips.innerHTML = tipsHtml;
        performanceTips.style.display = 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 7. Calculate Results & Apply Progressive Colors
    function performCalculation() {
        const vals = [fcrInput.value, crsInput.value, ahtInput.value, qaInput.value];
        if (vals.some(v => v.trim() === '')) {
            alert("Please fill in all the scorecard inputs.");
            return;
        }

        const fcrS = calculateMetricScore(vals[0], metricsGoal.fcrGoal, metricsGoal.fcrWeight),
              crsS = calculateMetricScore(vals[1], metricsGoal.crsGoal, metricsGoal.crsWeight),
              qaS  = calculateMetricScore(vals[3], metricsGoal.qaGoal, metricsGoal.qaWeight),
              ahtS = calculateMetricScore(vals[2], metricsGoal.ahtGoal, metricsGoal.ahtWeight, true);
        
        const finalScore = Math.min((fcrS + crsS + qaS + ahtS + 20), 150);
        resultDisplay.textContent = finalScore.toFixed(2) + "%";

        const metricSummary = [
            { label: 'First Call Resolution', val: fcrS, color: '#ea580c' },
            { label: 'Customer Satisfaction', val: crsS, color: '#e11d48' },
            { label: 'Average Handle Time', val: ahtS, color: '#0284c7' },
            { label: 'Quality Assurance', val: qaS, color: '#7c3aed' },
            { label: 'Attendance Base Credit', val: 20, color: '#64748b' }
        ];

        metricsLegendList.innerHTML = `
            <div class="border-t border-slate-100 pt-3 mt-3 w-full space-y-2">
                ${metricSummary.map(item => `
                    <div class="flex items-center justify-between py-1 font-sans">
                        <div class="flex items-center gap-2">
                            <span class="w-1 h-3 rounded bg-current flex-shrink-0" style="color: ${item.color}"></span>
                            <span class="text-xs font-medium text-slate-600">${item.label}</span>
                        </div>
                        <span class="text-xs font-bold text-slate-800 tracking-tight">${item.val.toFixed(1)}%</span>
                    </div>
                `).join('')}
            </div>
        `;

        const isSuccess = finalScore >= 100;
        const color = getProgressiveColor(finalScore);

        // Update Visual Ring Path & Text Color
        progressFillCircle.style.stroke = color;
        const circumference = 578.05; // (2 * Math.PI * 92)
        progressFillCircle.style.strokeDashoffset = circumference - (Math.min(finalScore, 150) / 150 * circumference);
        resultDisplay.style.color = color;

        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('show');

        generatePerformanceTips(vals[0], vals[1], vals[2], vals[3], isSuccess);

        Object.assign(statusBadge.style, {
            backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
            color: isSuccess ? "#15803d" : "#b91c1c",
            border: `1px solid ${isSuccess ? '#dcfce7' : '#fee2e2'}`,
            padding: "4px 10px", borderRadius: "6px", fontWeight: "700", fontSize: "0.675rem"
        });
        statusBadge.textContent = isSuccess ? "EXCEEDS GOALS" : "KEEP IMPROVING";
        
        achievementMessage.innerHTML = isSuccess 
            ? `<strong>Status Update:</strong> Your team's core operational metrics are outstanding!` 
            : `<strong>Action Items Needed:</strong> Focus on the specific items below to boost efficiency.`;

        requestAnimationFrame(() => resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    // 8. Event Listener Bindings for Inputs
    const inputs = [fcrInput, crsInput, ahtInput, qaInput];
    inputs.forEach(inp => {
        if (inp) {
            inp.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    performCalculation();
                }
            });
        }
    });

    if (calcBtn) calcBtn.addEventListener('click', performCalculation);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            inputs.forEach(i => { if (i) i.value = ''; });
            resultContainer.classList.remove('show');
            performanceTips.style.display = 'none';
            metricsLegendList.innerHTML = '';
            progressFillCircle.style.strokeDashoffset = 578.05;
            resultDisplay.style.color = "#0f172a";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
