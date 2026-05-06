// ======================
// Initialize Matrix Grids
// ======================

function createMatrixGrid(containerId, rows, cols, prefix, initialValues = null) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'matrix-cell-input';
            input.id = `${prefix}_${i}_${j}`;
            input.maxLength = 6;
            input.inputMode = 'numeric';
            
            // Set initial value if provided
            if (initialValues && initialValues[i] && initialValues[i][j] !== undefined) {
                input.value = initialValues[i][j];
            } else {
                input.value = '0';
            }
            
            // Add event listeners for better UX
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const currentRow = parseInt(this.id.split('_')[1]);
                    const currentCol = parseInt(this.id.split('_')[2]);
                    const nextCol = currentCol + 1;
                    const nextRow = currentRow;
                    
                    if (nextCol < cols) {
                        const nextInput = document.getElementById(`${prefix}_${nextRow}_${nextCol}`);
                        if (nextInput) nextInput.focus();
                    } else if (currentRow + 1 < rows) {
                        const nextInput = document.getElementById(`${prefix}_${currentRow + 1}_0`);
                        if (nextInput) nextInput.focus();
                    }
                }
            });
            
            input.addEventListener('input', function() {
                // Allow only numbers and minus sign
                this.value = this.value.replace(/[^-\d]/g, '');
            });
            
            container.appendChild(input);
        }
    }
}

function getMatrixFromGrid(prefix, rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const input = document.getElementById(`${prefix}_${i}_${j}`);
            const value = input ? parseInt(input.value) || 0 : 0;
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

// ======================
// Parse Matrix (legacy)
// ======================

function parseMatrix(text) {
    const lines = text.trim().split('\n');
    const matrix = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line === '') continue;
        
        const row = line
            .split(/\s+/)
            .map(Number);
        
        matrix.push(row);
    }
    
    return matrix;
}

// ======================
// Convolution
// ======================

function convolve(image, kernel) {
    const imgRows = image.length;
    const imgCols = image[0].length;
    
    const kRows = kernel.length;
    const kCols = kernel[0].length;
    
    const centerX = Math.floor(kRows / 2);
    const centerY = Math.floor(kCols / 2);
    
    const output = [];
    const steps = [];
    
    // loop output
    for (let i = 0; i < imgRows; i++) {
        output[i] = [];
        
        for (let j = 0; j < imgCols; j++) {
            let sum = 0;
            
            const coveredMatrix = [];
            const calculations = [];
            
            // loop kernel
            for (let m = 0; m < kRows; m++) {
                coveredMatrix[m] = [];
                
                for (let n = 0; n < kCols; n++) {
                    // mapping image position
                    const x = i + m - centerX;
                    const y = j + n - centerY;
                    
                    let imageValue = 0;
                    
                    // zero padding
                    if (
                        x >= 0 &&
                        x < imgRows &&
                        y >= 0 &&
                        y < imgCols
                    ) {
                        imageValue = image[x][y];
                    }
                    
                    const kernelValue = kernel[m][n];
                    const product = imageValue * kernelValue;
                    
                    sum += product;
                    
                    coveredMatrix[m][n] = imageValue;
                    
                    calculations.push({
                        imageValue,
                        kernelValue,
                        product
                    });
                }
            }
            
            output[i][j] = sum;
            
            steps.push({
                outputPos: [i, j],
                coveredMatrix,
                calculations,
                result: sum
            });
        }
    }
    
    return {
        output,
        steps
    };
}

// ======================
// Render Output Matrix
// ======================

function renderOutput(matrix) {
    const container = document.getElementById('outputMatrix');
    const dimensions = document.getElementById('outputDimensions');
    
    container.innerHTML = '';
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    dimensions.textContent = `${rows} x ${cols}`;
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    matrix.forEach(row => {
        row.forEach(value => {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell-output';
            cell.textContent = value;
            container.appendChild(cell);
        });
    });
}

// ======================
// Render Steps
// ======================

function renderSteps(steps) {
    const container = document.getElementById('stepsDetail');
    const count = document.getElementById('stepsCount');
    
    container.innerHTML = '';
    count.textContent = `${steps.length} bước tính`;
    
    steps.forEach((step, index) => {
        const item = document.createElement('div');
        item.className = 'step-item';
        
        // render covered matrix
        let coveredText = '';
        step.coveredMatrix.forEach(row => {
            coveredText += row.map(v => v.toString().padStart(3)).join('   ') + '\n';
        });
        // render calculations
        let calcText = '';
        const kCols = Math.sqrt(step.calculations.length);
        step.calculations.forEach((calc, idx) => {
            const sign = calc.kernelValue >= 0 ? '+' : '';
            calcText += `${calc.imageValue}×${calc.kernelValue}`;
            
            if (idx < step.calculations.length - 1) {
                calcText += ' + ';
            }
            
            // xuống dòng mỗi hàng kernel
            if ((idx + 1) % kCols === 0 && idx < step.calculations.length - 1) {
                calcText += '\n';
            }
        });
                
         item.innerHTML = `
            <h3 class="step-header">
                Bước ${index + 1}: Output(${step.outputPos[0]}, ${step.outputPos[1]})
            </h3>
            
            <div class="covered-region">
Vùng phủ (kết hợp zero-padding):
${coveredText}
            </div>
            
            <div class="calculation">
Phép tính:
(${calcText})
            </div>
            
            <div class="result-line">
                = ${step.result}
            </div>
        `;
        
        container.appendChild(item);
    });
}

// ======================
// Initialize Application
// ======================

function initializeApp() {
    // Default values
    const defaultImage = [
        [0, 7, 10, 1],
        [2, 9, 1, 0],
        [9, 10, 10, 1],
        [8, 8, 7, 6]
    ];
    
    const defaultKernel = [
        [1, 2, 1],
        [3, 1, 0],
        [1, 0, 1]
    ];
    
    // Create initial grids
    createMatrixGrid('matrixIContainer', 4, 4, 'image', defaultImage);
    createMatrixGrid('kernelHContainer', 3, 3, 'kernel', defaultKernel);
    
    // Event listeners for size changes
    document.getElementById('imageRows').addEventListener('change', function() {
        const rows = parseInt(this.value);
        const cols = parseInt(document.getElementById('imageCols').value);
        const currentRows = Math.min(rows, 10);
        const currentCols = Math.min(cols, 10);
        const currentMatrix = getMatrixFromGrid('image', currentRows, currentCols);
        createMatrixGrid('matrixIContainer', rows, cols, 'image', currentMatrix);
    });
    
    document.getElementById('imageCols').addEventListener('change', function() {
        const rows = parseInt(document.getElementById('imageRows').value);
        const cols = parseInt(this.value);
        const currentRows = Math.min(rows, 10);
        const currentCols = Math.min(cols, 10);
        const currentMatrix = getMatrixFromGrid('image', currentRows, currentCols);
        createMatrixGrid('matrixIContainer', rows, cols, 'image', currentMatrix);
    });
    
    document.getElementById('kernelSize').addEventListener('change', function() {
        const size = parseInt(this.value);
        const currentKernel = getMatrixFromGrid('kernel', size, size);
        createMatrixGrid('kernelHContainer', size, size, 'kernel', currentKernel);
    });
    
    // Reset buttons
    document.getElementById('resetImage').addEventListener('click', function() {
        const rows = parseInt(document.getElementById('imageRows').value);
        const cols = parseInt(document.getElementById('imageCols').value);
        createMatrixGrid('matrixIContainer', rows, cols, 'image');
    });
    
    document.getElementById('resetKernel').addEventListener('click', function() {
        const size = parseInt(document.getElementById('kernelSize').value);
        createMatrixGrid('kernelHContainer', size, size, 'kernel');
    });
    
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', () => {
        const imageRows = parseInt(document.getElementById('imageRows').value);
        const imageCols = parseInt(document.getElementById('imageCols').value);
        const kernelSize = parseInt(document.getElementById('kernelSize').value);
        
        const image = getMatrixFromGrid('image', imageRows, imageCols);
        const kernel = getMatrixFromGrid('kernel', kernelSize, kernelSize);
        
        // validate
        if (image.length === 0 || kernel.length === 0) {
            alert('Vui lòng nhập matrix');
            return;
        }
        
        // kernel square check
        if (kernel.length !== kernel[0].length) {
            alert('Kernel phải là ma trận vuông');
            return;
        }
        
        // convolution
        const result = convolve(image, kernel);
        
        // render
        renderOutput(result.output);
        renderSteps(result.steps);
        
        // show section
        document.getElementById('resultSection').style.display = 'block';
        
        // Scroll to results
        document.getElementById('resultSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}