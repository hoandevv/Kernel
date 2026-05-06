// ======================
// Parse Matrix
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

    container.innerHTML = '';

    const cols = matrix[0].length;

    container.style.gridTemplateColumns =
        `repeat(${cols}, 60px)`;

    matrix.forEach(row => {

        row.forEach(value => {

            const cell = document.createElement('div');

            cell.className = 'matrix-cell';

            cell.textContent = value;

            container.appendChild(cell);
        });
    });
}

// ======================
// Render Steps
// ======================

function renderSteps(steps) {

    const container =
        document.getElementById('stepsDetail');

    container.innerHTML = '';

    steps.forEach(step => {

        const item = document.createElement('div');

        item.className = 'step-item';

        // render covered matrix
        let coveredText = '';

        step.coveredMatrix.forEach(row => {

            coveredText += row.join('   ') + '\n';
        });

        // render calculations
        let calcText = '';

        step.calculations.forEach((calc, index) => {

            calcText +=
                `(${calc.imageValue}×${calc.kernelValue})`;

            if (index < step.calculations.length - 1) {
                calcText += ' + ';
            }

            // xuống dòng mỗi hàng kernel
            if ((index + 1) % 3 === 0) {
                calcText += '\n';
            }
        });

        item.innerHTML = `
            <h3>
                O(${step.outputPos[0]}, ${step.outputPos[1]})
            </h3>

            <pre>
Vùng phủ:
${coveredText}
            </pre>

            <pre>
Tính:
${calcText}

= ${step.result}
            </pre>

            <div class="final-result">
                Output(${step.outputPos[0]}, ${step.outputPos[1]})
                = ${step.result}
            </div>
        `;

        container.appendChild(item);
    });
}

// ======================
// Main Calculate
// ======================

document
    .getElementById('calculateBtn')
    .addEventListener('click', () => {

        const imageText =
            document.getElementById('matrixI').value;

        const kernelText =
            document.getElementById('kernelH').value;

        const image = parseMatrix(imageText);

        const kernel = parseMatrix(kernelText);

        // validate
        if (
            image.length === 0 ||
            kernel.length === 0
        ) {
            alert('Vui lòng nhập matrix');

            return;
        }

        // kernel square check
        if (kernel.length !== kernel[0].length) {

            alert('Kernel phải là ma trận vuông');

            return;
        }

        // convolution
        const result =
            convolve(image, kernel);

        // render
        renderOutput(result.output);

        renderSteps(result.steps);

        // show section
        document
            .getElementById('resultSection')
            .style.display = 'block';
    });