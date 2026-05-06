// State variables
let imageMatrix = [];
let kernelMatrix = [];
let outputMatrix = [];
let currentStep = 0;
let totalSteps = 0;
let steps = [];
let isAutoPlaying = false;
let autoPlayInterval = null;

// Settings
let padding = 0;
let stride = 1;
let mode = 'cross-correlation';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultMatrices();
    updateAllDisplays();
});

// Initialize default matrices
function initializeDefaultMatrices() {
    // Default 4x4 image matrix
    imageMatrix = [
        [0, 7, 10, 1],
        [2, 9, 1, 0],
        [9, 10, 10, 1],
        [8, 8, 7, 6]
    ];
    
    // Default 3x3 kernel
    kernelMatrix = [
        [1, 2, 1],
        [3, 1, 0],
        [1, 0, 1]
    ];
    
    updateTextAreas();
}

// Update text areas with matrix values
function updateTextAreas() {
    document.getElementById('imageInput').value = matrixToString(imageMatrix);
    document.getElementById('kernelInput').value = matrixToString(kernelMatrix);
    document.getElementById('imageSize').value = imageMatrix.length;
    document.getElementById('kernelSize').value = kernelMatrix.length;
}

// Convert matrix to string
function matrixToString(matrix) {
    return matrix.map(row => row.join(' ')).join('\n');
}

// Parse matrix from string
function parseMatrix(text) {
    const lines = text.trim().split('\n');
    const matrix = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === '') continue;
        
        const row = line.split(/\s+/).map(val => {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
        });
        
        if (row.length > 0) {
            matrix.push(row);
        }
    }
    
    return matrix;
}

// Update image matrix from input
function updateImageMatrix() {
    const text = document.getElementById('imageInput').value;
    const newMatrix = parseMatrix(text);
    
    if (newMatrix.length > 0 && newMatrix[0].length > 0) {
        imageMatrix = newMatrix;
        document.getElementById('imageSize').value = imageMatrix.length;
        renderMatrixDisplay('imageDisplay', imageMatrix, 'image');
    }
}

// Update kernel matrix from input
function updateKernelMatrix() {
    const text = document.getElementById('kernelInput').value;
    const newMatrix = parseMatrix(text);
    
    if (newMatrix.length > 0 && newMatrix[0].length > 0) {
        kernelMatrix = newMatrix;
        document.getElementById('kernelSize').value = kernelMatrix.length;
        renderMatrixDisplay('kernelDisplay', kernelMatrix, 'kernel');
    }
}

// Change image size
function changeImageSize() {
    const size = parseInt(document.getElementById('imageSize').value);
    const newMatrix = [];
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            if (imageMatrix[i] && imageMatrix[i][j] !== undefined) {
                row.push(imageMatrix[i][j]);
            } else {
                row.push(0);
            }
        }
        newMatrix.push(row);
    }
    
    imageMatrix = newMatrix;
    updateTextAreas();
    renderMatrixDisplay('imageDisplay', imageMatrix, 'image');
}

// Change kernel size
function changeKernelSize() {
    const size = parseInt(document.getElementById('kernelSize').value);
    const newMatrix = [];
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            if (kernelMatrix[i] && kernelMatrix[i][j] !== undefined) {
                row.push(kernelMatrix[i][j]);
            } else {
                row.push(0);
            }
        }
        newMatrix.push(row);
    }
    
    kernelMatrix = newMatrix;
    updateTextAreas();
    renderMatrixDisplay('kernelDisplay', kernelMatrix, 'kernel');
}

// Update settings
function updateSettings() {
    padding = parseInt(document.getElementById('paddingInput').value) || 0;
    stride = parseInt(document.getElementById('strideInput').value) || 1;
    mode = document.getElementById('modeSelect').value;
    
    // Recalculate if we have steps
    if (steps.length > 0) {
        calculateAll();
    }
}

// Generate random matrix
function randomMatrix() {
    const size = parseInt(document.getElementById('imageSize').value);
    imageMatrix = [];
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(Math.floor(Math.random() * 20));
        }
        imageMatrix.push(row);
    }
    
    updateTextAreas();
    renderMatrixDisplay('imageDisplay', imageMatrix, 'image');
}

// Generate random kernel
function randomKernel() {
    const size = parseInt(document.getElementById('kernelSize').value);
    kernelMatrix = [];
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(Math.floor(Math.random() * 10) - 5);
        }
        kernelMatrix.push(row);
    }
    
    updateTextAreas();
    renderMatrixDisplay('kernelDisplay', kernelMatrix, 'kernel');
}

// Render matrix display
function renderMatrixDisplay(containerId, matrix, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gap = '2px';
    container.style.padding = '10px';
    container.style.background = 'rgba(0,0,0,0.05)';
    container.style.borderRadius = '10px';
    
    container.innerHTML = '';
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.textContent = matrix[i][j];
            cell.style.minWidth = '30px';
            cell.style.textAlign = 'center';
            container.appendChild(cell);
        }
    }
}

// Calculate convolution step
function convolutionStep(image, kernel, row, col, pad, str, flipKernel = false) {
    const kSize = kernel.length;
    const center = Math.floor(kSize / 2);
    let sum = 0;
    const calculations = [];
    const coveredCells = [];
    
    for (let m = 0; m < kSize; m++) {
        for (let n = 0; n < kSize; n++) {
            let x, y, kernelVal;
            
            if (flipKernel) {
                // Convolution (flip kernel)
                x = row + (kSize - 1 - m) - center;
                y = col + (kSize - 1 - n) - center;
                kernelVal = kernel[kSize - 1 - m][kSize - 1 - n];
            } else {
                // Cross-correlation (no flip)
                x = row + m - center;
                y = col + n - center;
                kernelVal = kernel[m][n];
            }
            
            // Apply padding offset
            x = x + pad;
            y = y + pad;
            
            let imageVal = 0;
            if (x >= 0 && x < image.length && y >= 0 && y < image[0].length) {
                imageVal = image[x][y];
            }
            
            const product = imageVal * kernelVal;
            sum += product;
            
            calculations.push({
                imageVal: imageVal,
                kernelVal: kernelVal,
                product: product,
                x: x - pad, // Original coordinates without padding
                y: y - pad
            });
            
            if (imageVal !== 0) {
                coveredCells.push({ x: x - pad, y: y - pad, val: imageVal });
            }
        }
    }
    
    return {
        sum: sum,
        calculations: calculations,
        coveredCells: coveredCells,
        center: center
    };
}

// Calculate all steps
function calculateAll() {
    steps = [];
    
    const imgRows = imageMatrix.length;
    const imgCols = imageMatrix[0].length;
    const kSize = kernelMatrix.length;
    const center = Math.floor(kSize / 2);
    
    // Calculate output dimensions
    const outRows = Math.floor((imgRows + 2 * padding - kSize) / stride) + 1;
    const outCols = Math.floor((imgCols + 2 * padding - kSize) / stride) + 1;
    
    outputMatrix = [];
    
    let stepIndex = 0;
    
    for (let i = 0; i < outRows; i++) {
        outputMatrix[i] = [];
        for (let j = 0; j < outCols; j++) {
            const actualRow = i * stride;
            const actualCol = j * stride;
            
            const result = convolutionStep(
                imageMatrix, 
                kernelMatrix, 
                actualRow, 
                actualCol, 
                padding, 
                stride,
                mode === 'convolution'
            );
            
            outputMatrix[i][j] = result.sum;
            
            steps.push({
                index: stepIndex++,
                outputRow: i,
                outputCol: j,
                imageRow: actualRow,
                imageCol: actualCol,
                result: result.sum,
                calculations: result.calculations,
                coveredCells: result.coveredCells,
                center: result.center
            });
        }
    }
    
    totalSteps = steps.length;
    currentStep = 0;
    
    updateProgress();
    renderVisualization();
    renderOutputMatrix();
    renderStepHistory();
}

// Next step
function nextStep() {
    if (currentStep < totalSteps - 1) {
        currentStep++;
        updateProgress();
        renderVisualization();
    }
}

// Previous step
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateProgress();
        renderVisualization();
    }
}

// Auto play
function autoPlay() {
    const btn = document.getElementById('autoPlayBtn');
    
    if (isAutoPlaying) {
        isAutoPlaying = false;
        clearInterval(autoPlayInterval);
        btn.textContent = '▶ Auto Play';
        btn.style.background = '#9b59b6';
    } else {
        isAutoPlaying = true;
        btn.textContent = '⏹ Stop';
        btn.style.background = '#e74c3c';
        
        autoPlayInterval = setInterval(() => {
            if (currentStep < totalSteps - 1) {
                nextStep();
            } else {
                autoPlay(); // Stop when done
            }
        }, 1000);
    }
}

// Reset all
function resetAll() {
    isAutoPlaying = false;
    clearInterval(autoPlayInterval);
    document.getElementById('autoPlayBtn').textContent = '▶ Auto Play';
    document.getElementById('autoPlayBtn').style.background = '#9b59b6';
    
    currentStep = 0;
    steps = [];
    totalSteps = 0;
    outputMatrix = [];
    
    initializeDefaultMatrices();
    updateAllDisplays();
}

// Update progress
function updateProgress() {
    const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
        `Bước ${currentStep + 1} / ${totalSteps}`;
}

// Render visualization
function renderVisualization() {
    const gridContainer = document.getElementById('imageGrid');
    const kernelOverlay = document.getElementById('kernelOverlay');
    const calcText = document.getElementById('calculationText');
    const currentPos = document.getElementById('currentPos');
    const roiInfo = document.getElementById('roiInfo');
    const currentResult = document.getElementById('currentResult');
    
    if (steps.length === 0) {
        gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Chưa có phép tính. Bấm "Calculate All" để bắt đầu.</p>';
        return;
    }
    
    const step = steps[currentStep];
    const imgRows = imageMatrix.length;
    const imgCols = imageMatrix[0].length;
    const kSize = kernelMatrix.length;
    
    // Render image grid
    gridContainer.style.gridTemplateColumns = `repeat(${imgCols}, 1fr)`;
    gridContainer.innerHTML = '';
    
    for (let i = 0; i < imgRows; i++) {
        for (let j = 0; j < imgCols; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = imageMatrix[i][j];
            
            // Check if this cell is covered by kernel
            const isCovered = step.coveredCells.some(c => c.x === i && c.y === j);
            const isCenter = (i === step.imageRow + step.center - padding && 
                            j === step.imageCol + step.center - padding);
            
            if (isCovered) {
                cell.classList.add('roi');
            }
            if (isCenter) {
                cell.classList.add('center');
            }
            
            gridContainer.appendChild(cell);
        }
    }
    
    // Render kernel overlay
    kernelOverlay.innerHTML = '';
    const kernelCenter = step.center;
    
    for (let m = 0; m < kSize; m++) {
        for (let n = 0; n < kSize; n++) {
            const kernelCell = document.createElement('div');
            kernelCell.className = 'kernel-cell';
            
            let kernelVal;
            if (mode === 'convolution') {
                kernelVal = kernelMatrix[kSize - 1 - m][kSize - 1 - n];
            } else {
                kernelVal = kernelMatrix[m][n];
            }
            
            kernelCell.textContent = kernelVal;
            
            // Calculate position
            const x = step.imageRow + m - kernelCenter;
            const y = step.imageCol + n - kernelCenter;
            
            kernelCell.style.left = `${(y + 1) * 52 + 10}px`;
            kernelCell.style.top = `${(x + 1) * 52 + 10}px`;
            
            if (m === kernelCenter && n === kernelCenter) {
                kernelCell.classList.add('center-kernel');
            }
            
            kernelOverlay.appendChild(kernelCell);
        }
    }
    
    // Render calculation details
    let calcHtml = `Bước ${step.index + 1} — tính tại I(${step.imageRow}, ${step.imageCol})\n\n`;
    calcHtml += `Vùng phủ:\n`;
    
    // Show covered region
    for (let m = 0; m < kSize; m++) {
        for (let n = 0; n < kSize; n++) {
            const x = step.imageRow + m - kernelCenter - padding;
            const y = step.imageCol + n - kernelCenter - padding;
            
            let val = 0;
            if (x >= 0 && x < imgRows && y >= 0 && y < imgCols) {
                val = imageMatrix[x][y];
            }
            
            calcHtml += val.toString().padStart(3) + ' ';
        }
        calcHtml += '\n';
    }
    
    calcHtml += `\nTính:\n`;
    
    let terms = [];
    for (let calc of step.calculations) {
        terms.push(`(${calc.imageVal}×${calc.kernelVal})`);
    }
    calcHtml += terms.join(' + ') + '\n';
    
    calcHtml += `\n= ${step.result}\n`;
    calcHtml += `Output(${step.outputRow}, ${step.outputCol}) = ${step.result}`;
    
    calcText.textContent = calcHtml;
    
    // Update info boxes
    currentPos.textContent = `(${step.imageRow}, ${step.imageCol})`;
    
    const roiStartRow = Math.max(0, step.imageRow - kernelCenter);
    const roiStartCol = Math.max(0, step.imageCol - kernelCenter);
    const roiEndRow = Math.min(imgRows - 1, step.imageRow + kernelCenter);
    const roiEndCol = Math.min(imgCols - 1, step.imageCol + kernelCenter);
    roiInfo.textContent = `[${roiStartRow},${roiStartCol}] đến [${roiEndRow},${roiEndCol}]`;
    
    currentResult.textContent = step.result;
}

// Render output matrix
function renderOutputMatrix() {
    const container = document.getElementById('outputDisplay');
    
    if (outputMatrix.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Chưa có kết quả. Bấm "Calculate All" để tính.</p>';
        return;
    }
    
    const rows = outputMatrix.length;
    const cols = outputMatrix[0].length;
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gap = '5px';
    container.style.padding = '15px';
    container.style.background = 'rgba(0,0,0,0.05)';
    container.style.borderRadius = '10px';
    container.style.minHeight = '80px';
    
    container.innerHTML = '';
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell result';
            cell.textContent = outputMatrix[i][j];
            cell.style.fontSize = '16px';
            cell.style.fontWeight = 'bold';
            container.appendChild(cell);
        }
    }
}

// Render step history
function renderStepHistory() {
    const container = document.getElementById('stepHistory');
    container.innerHTML = '';
    
    if (steps.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Chưa có lịch sử. Bấm "Calculate All" để bắt đầu.</p>';
        return;
    }
    
    steps.forEach((step, index) => {
        const item = document.createElement('div');
        item.className = 'step-item';
        
        let calcHtml = '';
        for (let calc of step.calculations) {
            calcHtml += `(${calc.imageVal}×${calc.kernelVal}) + `;
        }
        calcHtml = calcHtml.slice(0, -3); // Remove last " + "
        
        item.innerHTML = `
            <div class="step-item-header">
                <span class="step-number">Bước ${step.index + 1}</span>
                <span class="step-result">Output(${step.outputRow}, ${step.outputCol}) = ${step.result}</span>
            </div>
            <div class="step-calculation">
                Tại I(${step.imageRow}, ${step.imageCol}): ${calcHtml} = ${step.result}
            </div>
        `;
        
        item.addEventListener('click', () => {
            currentStep = index;
            updateProgress();
            renderVisualization();
        });
        
        container.appendChild(item);
    });
}

// Update all displays
function updateAllDisplays() {
    renderMatrixDisplay('imageDisplay', imageMatrix, 'image');
    renderMatrixDisplay('kernelDisplay', kernelMatrix, 'kernel');
    renderOutputMatrix();
    
    document.getElementById('progressText').textContent = 'Bước 0 / 0';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentStep').textContent = '0';
    document.getElementById('calculationText').textContent = 
        'Chưa có phép tính. Bấm "Calculate All" để bắt đầu.';
    document.getElementById('currentPos').textContent = '(0, 0)';
    document.getElementById('roiInfo').textContent = '-';
    document.getElementById('currentResult').textContent = '-';
    
    const historyContainer = document.getElementById('stepHistory');
    historyContainer.innerHTML = '<p style="text-align: center; color: #666;">Chưa có lịch sử. Bấm "Calculate All" để bắt đầu.</p>';
}

// Export JSON
function exportJSON() {
    if (steps.length === 0) {
        alert('Vui lòng bấm "Calculate All" trước khi xuất!');
        return;
    }
    
    const exportData = {
        info: {
            date: new Date().toISOString(),
            mode: mode,
            padding: padding,
            stride: stride
        },
        input: {
            image: imageMatrix,
            kernel: kernelMatrix
        },
        output: outputMatrix,
        steps: steps.map(step => ({
            index: step.index,
            outputPosition: [step.outputRow, step.outputCol],
            imagePosition: [step.imageRow, step.imageCol],
            result: step.result,
            calculations: step.calculations.map(c => ({
                image_value: c.imageVal,
                kernel_value: c.kernelVal,
                product: c.product,
                position: [c.x, c.y]
            }))
        }))
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `convolution_result_${new Date().getTime()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeBtn');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        btn.textContent = '☀️ Light Mode';
    } else {
        btn.textContent = '🌙 Dark Mode';
    }
}