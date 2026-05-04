document.addEventListener('DOMContentLoaded', () => {
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
    sliderTrack = document.getElementById('sliderTrack'),
    progressFillCircle = document.getElementById('progressFillCircle'),
    metricsLegendList = document.getElementById('metricsLegendList'),
    achievementMessage = document.getElementById('achievementMessage'),
    performanceTips = document.getElementById('performanceTips'),
    bottomCollapseBtn = document.getElementById('bottomCollapseBtn'),
    tipsBackBtn = document.getElementById('tipsBackBtn'),
    summaryDisplayCard = document.getElementById('summaryDisplayCard'),
    alertHostContainer = document.getElementById('alertHostContainer'),
    gaugeBadgeContainer = document.getElementById('gaugeBadgeContainer'),
    colorBlindToggle = document.getElementById('colorBlindToggle'),
    standaloneDirectiveArea = document.getElementById('standaloneDirectiveArea'),
    calculatorCard = document.getElementById('calculatorCard');

const circumference = 2 * Math.PI * 92;
let currentCalculatedScore = 0;
let colorBlindModeEnabled = false;

const paletteNormal = {
    fcr: '#ea580c', csat: '#e11d48', aht: '#0284c7', qa: '#7c3aed', success: '#10b981'
};

const paletteColorblind = {
    fcr: '#f59e0b', csat: '#2563eb', aht: '#0891b2', qa: '#4f46e5', success: '#0d9488'
};

if (colorBlindToggle) {
    colorBlindToggle.addEventListener('change', (e) => {
        colorBlindModeEnabled = e.target.checked;
        if (colorBlindModeEnabled) {
            calculatorCard.classList.add('colorblind-mode');
        } else {
            calculatorCard.classList.remove('colorblind-mode');
        }
        
        [fcrInput, crsInput, ahtInput, qaInput].forEach(el => {
            if (el && el.value.trim() !== '') {
                const itemConfig = getFieldConfig(el.id);
                updateInputProgressBar(el, itemConfig.goal, itemConfig.isInverse);
            }
        });
    });
}

function getFieldConfig(id) {
    if (id === 'fcrInput') return { goal: metricsGoal.fcrGoal, isInverse: false };
    if (id === 'crsInput') return { goal: metricsGoal.crsGoal, isInverse: false };
    if (id === 'ahtInput') return { goal: metricsGoal.ahtGoal, isInverse: true };
    if (id === 'qaInput') return { goal: metricsGoal.qaGoal, isInverse: false };
    return { goal: 100, isInverse: false };
}

if (!document.getElementById('customAnimationStyles')) {
    const style = document.createElement('style');
    style.id = 'customAnimationStyles';
    style.innerHTML = `
        @keyframes alertSlideIn { 
            from { opacity: 0; transform: translateY(-8px) scale(0.98); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes modalEnter { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes trophyPop { 
            0% { opacity: 0; transform: scale(0.7) translateY(6px); } 
            70% { opacity: 1; transform: scale(1.05) translateY(-1px); } 
            100% { opacity: 1; transform: scale(1) translateY(0); } 
        }
        @keyframes bubbleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .metric-input-wrapper { position: relative; display: flex; flex-direction: column; width: 100%; }
        .input-progress-track { width: 100%; height: 3px; background-color: #f1f5f9; border-radius: 2px; overflow: hidden; margin-top: 4px; }
        .input-progress-fill { height: 100%; width: 0%; background-color: #cbd5e1; transition: width 0.4s ease, background-color 0.4s ease; }
    `;
    document.head.appendChild(style);
}

// Enterprise toast error notification
function renderPremiumAlert(title, message) {
    let currentToast = document.getElementById('enterprisePremiumAlert');
    if (currentToast) currentToast.remove();

    const alertWrapper = document.createElement('div');
    alertWrapper.id = 'enterprisePremiumAlert';
    
    Object.assign(alertWrapper.style, {
        position: 'relative', top: '0', left: '0', width: '100%', zIndex: '100',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
        background: '#ffffff', border: '1px solid #f1f5f9', borderLeft: '4px solid #f43f5e',
        borderRadius: '8px', padding: '14px 16px', boxSizing: 'border-box',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
        animation: 'alertSlideIn 0.3s cubic-bezier(0, 0, 0.2, 1) forwards',
        marginBottom: '1rem'
    });

    alertWrapper.innerHTML = `
        <div style="display: flex; gap: 10px;">
            <div style="color: #f43f5e; flex-shrink: 0; display: flex; align-items: center; margin-top: 2px;">
                <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="color: #0f172a; font-size: 0.8rem; font-weight: 700; line-height: 1.2;">${title}</span>
                <span style="color: #475569; font-size: 0.725rem; font-weight: 400; line-height: 1.4;">${message}</span>
            </div>
        </div>
        <button id="closeEnterpriseAlert" style="background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; padding: 4px; transition: color 0.2s;" onmouseenter="this.style.color='#f43f5e'" onmouseleave="this.style.color='#94a3b8'">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
        </button>
    `;

    if (alertHostContainer) {
        alertHostContainer.appendChild(alertWrapper);
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    document.getElementById('closeEnterpriseAlert').addEventListener('click', () => alertWrapper.remove());
    setTimeout(() => { if (alertWrapper.parentNode) alertWrapper.remove(); }, 5000);
}

// Capping numbers directly between 00.00 and 100.00
function enforceCappedDecimalInput(inputElement) {
    if (!inputElement) return;

    inputElement.addEventListener('input', () => {
        let rawVal = inputElement.value.replace(/[^0-9.]/g, '');
        
        // Block extra decimal characters
        const splitVal = rawVal.split('.');
        if (splitVal.length > 2) {
            rawVal = splitVal[0] + '.' + splitVal.slice(1).join('');
        }

        const numericCheck = parseFloat(rawVal);

        // Strict limit check: Capping instantly at 100
        if (!isNaN(numericCheck) && numericCheck > 100) {
            inputElement.value = '100.00';
            renderPremiumAlert("Invalid Threshold", "The maximum limit permitted for operational scorecard metrics is 100.00%.");
            const itemConfig = getFieldConfig(inputElement.id);
            updateInputProgressBar(inputElement, itemConfig.goal, itemConfig.isInverse);
            return;
        }

        // Limit fractional digits to 2
        if (rawVal.includes('.')) {
            let [whole, fraction] = rawVal.split('.');
            if (whole.length > 3) whole = whole.substring(0, 3);
            if (fraction.length > 2) fraction = fraction.substring(0, 2);
            rawVal = `${whole}.${fraction}`;
        } else {
            if (rawVal.length > 3) rawVal = rawVal.substring(0, 3);
        }

        inputElement.value = rawVal;
    });

    // Formatting on blur to ensure strict two decimal digit standard
    inputElement.addEventListener('blur', () => {
        let valString = inputElement.value.trim();
        if (valString === '') {
            inputElement.value = '0.00';
        } else {
            const numericValue = Math.min(100, Math.max(0, parseFloat(valString)));
            inputElement.value = isNaN(numericValue) ? '0.00' : numericValue.toFixed(2);
        }
        const itemConfig = getFieldConfig(inputElement.id);
        updateInputProgressBar(inputElement, itemConfig.goal, itemConfig.isInverse);
    });
}

function sanitizeInputs() {
    [fcrInput, crsInput, ahtInput, qaInput].forEach(input => {
        if (!input) return;
        enforceCappedDecimalInput(input);
    });
}
sanitizeInputs();

function initializeProgressBars() {
    const fields = [
        { el: fcrInput, goal: metricsGoal.fcrGoal, isInverse: false },
        { el: crsInput, goal: metricsGoal.crsGoal, isInverse: false },
        { el: ahtInput, goal: metricsGoal.ahtGoal, isInverse: true },
        { el: qaInput, goal: metricsGoal.qaGoal, isInverse: false }
    ];

    fields.forEach(item => {
        if (item.el && !item.el.parentNode.querySelector('.input-progress-track')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'metric-input-wrapper';
            item.el.parentNode.insertBefore(wrapper, item.el);
            wrapper.appendChild(item.el);

            const track = document.createElement('div');
            track.className = 'input-progress-track';
            track.innerHTML = `<div class="input-progress-fill" id="${item.el.id}ProgressFill"></div>`;
            wrapper.appendChild(track);

            // Real-time typing sync for live animation
            item.el.addEventListener('input', () => {
                updateInputProgressBar(item.el, item.goal, item.isInverse);
            });
        }
    });
}
initializeProgressBars();

function updateInputProgressBar(el, goal, isInverse) {
    const fill = document.getElementById(`${el.id}ProgressFill`);
    if (!fill) return;
    const inputString = el.value.trim();
    if (inputString === '') { fill.style.width = '0%'; fill.style.backgroundColor = '#cbd5e1'; return; }

    const score = parseFloat(inputString);
    if (isNaN(score) || score < 0) { fill.style.width = '0%'; fill.style.backgroundColor = '#ef4444'; return; }

    let progress = 0;
    if (isInverse) {
        if (score === 0) progress = 0;
        else if (score <= goal) progress = 100;
        else progress = Math.max(0, Math.min(100, (goal / score) * 100));
    } else {
        progress = Math.max(0, Math.min(100, (score / goal) * 100));
    }

    fill.style.width = `${progress}%`;
    const theme = colorBlindModeEnabled ? paletteColorblind : paletteNormal;

    if (progress >= 100) fill.style.backgroundColor = theme.success;
    else if (progress >= 75) fill.style.backgroundColor = colorBlindModeEnabled ? '#2563eb' : '#3b82f6';
    else if (progress >= 40) fill.style.backgroundColor = colorBlindModeEnabled ? '#d97706' : '#f97316';
    else fill.style.backgroundColor = '#ef4444';
}

function clearProgressBars() {
    [fcrInput, crsInput, ahtInput, qaInput].forEach(input => {
        if (input) {
            const fill = document.getElementById(`${input.id}ProgressFill`);
            if (fill) { fill.style.width = '0%'; fill.style.backgroundColor = '#cbd5e1'; }
        }
    });
}

function syncGaugeAnimation(finalTarget) {
    if (!progressFillCircle || !resultDisplay) return;

    removeGaugeBadge();
    
    if (summaryDisplayCard) {
        summaryDisplayCard.classList.remove('success-glow');
        summaryDisplayCard.style.backgroundColor = '#ffffff';
        summaryDisplayCard.style.borderColor = '#e2e8f0';
    }
    progressFillCircle.style.strokeDashoffset = circumference;
    resultDisplay.textContent = "0.00%";

    const duration = 2600;
    let frameStart = null;

    function cubicOut(t) { return --t * t * t + 1; }

    function paintFrame(timestamp) {
        if (!frameStart) frameStart = timestamp;
        const elapsedTime = Math.min((timestamp - frameStart) / duration, 1);
        const easingValue = cubicOut(elapsedTime);

        const currentAnimatedNumber = easingValue * finalTarget;
        resultDisplay.textContent = currentAnimatedNumber.toFixed(2) + "%";

        const cappedVisualScore = Math.min(finalTarget, 100);
        const fillVisualTarget = cappedVisualScore * easingValue;
        const liveStrokeOffset = circumference - (fillVisualTarget / 100 * circumference);
        
        progressFillCircle.style.strokeDashoffset = liveStrokeOffset;

        if (elapsedTime < 1) {
            requestAnimationFrame(paintFrame);
        } else {
            resultDisplay.textContent = finalTarget.toFixed(2) + "%";
            progressFillCircle.style.strokeDashoffset = circumference - (cappedVisualScore / 100 * circumference);
            
            if (summaryDisplayCard) {
                const baseColor = getDynamicColor(finalTarget);
                const rgbValues = baseColor.match(/\d+/g);
                if (rgbValues && rgbValues.length >= 3) {
                    summaryDisplayCard.style.backgroundColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.05)`;
                    summaryDisplayCard.style.borderColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.15)`;
                }
            }

            if (finalTarget >= 100) {
                showSuccessTrophy();
                if (summaryDisplayCard) summaryDisplayCard.classList.add('success-glow');
            } else {
                showFactorsTrigger();
            }
        }
    }
    requestAnimationFrame(paintFrame);
}

function showSuccessTrophy() {
    if (!gaugeBadgeContainer) return;
    gaugeBadgeContainer.innerHTML = '';
    const trophy = document.createElement('div');
    const colorTheme = colorBlindModeEnabled ? paletteColorblind.success : paletteNormal.success;
    
    trophy.id = 'gaugeTrophyDisplay';
    Object.assign(trophy.style, {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        padding: '4px 10px', fontSize: '0.675rem', borderRadius: '30px', fontWeight: '700',
        border: `1px solid ${colorTheme}`, background: colorTheme, color: '#ffffff',
        boxShadow: '0 3px 8px rgba(16, 185, 129, 0.22)', margin: '0 auto', cursor: 'default',
        animation: 'trophyPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    });
    trophy.innerHTML = `<i data-lucide="trophy" style="width:12px; height:12px; fill:#ffffff;"></i> Achieved`;
    gaugeBadgeContainer.appendChild(trophy);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showFactorsTrigger() {
    if (!gaugeBadgeContainer) return;
    gaugeBadgeContainer.innerHTML = `
        <button id="factorsBubbleBtn" style="display: inline-flex; align-items: center; gap: 4.5px; padding: 4px 11px; font-size: 0.675rem; border-radius: 30px; font-weight: 700; cursor: pointer; border: 1px solid #ef4444; background: #ef4444; color: #ffffff; box-shadow: 0 3px 8px rgba(239, 68, 68, 0.22); margin: 0 auto; animation: trophyPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, bubbleBounce 2s ease-in-out infinite;">
            <i data-lucide="info" style="width: 12px; height: 12px;"></i> Factors
        </button>
    `;
    const btn = document.getElementById('factorsBubbleBtn');
    if (btn) {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            slideToTips(); 
        });
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeGaugeBadge() {
    const trophy = document.getElementById('gaugeTrophyDisplay');
    if (trophy) trophy.remove();
    gaugeBadgeContainer.innerHTML = '';
}

function slideToInput() { sliderTrack.className = 'slider-track'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
function slideToSummary() { sliderTrack.className = 'slider-track show-summary'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
function slideToTips() { sliderTrack.className = 'slider-track show-tips'; window.scrollTo({ top: 0, behavior: 'smooth' }); }

if (bottomCollapseBtn) bottomCollapseBtn.addEventListener('click', (e) => { e.preventDefault(); slideToInput(); });

if (tipsBackBtn) {
    tipsBackBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        slideToSummary();
        setTimeout(() => {
            syncGaugeAnimation(currentCalculatedScore);
        }, 550);
    });
}

function getMetricAchievement(actual, goal, isInverse = false) {
    if (!actual || actual <= 0) return 0;
    const numValue = Number(actual);
    if (isInverse && numValue <= 1) return 0;
    return isInverse ? goal / numValue : numValue / goal;
}

function blendRGBColors(c1, c2, balance) {
    const resultingColor = c1.slice();
    for (let i = 0; i < 3; i++) {
        resultingColor[i] = Math.round(resultingColor[i] + balance * (c2[i] - c1[i]));
    }
    return `rgb(${resultingColor[0]}, ${resultingColor[1]}, ${resultingColor[2]})`;
}

function getDynamicColor(score) {
    if (score >= 100) return colorBlindModeEnabled ? 'rgb(13, 148, 136)' : 'rgb(16, 185, 129)'; 
    if (score >= 75 && score < 100) return colorBlindModeEnabled ? 'rgb(37, 99, 235)' : 'rgb(59, 130, 246)'; 

    const level = Math.max(0, score);
    const red = [239, 68, 68], orange = colorBlindModeEnabled ? [217, 119, 6] : [249, 115, 22], blue = colorBlindModeEnabled ? [37, 99, 235] : [59, 130, 246];     

    if (level <= 33.33) return blendRGBColors(red, orange, level / 33.33);
    else return blendRGBColors(orange, blue, (level - 33.33) / 41.67);
}

function resetErrors(el) {
    el.style.borderColor = '';
    el.style.backgroundColor = '';
    el.style.boxShadow = '';
}

[fcrInput, crsInput, ahtInput, qaInput].forEach(el => {
    if (el) el.addEventListener('input', () => resetErrors(el));
});

function buildSnapshotLink(scoreValue) {
    if (!standaloneDirectiveArea) return;
    standaloneDirectiveArea.innerHTML = '';

    const snapshotNode = document.createElement('div');
    snapshotNode.id = 'snapshotSection';
    Object.assign(snapshotNode.style, {
        display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px'
    });

    let directiveCardHtml = '';
    if (scoreValue < 100) {
        directiveCardHtml = `
            <div id="swappedActionPlanArea" style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid var(--primary); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px;">
                <span style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Performance Factors</span>
                <span style="color: #334155; font-size: 0.775rem; font-weight: 500; line-height: 1.45;">
                    Your overall score was impacted by sub-optimal metrics. To see what affected your stats and view targeted improvements, click the <strong>Factors</strong> tooltip bubble above.
                </span>
            </div>
        `;
    }

    snapshotNode.innerHTML = `
        ${directiveCardHtml}
        <div style="display: flex; justify-content: center;">
            <button id="copySnapshotBtn" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 0.725rem; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #ffffff; color: #475569; outline: none;">
                <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
                <span id="copyStatusText">Copy Scorecard Snapshot</span>
            </button>
        </div>
    `;
    
    standaloneDirectiveArea.appendChild(snapshotNode);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('copySnapshotBtn').addEventListener('click', () => {
        const date = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const copyContent = `[Incentive Scorecard - ${date}]\n` +
            `Overall Balanced Score: ${scoreValue.toFixed(2)}%\n` +
            `• FCR: ${fcrInput.value}%\n• CSAT: ${crsInput.value}%\n• AHT: ${ahtInput.value} min\n• QA: ${qaInput.value}%`;

        navigator.clipboard.writeText(copyContent).then(() => {
            const label = document.getElementById('copyStatusText');
            label.textContent = "Copied!";
            label.parentElement.style.backgroundColor = "#ecfdf5";
            label.parentElement.style.borderColor = "#10b981";
            label.parentElement.style.color = "#047857";

            setTimeout(() => {
                label.textContent = "Copy Scorecard Snapshot";
                label.parentElement.style.backgroundColor = "#ffffff";
                label.parentElement.style.borderColor = "#e2e8f0";
                label.parentElement.style.color = "#475569";
            }, 2000);
        });
    });
}

function renderDirectives(fcr, crs, aht, qa, isSuccess) {
    let html = '';
    const wrapperStyle = `display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 6px; width: 100%;`;
    const cardStructure = (accent) => `background: #ffffff; border: 1px solid #e2e8f0; border-left: 3.5px solid ${accent}; border-radius: 6px; display: flex; flex-direction: column; justify-content: space-between; min-height: 72px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;`;
    const bodySection = `display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; gap: 12px; height: 100%;`;
    const iconWrapper = (bg, c) => `height: 32px; width: 32px; border-radius: 6px; background: ${bg}; color: ${c}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;

    if (isSuccess) {
        html = `
            <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Operational Status</div>
            <div style="${wrapperStyle}">
                <div style="${cardStructure('#10b981')} cursor: default;">
                    <div style="${bodySection}">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="${iconWrapper('#ecfdf5', '#059669')}"><i data-lucide="check-circle-2" style="width:14px; height:14px;"></i></div>
                            <span style="color: #0f172a; font-size: 0.8rem; font-weight: 600;">Performance Standard Met</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        let itemNodes = '';
        const theme = colorBlindModeEnabled ? paletteColorblind : paletteNormal;

        const performanceReviewData = [
            { id: 'FCR', val: parseFloat(fcr), goal: metricsGoal.fcrGoal, name: 'First Contact Resolution', desc: 'Verify and comprehensively resolve live user cases within original contact periods to minimize call-backs.', icon: 'target', bg: '#fff7ed', text: '#c2410c', col: theme.fcr },
            { id: 'CSAT', val: parseFloat(crs), goal: metricsGoal.crsGoal, name: 'Customer Satisfaction', desc: 'Improve active listening, display empathy, and ensure all concerns are satisfied on prompt ratings.', icon: 'smile', bg: '#fff1f2', text: '#be123c', col: theme.csat },
            { id: 'AHT', val: parseFloat(aht), goal: metricsGoal.ahtGoal, name: 'Average Handle Time', desc: 'Organize procedures, minimize conversational tangents, and optimize macro usage to reduce processing time.', icon: 'clock', bg: '#f0f9ff', text: '#0369a1', col: theme.aht, inverse: true },
            { id: 'QA', val: parseFloat(qa), goal: metricsGoal.qaGoal, name: 'Quality Assurance', desc: 'Strictly follow documentation formats, uphold baseline validation processes, and maintain accurate logging standards.', icon: 'shield-check', bg: '#f5f3ff', text: '#6d28d9', col: theme.qa }
        ];

        performanceReviewData.forEach((item, index) => {
            if (item.inverse ? item.val > item.goal : item.val < item.goal) {
                itemNodes += `
                    <div onclick="document.getElementById('modal-${index}').showModal()" 
                         style="${cardStructure(item.col)}"
                         onmouseenter="this.style.backgroundColor = '#f8fafc'; this.style.borderColor = '${item.col}'; this.style.transform = 'translateY(-1px)';" 
                         onmouseleave="this.style.backgroundColor = '#ffffff'; this.style.borderColor = '#e2e8f0'; this.style.transform = 'translateY(0px)';"
                    >
                        <div style="${bodySection}">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <div style="${iconWrapper(item.bg, item.text)}"><i data-lucide="${item.icon}" style="width:14px; height:14px;"></i></div>
                                <div>
                                    <h4 style="margin: 0; color: #0f172a; font-size: 0.775rem; font-weight: 600;">${item.id} Diagnostic</h4>
                                    <div style="display: flex; align-items: center; gap: 4px; margin-top: 1px;">
                                        <p style="margin: 0; color: #64748b; font-size: 0.675rem; font-weight: 400;">Review details</p>
                                        <i data-lucide="info" style="width: 10px; height: 10px; color: #64748b;"></i>
                                    </div>
                                </div>
                            </div>
                            <i data-lucide="chevron-right" style="width: 14px; height: 14px; color: #64748b;"></i>
                        </div>

                        <dialog id="modal-${index}" onclick="event.stopPropagation()" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; width: calc(100% - 32px); max-width: 340px; margin: auto; background: #ffffff; box-shadow: 0 12px 32px -6px rgba(0,0,0,0.15); outline: none; animation: modalEnter 0.15s ease-out; color: #0f172a;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                                <div style="${iconWrapper(item.bg, item.text)}"><i data-lucide="${item.icon}" style="width:14px; height:14px;"></i></div>
                                <h3 style="margin: 0; color: #0f172a; font-size: 0.85rem; font-weight: 700;">${item.name}</h3>
                            </div>
                            <p style="color: #475569; font-size: 0.75rem; line-height: 1.5; text-align: left; margin: 0 0 14px 0; border-left: 2px solid ${item.col}; padding-left: 8px;">
                                ${item.desc}
                            </p>
                            <div style="display: flex; justify-content: flex-end;">
                                <button onclick="document.getElementById('modal-${index}').close()" style="padding: 5px 12px; font-size: 0.7rem; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: #ffffff; color: #475569;">Dismiss</button>
                            </div>
                        </dialog>
                    </div>
                `;
            }
        });

        html = `
            <div style="font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">Optimization Directives</div>
            <div style="${wrapperStyle}">${itemNodes}</div>
        `;
    }

    performanceTips.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function calculateOverallBSC() {
    const inputControls = [
        { el: fcrInput, name: 'FCR' }, { el: crsInput, name: 'CSAT' },
        { el: ahtInput, name: 'AHT' }, { el: qaInput, name: 'QA' }
    ];
    let failingFields = [];
    const existingAlert = document.getElementById('enterprisePremiumAlert');
    if (existingAlert) existingAlert.remove();

    inputControls.forEach(item => {
        if (!item.el.value.trim()) {
            failingFields.push(item.name);
            item.el.style.borderColor = '#ef4444';
            item.el.style.backgroundColor = '#fef2f2';
            item.el.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.08)';
        } else {
            resetErrors(item.el);
        }
    });

    if (failingFields.length > 0) {
        renderPremiumAlert("Incomplete Parameters", `Please verify and populate all empty metrics: ${failingFields.join(', ')}.`);
        return;
    }

    const fVal = parseFloat(fcrInput.value);
    const cVal = parseFloat(crsInput.value);
    const aVal = parseFloat(ahtInput.value);
    const qVal = parseFloat(qaInput.value);

    const fcrPoints = getMetricAchievement(fVal, metricsGoal.fcrGoal) * (metricsGoal.fcrWeight * 100);
    const crsPoints = getMetricAchievement(cVal, metricsGoal.crsGoal) * (metricsGoal.crsWeight * 100);
    const qaPoints = getMetricAchievement(qVal, metricsGoal.qaGoal) * (metricsGoal.qaWeight * 100);
    const ahtPoints = getMetricAchievement(aVal, metricsGoal.ahtGoal, true) * (metricsGoal.ahtWeight * 100);
    
    currentCalculatedScore = fcrPoints + crsPoints + qaPoints + ahtPoints + 20;
    const theme = colorBlindModeEnabled ? paletteColorblind : paletteNormal;

    metricsLegendList.innerHTML = `
        <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 2px; width: 100%;">
            ${[
                { label: 'First Contact Resolution', val: fcrPoints, color: theme.fcr },
                { label: 'Customer Satisfaction', val: crsPoints, color: theme.csat },
                { label: 'Average Handle Time', val: ahtPoints, color: theme.aht },
                { label: 'Quality Assurance', val: qaPoints, color: theme.qa },
                { label: 'Attendance Base Credit', val: 20, color: '#64748b' }
            ].map(item => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="display: inline-block; width: 3px; height: 12px; border-radius: 2px; background-color: ${item.color};"></span>
                        <span style="font-size: 0.75rem; font-weight: 500; color: #475569;">${item.label}</span>
                    </div>
                    <span style="font-size: 0.75rem; font-weight: 600; color: #0f172a; font-variant-numeric: tabular-nums;">${item.val.toFixed(1)}%</span>
                </div>
            `).join('')}
        </div>
    `;

    const isSuccess = currentCalculatedScore >= 100;
    const color = getDynamicColor(currentCalculatedScore);
    
    progressFillCircle.style.stroke = color;
    resultDisplay.style.color = color;

    slideToSummary();

    syncGaugeAnimation(currentCalculatedScore);
    renderDirectives(fVal, cVal, aVal, qVal, isSuccess);
    buildSnapshotLink(currentCalculatedScore);

    if (isSuccess) {
        achievementMessage.innerHTML = `<span style="color: #475569; font-size: 0.725rem;"><strong>Mastery Status:</strong> Overachievement unlocked. Targets fully exceeded.</span>`;
    } else {
        gaugeBadgeContainer.innerHTML = '';
        achievementMessage.innerHTML = '';
    }
}

[fcrInput, crsInput, ahtInput, qaInput].forEach(el => {
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); calculateOverallBSC(); } });
});

if (calcBtn) calcBtn.addEventListener('click', calculateOverallBSC);

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        [fcrInput, crsInput, ahtInput, qaInput].forEach(el => { if(el) { el.value = ''; resetErrors(el); } });
        clearProgressBars();
        metricsLegendList.innerHTML = '';
        gaugeBadgeContainer.innerHTML = '';
        if (standaloneDirectiveArea) standaloneDirectiveArea.innerHTML = '';
        if (summaryDisplayCard) {
            summaryDisplayCard.classList.remove('success-glow');
            summaryDisplayCard.style.backgroundColor = '#ffffff';
            summaryDisplayCard.style.borderColor = '#e2e8f0';
        }
        const existingAlert = document.getElementById('enterprisePremiumAlert');
        if (existingAlert) existingAlert.remove();
        
        slideToInput();
        resultDisplay.style.color = "#0f172a";
    });
}
});
