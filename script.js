class NewmanProjection {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Configurable settings
        this.settings = {
            bondThickness: 3.5,
            bondLength: 80,
            circleRadius: 40,
            backAngle: 30,
            frontAngle: 30,
            arcThickness: 3.5,
            substituentMargin: 15,
            fontSize: 14
        };
        
        this.rotation = 0;
        this.frontGroups = ['H', 'H', 'H'];
        this.backGroups = ['H', 'H', 'H'];
        
        this.draw();
    }
    
    // Public methods for external updates
    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            this.draw();
        }
    }
    
    updateSettings(settingsObject) {
        Object.assign(this.settings, settingsObject);
        this.draw();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw back carbon circle
        this.drawBackCarbon();
        
        // Draw front carbon bonds and groups
        this.drawFrontCarbon();
    }
    
    drawBackCarbon() {
        // Draw circle representing back carbon
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = this.settings.arcThickness;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.settings.circleRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Draw back carbon bonds and groups
        for (let i = 0; i < 3; i++) {
            const angle = ((i * 120) + this.settings.backAngle) * Math.PI / 180;
            
            // Calculate bond start position on circle edge
            const bondStartX = this.centerX + this.settings.circleRadius * Math.cos(angle);
            const bondStartY = this.centerY + this.settings.circleRadius * Math.sin(angle);
            
            // Calculate bond end position (center + bond length - same as front carbon)
            const bondEndX = this.centerX + this.settings.bondLength * Math.cos(angle);
            const bondEndY = this.centerY + this.settings.bondLength * Math.sin(angle);
            
            // Calculate group position (bond end + substituent margin)
            const groupX = bondEndX + this.settings.substituentMargin * Math.cos(angle);
            const groupY = bondEndY + this.settings.substituentMargin * Math.sin(angle);
            
            // Draw bond from circle edge to bond end
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = this.settings.bondThickness;
            this.ctx.beginPath();
            this.ctx.moveTo(bondStartX, bondStartY);
            this.ctx.lineTo(bondEndX, bondEndY);
            this.ctx.stroke();
            
            // Draw group label
            this.drawGroupLabel(groupX, groupY, this.backGroups[i]);
        }
    }
    
    drawFrontCarbon() {
        // Draw front carbon bonds and groups
        for (let i = 0; i < 3; i++) {
            // Apply rotation and front angle offset to front carbon groups
            const angle = ((i * 120) + this.rotation + this.settings.frontAngle) * Math.PI / 180;
            
            // Calculate bond end position (center + bond length)
            const bondEndX = this.centerX + this.settings.bondLength * Math.cos(angle);
            const bondEndY = this.centerY + this.settings.bondLength * Math.sin(angle);
            
            // Calculate group position (bond end + substituent margin)
            const groupX = bondEndX + this.settings.substituentMargin * Math.cos(angle);
            const groupY = bondEndY + this.settings.substituentMargin * Math.sin(angle);
            
            // Draw bond from center to bond end
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = this.settings.bondThickness;
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(bondEndX, bondEndY);
            this.ctx.stroke();
            
            // Draw group label
            this.drawGroupLabel(groupX, groupY, this.frontGroups[i]);
        }
        
        // Draw center dot for front carbon
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawGroupLabel(x, y, text) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${this.settings.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    }
    
    // Public methods for external updates (no DOM dependencies)
    setFrontGroups(groups) {
        this.frontGroups = groups;
        this.draw();
    }
    
    setBackGroups(groups) {
        this.backGroups = groups;
        this.draw();
    }
    
    setRotation(angle) {
        this.rotation = angle;
        this.draw();
    }
    
    setFrontGroup(index, group) {
        if (index >= 0 && index < 3) {
            this.frontGroups[index] = group || 'H';
            this.draw();
        }
    }
    
    setBackGroup(index, group) {
        if (index >= 0 && index < 3) {
            this.backGroups[index] = group || 'H';
            this.draw();
        }
    }
}

// UI Event Handling Functions (separated from drawing class)
function setupSettingControl(newman, elementId, settingKey, suffix = '') {
    const slider = document.getElementById(elementId);
    const numberInput = document.getElementById(elementId + '-input');
    const valueDisplay = document.getElementById(elementId + '-value');
    
    // Handle slider input
    slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        newman.updateSetting(settingKey, value);
        if (numberInput) numberInput.value = value;
        if (valueDisplay) valueDisplay.textContent = value + suffix;
    });
    
    // Handle number input (if it exists)
    if (numberInput) {
        numberInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                newman.updateSetting(settingKey, value);
                slider.value = Math.min(Math.max(value, slider.min), slider.max);
                if (valueDisplay) valueDisplay.textContent = value + suffix;
            }
        });
    }
    
    // Initialize display
    if (valueDisplay) valueDisplay.textContent = newman.settings[settingKey] + suffix;
    if (numberInput) numberInput.value = newman.settings[settingKey];
}

function setupRotationControl(newman) {
    const rotationSlider = document.getElementById('rotation');
    const rotationValue = document.getElementById('rotation-value');
    
    rotationSlider.addEventListener('input', (e) => {
        const angle = parseInt(e.target.value);
        newman.setRotation(angle);
        rotationValue.textContent = angle + '°';
    });
}

function setupGroupInputs(newman) {
    // Front carbon group inputs
    ['front1', 'front2', 'front3'].forEach((id, index) => {
        document.getElementById(id).addEventListener('input', (e) => {
            newman.setFrontGroup(index, e.target.value || 'H');
        });
    });
    
    // Back carbon group inputs
    ['back1', 'back2', 'back3'].forEach((id, index) => {
        document.getElementById(id).addEventListener('input', (e) => {
            newman.setBackGroup(index, e.target.value || 'H');
        });
    });
}

// Initialize the Newman projection tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const newman = new NewmanProjection('newman-canvas');
    
    // Setup UI controls (separated from drawing class)
    setupRotationControl(newman);
    setupGroupInputs(newman);
    
    // Setup all setting controls
    setupSettingControl(newman, 'bond-thickness', 'bondThickness');
    setupSettingControl(newman, 'bond-length', 'bondLength');
    setupSettingControl(newman, 'circle-radius', 'circleRadius');
    setupSettingControl(newman, 'back-angle', 'backAngle', '°');
    setupSettingControl(newman, 'front-angle', 'frontAngle', '°');
    setupSettingControl(newman, 'arc-thickness', 'arcThickness');
    setupSettingControl(newman, 'substituent-margin', 'substituentMargin');
    setupSettingControl(newman, 'font-size', 'fontSize');
    
    // Make it globally accessible for debugging/testing
    window.newman = newman;
});
