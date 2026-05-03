document.addEventListener('DOMContentLoaded', () => {
    // Ensure Lucide initializes when available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Exact data configuration logic preserved
    const metricsGoal = {
        fcrWeight: 0.1,
        crsWeight: 0.3,
        ahtWeight: 0.1,
        qaWeight: 0.3,
        fcrGoal: 68,
        crsGoal: 85,
        qaGoal: 80,
        ahtGoal: 14
    };

    // Cache all DOM references once
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

    function generatePerformanceTips(fcr, crs, aht, qa, isSuccess) {
        let tipsHtml = '';
        
        if (isSuccess) {
            tipsHtml = `
                <div class="tips-header" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 4px; height: 16px; background-color: #10b981; border-radius: 2px;"></span>
                    Organizational Impact & Strengths
                </div>
                
                <div class="tip-card success-card" style="border-left: 4px solid #10b981; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; padding: 18px 20px; border-radius: 8px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);">
                    <div class="tip-metric-title success-title" style="color: #0f172a; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: space-between;">
                        <span>Customer Loyalty Champion</span>
                        <span style="background-color: #d1fae5; color: #065f46; padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800;">Top Performer</span>
                    </div>
                    <div class="tip-desc" style="color: #475569; font-size: 0.875rem; line-height: 1.55;">
                        Your exceptional resolution and CSAT rates directly increase customer retention and elevate our brand reputation.
                    </div>
                </div>

                <div class="tip-card success-card" style="border-left: 4px solid #10b981; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; padding: 18px 20px; border-radius: 8px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);">
                    <div class="tip-metric-title success-title" style="color: #0f172a; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: space-between;">
                        <span>Operational Excellence</span>
                        <span style="background-color: #d1fae5; color: #065f46; padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800;">Efficiency</span>
                    </div>
                    <div class="tip-desc" style="color: #475569; font-size: 0.875rem; line-height: 1.55;">
                        By balancing strict quality protocols with an optimal handle time, you maximize team capacity and lower overall costs.
                    </div>
                </div>
            `;
        } else {
            const fcrVal = parseFloat(fcr),
                  crsVal = parseFloat(crs),
                  ahtVal = parseFloat(aht),
                  qaVal = parseFloat(qa);

            // High-End Enterprise constructive styling
            const failCardStyle = `border-left: 4px solid #f59e0b; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; padding: 18px 20px; border-radius: 8px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);`;
            
            const badgeStyle = `background-color: #fef3c7; color: #b45309; padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800;`;

            const titleStyle = `color: #0f172a; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: space-between;`;

            const descStyle = `color: #475569; font-size: 0.875rem; line-height: 1.55;`;

            if (fcrVal < metricsGoal.fcrGoal) {
                tipsHtml += `
                    <div class="tip-card" style="${failCardStyle}">
                        <div class="tip-metric-title" style="${titleStyle}">
                            <span>First Call Resolution</span>
                            <span style="${badgeStyle}">Growth Opportunity</span>
                        </div>
                        <div class="tip-desc" style="${descStyle}">Resolve problems directly on the first call. Avoid transfers and verify satisfaction before hanging up.</div>
                    </div>
                `;
            }

            if (crsVal < metricsGoal.crsGoal) {
                tipsHtml += `
                    <div class="tip-card" style="${failCardStyle}">
                        <div class="tip-metric-title" style="${titleStyle}">
                            <span>Customer Satisfaction</span>
                            <span style="${badgeStyle}">Growth Opportunity</span>
                        </div>
                        <div class="tip-desc" style="${descStyle}">Acknowledge customer issues clearly, maintain empathy, and double-check understanding to build rapport.</div>
                    </div>
                `;
            }

            if (ahtVal > metricsGoal.ahtGoal) {
                tipsHtml += `
                    <div class="tip-card" style="${failCardStyle}">
                        <div class="tip-metric-title" style="${titleStyle}">
                            <span>Average Handle Time</span>
                            <span style="${badgeStyle}">Growth Opportunity</span>
                        </div>
                        <div class="tip-desc" style="${descStyle}">Focus on direct problem-solving. Limit small talk, use shortcuts, and keep after-call wrap times low.</div>
                    </div>
                `;
            }

            if (qaVal < metricsGoal.qaGoal) {
                tipsHtml += `
                    <div class="tip-card" style="${failCardStyle}">
                        <div class="tip-metric-title" style="${titleStyle}">
                            <span>Quality Assurance</span>
                            <span style="${badgeStyle}">Growth Opportunity</span>
                        </div>
                        <div class="tip-desc" style="${descStyle}">Review critical protocols, make notes correctly, and follow established compliance steps every time.</div>
                    </div>
                `;
            }

            if (tipsHtml !== '') {
                tipsHtml = `
                    <div class="tips-header" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="display: inline-block; width: 4px; height: 16px; background-color: #f59e0b; border-radius: 2px;"></span>
                        Critical Performance Insights
                    </div>
                    ${tipsHtml}
                `;
            }
        }

        if (tipsHtml !== '') {
            performanceTips.innerHTML = tipsHtml;
            performanceTips.style.display = 'block';
        } else {
            performanceTips.style.display = 'none';
        }
    }

    function performCalculation() {
        const fcrVal = fcrInput.value,
              crsVal = crsInput.value,
              ahtVal = ahtInput.value,
              qaVal = qaInput.value;

        if (!fcrVal || !crsVal || !ahtVal || !qaVal) {
            alert("Please fill out all metric fields before generating the report.");
            return;
        }

        const fcrScore = calculateMetricScore(fcrVal, metricsGoal.fcrGoal, metricsGoal.fcrWeight),
              crsScore = calculateMetricScore(crsInput.value, metricsGoal.crsGoal, metricsGoal.crsWeight),
              qaScore = calculateMetricScore(qaInput.value, metricsGoal.qaGoal, metricsGoal.qaWeight),
              ahtScore = calculateMetricScore(ahtInput.value, metricsGoal.ahtGoal, metricsGoal.ahtWeight, true),
              total = fcrScore + crsScore + qaScore + ahtScore,
              calculatedScore = total + 20;

        // Directly cap the final score value at 150%
        const finalScore = Math.min(calculatedScore, 150);

        // Update the displayed numeric text
        resultDisplay.textContent = finalScore.toFixed(2) + "%";

        // Map the 0-150% range to the 0-100% progress bar fill
        const visualWidth = (finalScore / 150) * 100;
        progressFill.style.width = visualWidth + "%";

        resultContainer.classList.add('show');

        const isSuccess = finalScore >= 100;

        generatePerformanceTips(fcrVal, crsVal, ahtVal, qaVal, isSuccess);

        if (isSuccess) {
            statusBadge.textContent = "Exceeds Goals";
            statusBadge.style.backgroundColor = "#ccfbf1";
            statusBadge.style.color = "#115e59";
            statusBadge.style.border = "1px solid #99f6e4";
            statusBadge.style.fontSize = "0.75rem";
            statusBadge.style.fontWeight = "700";
            statusBadge.style.textTransform = "uppercase";
            statusBadge.style.letterSpacing = "0.03em";
            statusBadge.style.padding = "4px 12px";
            statusBadge.style.borderRadius = "16px";

            achievementMessage.className = 'achievement-message excellent';
            achievementMessage.style.backgroundColor = "#f0fdf4";
            achievementMessage.style.border = "1px solid #dcfce7";
            achievementMessage.style.borderRadius = "8px";
            achievementMessage.style.padding = "18px 20px";
            achievementMessage.style.boxShadow = "0 1px 2px rgba(0,0,0,0.01)";
            achievementMessage.innerHTML = `
                <div class="achievement-content" style="display: flex; align-items: flex-start; gap: 14px; color: #1e293b;">
                    <i data-lucide="trophy" class="icon-success-reward" style="color: #10b981; flex-shrink: 0; width: 20px; height: 20px; margin-top: 2px;"></i>
                    <span style="font-size: 0.95rem; line-height: 1.55;"><strong style="color: #0f172a; font-weight: 700;">Consistently Exceeding Expectations:</strong> You have fully optimized your Balanced Scorecard metrics and reached operational mastery!</span>
                </div>
            `;
        } else {
            statusBadge.textContent = "Target Scope";
            statusBadge.style.backgroundColor = "#fffbeb";
            statusBadge.style.color = "#854d0e";
            statusBadge.style.border = "1px solid #fef3c7";
            statusBadge.style.fontSize = "0.75rem";
            statusBadge.style.fontWeight = "700";
            statusBadge.style.textTransform = "uppercase";
            statusBadge.style.letterSpacing = "0.03em";
            statusBadge.style.padding = "4px 12px";
            statusBadge.style.borderRadius = "16px";

            achievementMessage.className = 'achievement-message good';
            achievementMessage.style.backgroundColor = "#fafafa";
            achievementMessage.style.border = "1px solid #f1f5f9";
            achievementMessage.style.borderRadius = "8px";
            achievementMessage.style.padding = "18px 20px";
            achievementMessage.style.boxShadow = "0 1px 2px rgba(0,0,0,0.01)";
            achievementMessage.innerHTML = `
                <div class="achievement-content" style="display: flex; align-items: flex-start; gap: 14px; color: #1e293b;">
                    <i data-lucide="sparkles" class="icon-progress-tip" style="color: #f59e0b; flex-shrink: 0; width: 20px; height: 20px; margin-top: 2px;"></i>
                    <span style="font-size: 0.95rem; line-height: 1.55;"><strong style="color: #0f172a; font-weight: 700;">Continuous Improvement Track:</strong> Keep driving metric improvements to reach full scorecard optimization.</span>
                </div>
            `;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        requestAnimationFrame(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    calcBtn.addEventListener('click', performCalculation);

    clearBtn.addEventListener('click', () => {
        fcrInput.value = '';
        crsInput.value = '';
        ahtInput.value = '';
        qaInput.value = '';
        
        resultContainer.classList.remove('show');
        resultDisplay.textContent = '0.00%';
        progressFill.style.width = '0%';
        performanceTips.style.display = 'none';

        statusBadge.textContent = "Awaiting Data";
        statusBadge.style.backgroundColor = "#f1f5f9";
        statusBadge.style.color = "#334155";
        statusBadge.style.border = "1px solid #e2e8f0";
        statusBadge.style.fontSize = "0.75rem";
        statusBadge.style.fontWeight = "700";
        statusBadge.style.textTransform = "uppercase";
        statusBadge.style.letterSpacing = "0.03em";
        statusBadge.style.padding = "4px 12px";
        statusBadge.style.borderRadius = "16px";

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});
