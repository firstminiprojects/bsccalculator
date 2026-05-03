document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else if (typeof window.lucide !== 'undefined') {
        window.lucide.createIcons();
    }

    const metricsGoal = {
        fcrWeight: 0.1, crsWeight: 0.3, ahtWeight: 0.1, qaWeight: 0.3,
        fcrGoal: 68, crsGoal: 85, qaGoal: 80, ahtGoal: 14
    };

    const fcrInput = document.getElementById('fcrInput'),
          crsInput = document.getElementById('crsInput'),
          ahtInput = document.getElementById('ahtInput'),
          qaInput = document.getElementById('qaInput'),
          calcBtn = document.getElementById('bscBtn'),
          clearBtn = document.getElementById('clearBtn'),
          resultDisplay = document.getElementById('totalBSC'),
          resultContainer = document.getElementById('resultContainer'),
          progressFill = document.getElementById('progressFill'),
          achievementMessage = document.getElementById('achievementMessage'),
          statusBadge = document.getElementById('statusBadge'),
          performanceTips = document.getElementById('performanceTips');

    function calculateMetricScore(actual, goal, weight, isInverse = false) {
        if (!actual || actual <= 0) return 0;
        const numActual = Number(actual);
        const achievement = isInverse ? goal / numActual : numActual / goal;
        return achievement * (weight * 100);
    }

    /**
     * Generates a fully responsive "Bento-Roadmap"
     */
    function generatePerformanceTips(fcr, crs, aht, qa, isSuccess) {
        let tipsHtml = '';
        
        // Fluid grid that shifts from single column on mobile to multi-column on desktop
        const gridWrapper = `
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 310px), 1fr)); 
            gap: 16px; 
            margin-top: 20px; 
            width: 100%;
            box-sizing: border-box;
        `;
        
        const getBentoStyle = () => `
            background: #ffffff;
            border: 1px solid #edf2f7;
            border-radius: 20px;
            padding: clamp(16px, 4vw, 24px);
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            width: 100%;
        `;

        const iconBox = (bg, color) => `
            height: 44px; width: 44px; border-radius: 12px; 
            background: ${bg}; color: ${color}; 
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        `;

        if (isSuccess) {
            tipsHtml = `
                <div style="font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Operational Mastery Reached</div>
                <div style="${gridWrapper}">
                    <div style="${getBentoStyle()}">
                        <div style="${iconBox('#ecfdf5', '#059669')}"><i data-lucide="check-circle-2"></i></div>
                        <div>
                            <h4 style="margin: 0; color: #1e293b; font-size: clamp(1rem, 2.5vw, 1.1rem); font-weight: 700;">Performance Standard Met</h4>
                            <p style="margin: 8px 0 0; color: #64748b; font-size: 0.875rem; line-height: 1.6;">All metrics are currently within or exceeding target range. Maintain current workflows to sustain high performance.</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            let modules = '';
            const data = [
                { id: 'FCR', val: parseFloat(fcr), goal: metricsGoal.fcrGoal, name: 'First Call Resolution', desc: 'Focus on "One-Touch" solutions. Confirm with the customer that their issue is fully resolved before closing.', icon: 'target', bg: '#fff7ed', text: '#c2410c' },
                { id: 'CSAT', val: parseFloat(crs), goal: metricsGoal.crsGoal, name: 'Customer Satisfaction', desc: 'Engage with dynamic empathy. Validate user sentiment early to drive higher satisfaction scores.', icon: 'smile', bg: '#fff1f2', text: '#be123c' },
                { id: 'AHT', val: parseFloat(aht), goal: metricsGoal.ahtGoal, name: 'Average Handle Time', desc: 'Streamline pacing by utilizing diagnostic templates and logging notes during live interaction.', icon: 'clock', bg: '#f0f9ff', text: '#0369a1', inverse: true },
                { id: 'QA', val: parseFloat(qa), goal: metricsGoal.qaGoal, name: 'Quality Assurance', desc: 'Ensure strict adherence to compliance checklists and technical precision in case documentation.', icon: 'shield-check', bg: '#f5f3ff', text: '#6d28d9' }
            ];

            data.forEach(item => {
                const isUnder = item.inverse ? item.val > item.goal : item.val < item.goal;
                if (isUnder) {
                    modules += `
                        <div style="${getBentoStyle()}">
                            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 12px; flex-wrap: wrap;">
                                <div style="${iconBox(item.bg, item.text)}"><i data-lucide="${item.icon}"></i></div>
                                <span style="background: ${item.bg}; color: ${item.text}; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; white-space: nowrap;">Low Target</span>
                            </div>
                            <div>
                                <h4 style="margin: 0; color: #1e293b; font-size: clamp(0.9rem, 2.5vw, 1rem); font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em;">
                                    ${item.id}: ${item.name}
                                </h4>
                                <p style="margin: 10px 0 0; color: #475569; font-size: 0.875rem; line-height: 1.6;">
                                    ${item.desc}
                                </p>
                            </div>
                        </div>
                    `;
                }
            });

            tipsHtml = `
                <div style="font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px;">Optimization Roadmap: Action Required</div>
                <div style="${gridWrapper}">${modules}</div>
            `;
        }

        performanceTips.innerHTML = tipsHtml;
        performanceTips.style.display = 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function performCalculation() {
        const vals = [fcrInput.value, crsInput.value, ahtInput.value, qaInput.value];
        if (vals.some(v => !v)) return alert("Please enter all metrics.");

        const fcrS = calculateMetricScore(vals[0], metricsGoal.fcrGoal, metricsGoal.fcrWeight),
              crsS = calculateMetricScore(vals[1], metricsGoal.crsGoal, metricsGoal.crsWeight),
              qaS = calculateMetricScore(vals[3], metricsGoal.qaGoal, metricsGoal.qaWeight),
              ahtS = calculateMetricScore(vals[2], metricsGoal.ahtGoal, metricsGoal.ahtWeight, true);
        
        const finalScore = Math.min((fcrS + crsS + qaS + ahtS + 20), 150);
        resultDisplay.textContent = finalScore.toFixed(2) + "%";
        progressFill.style.width = (finalScore / 150 * 100) + "%";
        resultContainer.classList.add('show');

        const isSuccess = finalScore >= 100;
        generatePerformanceTips(vals[0], vals[1], vals[2], vals[3], isSuccess);

        Object.assign(statusBadge.style, {
            backgroundColor: isSuccess ? "#ccfbf1" : "#fffbeb",
            color: isSuccess ? "#115e59" : "#854d0e",
            padding: "6px 14px", borderRadius: "20px", fontWeight: "700", fontSize: "0.75rem", display: "inline-block"
        });
        statusBadge.textContent = isSuccess ? "Exceeds Goals" : "Target Scope";

        achievementMessage.innerHTML = `<span style="color: #475569; font-size: 0.95rem;">${isSuccess ? '<strong>Mastery Status:</strong> All core channels are optimized.' : '<strong>Action Plan:</strong> Focus on the metrics listed below to improve your scorecard.'}</span>`;
        
        requestAnimationFrame(() => resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    if (calcBtn) calcBtn.addEventListener('click', performCalculation);
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            [fcrInput, crsInput, ahtInput, qaInput].forEach(i => { if(i) i.value = ''; });
            resultContainer.classList.remove('show');
            performanceTips.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
