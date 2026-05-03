document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else if (typeof window.lucide !== 'undefined') {
        window.lucide.createIcons();
    }

    // 2. Goal Configuration & Weights
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

    // Make the percentage font size inside the circle smaller
    if (resultDisplay) {
        resultDisplay.style.fontSize = "1.85rem"; 
        resultDisplay.style.fontWeight = "700";
        resultDisplay.style.letterSpacing = "-0.03em";
    }

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

    // Generates precise progressive coloring based on custom rules
    function getProgressiveColor(score) {
        // Strict Green for 100% and above
        if (score >= 100) {
            return 'rgb(16, 185, 129)'; // Emerald Green
        }
        
        // Strict Blue for 75% up to 99%
        if (score >= 75 && score < 100) {
            return 'rgb(59, 130, 246)'; // Tailwind Blue
        }

        const clamped = Math.max(0, score);
        const red = [239, 68, 68];       // rgb(239, 68, 68) - Tailwind Red 500
        const orange = [249, 115, 22];    // rgb(249, 115, 22) - Tailwind Orange 500
        const blue = [59, 130, 246];     // rgb(59, 130, 246) - Tailwind Blue 500

        // Smooth transition from Red to Orange up to 33%
        if (clamped <= 33.33) {
            return interpolateColor(red, orange, clamped / 33.33);
        } 
        // Smooth transition from Orange to Blue up to 74%
        else {
            return interpolateColor(orange, blue, (clamped - 33.33) / 41.67);
        }
    }

    // 5. Advanced Cross-Platform Responsive Performance Insights
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
            border-left: 3px solid ${accentColor};
            border-radius: 8px;
            box-sizing: border-box;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 84px;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
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
            flex-shrink: 0;
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
                { id: 'FCR', val: parseFloat(fcr), goal: metricsGoal.fcrGoal, name: 'First Call Resolution', desc: 'Aim to completely resolve the rider or driver inquiry in this single chat session. Prevent unnecessary repeat contacts by double-checking their specific ride ID details, confirming that any fare adjustments have been updated, and asking if there are any other issues before ending the session.', icon: 'target', bg: '#fff7ed', text: '#c2410c', metricColor: '#ea580c' },
                { id: 'CSAT', val: parseFloat(crs), goal: metricsGoal.crsGoal, name: 'Customer Satisfaction', desc: 'Improve customer feedback scores by acknowledging stressful rideshare situations immediately. Validate pain points (e.g., missed rides, wait times, lost items) using direct, personalized empathy right at the beginning of the chat to build rapport.', icon: 'smile', bg: '#fff1f2', text: '#be123c', metricColor: '#e11d48' },
                { id: 'AHT', val: parseFloat(aht), goal: metricsGoal.ahtGoal, name: 'Average Handle Time', desc: 'Streamline chat pacing to reduce average handling times. Use internal macro templates for common procedures like cancellation fee waivers and GPS route inquiries, ensuring you handle multiple chat threads effectively without sacrificing quality.', icon: 'clock', bg: '#f0f9ff', text: '#0369a1', metricColor: '#0284c7', inverse: true },
                { id: 'QA', val: parseFloat(qa), goal: metricsGoal.qaGoal, name: 'Quality Assurance', desc: 'Protect service standards by maintaining full compliance with Lyft support procedures. Ensure mandatory identification steps are successfully completed before applying credits or adjusting card charges.', icon: 'shield-check', bg: '#f5f3ff', text: '#6d28d9', metricColor: '#7c3aed' }
            ];

            data.forEach((item, index) => {
                const isUnder = item.inverse ? item.val > item.goal : item.val < item.goal;
                if (isUnder) {
                    modules += `
                        <div onclick="document.getElementById('modal-${index}').showModal()" 
                             style="${getCardStyle(item.metricColor)}" 
                             onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.05)'; this.style.transform='translateY(-1px)';" 
                             onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0px)';"
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
                                <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #94a3b8; flex-shrink: 0;"></i>
                            </div>

                            <dialog id="modal-${index}" onclick="event.stopPropagation()" style="
                                border: none; 
                                border-radius: 8px; 
                                padding: 24px; 
                                width: calc(100% - 32px);
                                max-width: 360px; 
                                margin: auto; 
                                background: #ffffff; 
                                box-shadow: 0 12px 32px -6px rgba(0, 0, 0, 0.08), 0 8px 20px -6px rgba(0, 0, 0, 0.04);
                                outline: none;
                                box-sizing: border-box;
                                animation: modalEnter 0.15s cubic-bezier(0.16, 1, 0.3, 1);
                            ">
                                <style>
                                    #modal-${index}::backdrop {
                                        background: rgba(15, 23, 42, 0.3);
                                        backdrop-filter: blur(2px);
                                        -webkit-backdrop-filter: blur(2px);
                                        animation: backdropEnter 0.15s ease;
                                    }
                                    @keyframes modalEnter {
                                        from { opacity: 0; transform: scale(0.97) translateY(2px); }
                                        to { opacity: 1; transform: scale(1) translateY(0); }
                                    }
                                    @keyframes backdropEnter {
                                        from { opacity: 0; }
                                        to { opacity: 1; }
                                    }
                                </style>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                    <div style="${iconBox(item.bg, item.text)}"><i data-lucide="${item.icon}" style="width:16px; height:16px;"></i></div>
                                    <h3 style="margin: 0; color: #0f172a; font-size: 0.925rem; font-weight: 700; letter-spacing: -0.01em;">${item.name}</h3>
                                </div>
                                <p style="color: #475569; font-size: 0.8rem; line-height: 1.55; text-align: left; margin: 0 0 18px 0; border-left: 2px solid ${item.metricColor}; padding-left: 10px;">
                                    ${item.desc}
                                </p>
                                <div style="display: flex; justify-content: flex-end;">
                                    <button onclick="document.getElementById('modal-${index}').close()" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #ffffff; color: #475569; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='#ffffff';">
                                        Dismiss
                                    </button>
                                </div>
                            </dialog>
                        </div>
                    `;
                }
            });

            tipsHtml = `
                <div style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Actionable Performance Guidance</div>
                <div style="${gridWrapper}">${modules}</div>
            `;
        }

        performanceTips.innerHTML = tipsHtml;
        performanceTips.style.display = 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 6. Score Calculations and Result Handling
    function performCalculation() {
        const vals = [fcrInput.value, crsInput.value, ahtInput.value, qaInput.value];
        if (vals.some(v => !v)) return alert("Please fill in all inputs.");

        const fcrS = calculateMetricScore(vals[0], metricsGoal.fcrGoal, metricsGoal.fcrWeight),
              crsS = calculateMetricScore(vals[1], metricsGoal.crsGoal, metricsGoal.crsWeight),
              qaS = calculateMetricScore(vals[3], metricsGoal.qaGoal, metricsGoal.qaWeight),
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
        
        // 1. Color the visual SVG ring line based on progressive logic
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
        const boundedScore = Math.min(finalScore, 150);
        const dashOffset = circumference - (boundedScore / 150 * circumference);
        progressFillCircle.style.strokeDashoffset = dashOffset;

        // 2. Color the percentage text based on progressive logic
        resultDisplay.style.color = progressiveColor;
        resultDisplay.style.transition = "color 0.3s ease";

        resultContainer.classList.add('show');

        generatePerformanceTips(vals[0], vals[1], vals[2], vals[3], isSuccess);

        Object.assign(statusBadge.style, {
            backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
            color: isSuccess ? "#15803d" : "#b91c1c",
            border: `1px solid ${isSuccess ? '#dcfce7' : '#fee2e2'}`,
            padding: "3px 8px", borderRadius: "6px", fontWeight: "600", fontSize: "0.675rem", display: "inline-block"
        });
        statusBadge.textContent = isSuccess ? "Exceeds Goals" : "Keep Improving";

        achievementMessage.innerHTML = `<span style="color: #475569; font-size: 0.8rem;">${isSuccess ? '<strong>Mastery Status:</strong> All core channels are optimized.' : '<strong>Action Plan:</strong> Focus on the metrics listed below to improve your scorecard.'}</span>`;

        requestAnimationFrame(() => resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    // 7. Event listeners for Enter Key generation
    const inputs = [fcrInput, crsInput, ahtInput, qaInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevents line breaks or accidental submissions
                    performCalculation();
                }
            });
        }
    });

    if (calcBtn) calcBtn.addEventListener('click', performCalculation);
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            inputs.forEach(i => { if(i) i.value = ''; });
            resultContainer.classList.remove('show');
            performanceTips.style.display = 'none';
            metricsLegendList.innerHTML = '';
            
            const circumference = 2 * Math.PI * 92;
            progressFillCircle.style.strokeDashoffset = circumference;
            
            // Revert percentage text color to neutral on reset
            resultDisplay.style.color = "#0f172a";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
