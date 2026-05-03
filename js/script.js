document.addEventListener('DOMContentLoaded', () => {
    // Ensure Lucide initializes when available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else if (typeof window.lucide !== 'undefined') {
        window.lucide.createIcons();
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
        
        // Fluid responsive typography sizing
        const responsiveFontSize = 'font-size: clamp(0.95rem, 2.5vw, 1.05rem);';
        const responsiveDescSize = 'font-size: clamp(0.85rem, 2.2vw, 0.9rem);';

        // Executive Timeline/List Layout Style
        const timelineListStyle = `
            display: flex;
            flex-direction: column;
            gap: 0;
            margin-top: 20px;
            border-left: 2px solid #e2e8f0;
            padding-left: 24px;
            margin-left: 10px;
        `;

        const getTimelineItemStyle = () => `
            position: relative;
            padding-bottom: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        const getTimelineDotStyle = (color) => `
            position: absolute;
            left: -33px;
            top: 2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #ffffff;
            border: 3px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        if (isSuccess) {
            tipsHtml = `
                <div class="tips-header" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
                    Strategic Growth Trail
                </div>
                
                <div style="${timelineListStyle}">
                    <div style="${getTimelineItemStyle()}">
                        <div style="${getTimelineDotStyle('#0d9488')}"></div>
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                            <span style="color: #0f172a; font-weight: 600; ${responsiveFontSize}; display: inline-flex; align-items: center; gap: 8px;">
                                <i data-lucide="trending-up" style="width: 18px; height: 18px; color: #0d9488; flex-shrink: 0;"></i>
                                Retention Catalyst
                            </span>
                            <span style="color: #0d9488; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Exceeding</span>
                        </div>
                        <div style="color: #475569; ${responsiveDescSize} line-height: 1.6;">
                            Your exceptional resolution and CSAT rates directly increase customer retention and elevate our brand reputation.
                        </div>
                    </div>

                    <div style="${getTimelineItemStyle()}; padding-bottom: 0;">
                        <div style="${getTimelineDotStyle('#0d9488')}"></div>
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                            <span style="color: #0f172a; font-weight: 600; ${responsiveFontSize}; display: inline-flex; align-items: center; gap: 8px;">
                                <i data-lucide="award" style="width: 18px; height: 18px; color: #0d9488; flex-shrink: 0;"></i>
                                Operational Efficiency
                            </span>
                            <span style="color: #0d9488; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Optimized</span>
                        </div>
                        <div style="color: #475569; ${responsiveDescSize} line-height: 1.6;">
                            By balancing strict quality protocols with an optimal handle time, you maximize team capacity and lower overall costs.
                        </div>
                    </div>
                </div>
            `;
        } else {
            const fcrVal = parseFloat(fcr),
                  crsVal = parseFloat(crs),
                  ahtVal = parseFloat(aht),
                  qaVal = parseFloat(qa);

            let timelineItems = '';
            const pendingConditions = [];

            if (fcrVal < metricsGoal.fcrGoal) pendingConditions.push('fcr');
            if (crsVal < metricsGoal.crsGoal) pendingConditions.push('crs');
            if (ahtVal > metricsGoal.ahtGoal) pendingConditions.push('aht');
            if (qaVal < metricsGoal.qaGoal) pendingConditions.push('qa');

            pendingConditions.forEach((condition, index) => {
                const isLast = index === pendingConditions.length - 1;
                const bottomPadding = isLast ? '0px' : '24px';

                if (condition === 'fcr') {
                    timelineItems += `
                        <div style="${getTimelineItemStyle()}; padding-bottom: ${bottomPadding};">
                            <div style="${getTimelineDotStyle('#d97706')}"></div>
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                <span style="color: #0f172a; font-weight: 600; ${responsiveFontSize}; display: inline-flex; align-items: center; gap: 8px;">
                                    <i data-lucide="target" style="width: 18px; height: 18px; color: #d97706; flex-shrink: 0;"></i>
                                    First Call Resolution (FCR)
                                </span>
                                <span style="color: #d97706; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Review Action</span>
                            </div>
                            <div style="color: #475569; ${responsiveDescSize} line-height: 1.6;">
                                Focus on solving issues directly during the initial contact. Avoid internal handoffs and verify complete resolution before ending interactions.
                            </div>
                        </div>
                    `;
                }

                if (condition === 'crs') {
                    timelineItems += `
                        <div style="${getTimelineItemStyle()}; padding-bottom: ${bottomPadding};">
                            <div style="${getTimelineDotStyle('#d97706')}"></div>
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                <span style="color: #0f172a; font-weight: 600; ${responsiveFontSize}; display: inline-flex; align-items: center; gap: 8px;">
                                    <i data-lucide="smile" style="width: 18px; height: 18px; color: #d97706; flex-shrink: 0;"></i>
                                    Customer Satisfaction (CSAT)
                                </span>
                                <span style="color: #d97706; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Review Action</span>
                            </div>
                            <div style="color: #475569; ${responsiveDescSize} line-height: 1.6;">
                                Build deeper rapport by confirming expectations clearly. Use active listening to ensure the customer feels heard and supported throughout.
                            </div>
                        </div>
                    `;
                }

                if (condition === 'aht') {
                    timelineItems += `
                        <div style="${getTimelineItemStyle()}; padding-bottom: ${bottomPadding};">
                            <div style="${getTimelineDotStyle('#d97706')}"></div>
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                <span style="color: #0f172a; font-weight: 600; ${responsiveFontSize}; display: inline-flex; align-items: center; gap: 8px;">
                                    <i data-lucide="clock" style="width: 18px; height: 18px; color: #d97706; flex-shrink: 0;"></i>
                                    Handle Time Efficiency
                                </span>
                                <span style="color: #d97706; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Review Action</span>
                            </div>
                            <div style="color: #475569; ${responsiveDescSize} line-height: 1.6;">
                                Accelerate diagnostics by leveraging quick templates and notes. Keep your focus on direct problem-solving while minimizing after-call processing time.
                            </div>
                        </div>
                    `;
                }

                if (condition === 'qa') {
                    timelineItems += `
                        <div style="${getTimelineItemStyle()}; padding-bottom: ${bottomPadding};">
                            <div style="${getTimelineDotStyle('#d97706')}"></div>
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                <span style="color: #0f172a; font-weight: 600; ${responsiveFontSize}; display: inline-flex; align-items: center; gap: 8px;">
                                    <i data-lucide="shield-check" style="width: 18px; height: 18px; color: #d97706; flex-shrink: 0;"></i>
                                    Compliance & Quality (QA)
                                </span>
                                <span style="color: #d97706; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Review Action</span>
                            </div>
                            <div style="color: #475569; ${responsiveDescSize} line-height: 1.6;">
                                Protect account compliance by systematically following required protocols and entering accurate context on every case.
                            </div>
                        </div>
                    `;
                }
            });

            if (timelineItems !== '') {
                tipsHtml = `
                    <div class="tips-header" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
                        Strategic Growth Trail
                    </div>
                    <div style="${timelineListStyle}">
                        ${timelineItems}
                    </div>
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
            statusBadge.style.fontSize = "0.725rem";
            statusBadge.style.fontWeight = "700";
            statusBadge.style.textTransform = "uppercase";
            statusBadge.style.letterSpacing = "0.03em";
            statusBadge.style.padding = "4px 10px";
            statusBadge.style.borderRadius = "16px";
            statusBadge.style.whiteSpace = "nowrap";

            achievementMessage.className = 'achievement-message excellent';
            achievementMessage.style.backgroundColor = "#f0fdf4";
            achievementMessage.style.border = "1px solid #dcfce7";
            achievementMessage.style.borderRadius = "8px";
            achievementMessage.style.padding = "clamp(12px, 3vw, 18px) clamp(14px, 4vw, 20px)";
            achievementMessage.style.boxShadow = "0 1px 2px rgba(0,0,0,0.01)";
            achievementMessage.innerHTML = `
                <div class="achievement-content" style="display: flex; align-items: flex-start; gap: 12px; color: #1e293b;">
                    <i data-lucide="zap" class="icon-success-reward" style="color: #10b981; flex-shrink: 0; width: 18px; height: 18px; margin-top: 3px;"></i>
                    <span style="font-size: clamp(0.825rem, 2.5vw, 0.95rem); line-height: 1.55;"><strong style="color: #0f172a; font-weight: 700;">Consistently Exceeding Expectations:</strong> You have fully optimized your Balanced Scorecard metrics and reached operational mastery!</span>
                </div>
            `;
        } else {
            statusBadge.textContent = "Target Scope";
            statusBadge.style.backgroundColor = "#fffbeb";
            statusBadge.style.color = "#854d0e";
            statusBadge.style.border = "1px solid #fef3c7";
            statusBadge.style.fontSize = "0.725rem";
            statusBadge.style.fontWeight = "700";
            statusBadge.style.textTransform = "uppercase";
            statusBadge.style.letterSpacing = "0.03em";
            statusBadge.style.padding = "4px 10px";
            statusBadge.style.borderRadius = "16px";
            statusBadge.style.whiteSpace = "nowrap";

            achievementMessage.className = 'achievement-message good';
            achievementMessage.style.backgroundColor = "#fafafa";
            achievementMessage.style.border = "1px solid #f1f5f9";
            achievementMessage.style.borderRadius = "8px";
            achievementMessage.style.padding = "clamp(12px, 3vw, 18px) clamp(14px, 4vw, 20px)";
            achievementMessage.style.boxShadow = "0 1px 2px rgba(0,0,0,0.01)";
            achievementMessage.innerHTML = `
                <div class="achievement-content" style="display: flex; align-items: flex-start; gap: 12px; color: #1e293b;">
                    <i data-lucide="trending-up" class="icon-progress-tip" style="color: #f59e0b; flex-shrink: 0; width: 18px; height: 18px; margin-top: 3px;"></i>
                    <span style="font-size: clamp(0.825rem, 2.5vw, 0.95rem); line-height: 1.55;"><strong style="color: #0f172a; font-weight: 700;">Continuous Improvement Track:</strong> Keep driving metric improvements to reach full scorecard optimization.</span>
                </div>
            `;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons();
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
        statusBadge.style.fontSize = "0.725rem";
        statusBadge.style.fontWeight = "700";
        statusBadge.style.textTransform = "uppercase";
        statusBadge.style.letterSpacing = "0.03em";
        statusBadge.style.padding = "4px 10px";
        statusBadge.style.borderRadius = "16px";
        statusBadge.style.whiteSpace = "nowrap";

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});
