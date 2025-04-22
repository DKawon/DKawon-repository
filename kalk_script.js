let currentInput = '';
const display = document.getElementById('display');
const historyContainer = document.getElementById('history');
const history = [];
let isCalcMode = true;

const math = window.math;

function factorial(n) {
    if (!Number.isInteger(n) || n < 0) throw new Error('Silnia wymaga nieujemnej liczby całkowitej');
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function balanceParentheses(expr) {
    let openParens = 0;
    for (let char of expr) {
        if (char === '(') openParens++;
        if (char === ')') openParens--;
    }
    while (openParens > 0) {
        expr += ')';
        openParens--;
    }
    return expr;
}

function appendValue(value) {
    if (!isCalcMode) return;
    currentInput += value;
    display.value = currentInput;
}

function calculateResult() {
    if (!isCalcMode) return;
    try {
        let expression = currentInput.replace('^', '**');
        
        expression = expression.replace(/(\d+)%/g, '($1/100)');

        expression = expression.replace(/(\d+)!/g, 'factorial($1)');

        expression = balanceParentheses(expression);

        const result = math.evaluate(expression, { factorial });
        
        const equation = `${currentInput} = ${result}`;
        history.push(equation);
        updateHistory();
        display.value = result;
        currentInput = result.toString();
    } catch (e) {
        alert("Błąd w działaniu: " + e.message);
    }
}

function clearDisplay() {
    currentInput = '';
    display.value = '';
}

function deleteLastChar() {
    if (!isCalcMode) return;
    currentInput = currentInput.slice(0, -1);
    display.value = currentInput;
}

function toggleHistory() {
    historyContainer.classList.toggle('show');
}

function updateHistory() {
    historyContainer.innerHTML = '<h3>Historia</h3>';
    history.slice().reverse().forEach(entry => {
        const item = document.createElement('div');
        item.textContent = entry;
        item.style.cursor = 'pointer';
        item.onclick = () => {
            const expr = entry.split('=')[0].trim();
            currentInput = expr;
            display.value = currentInput;
        };
        historyContainer.appendChild(item);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function toggleMode() {
    isCalcMode = !isCalcMode;
    document.getElementById('calcMode').style.display = isCalcMode ? 'block' : 'none';
    document.getElementById('unitMode').style.display = isCalcMode ? 'none' : 'block';
    document.querySelector('.mode-toggle').textContent = isCalcMode ? 'Przełącz na konwersję jednostek' : 'Przełącz na kalkulator';
    clearDisplay();
    if (!isCalcMode) updateUnitOptions();
}

const unitOptions = {
    length: [
        { name: 'Metry', value: 'm', factor: 1 },
        { name: 'Centymetry', value: 'cm', factor: 100 }, // 1 m = 100 cm
        { name: 'Milimetry', value: 'mm', factor: 1000 }, // 1 m = 1000 mm
        { name: 'Kilometry', value: 'km', factor: 0.001 }, // 1 m = 0.001 km
        { name: 'Cale', value: 'in', factor: 39.3701 }, // 1 m = 39.3701 in
        { name: 'Stopy', value: 'ft', factor: 3.28084 }, // 1 m = 3.28084 ft
        { name: 'Jardy', value: 'yd', factor: 1.09361 }, // 1 m = 1.09361 yd
        { name: 'Mile', value: 'mi', factor: 0.000621371 } // 1 m = 0.000621371 mi
    ],
    mass: [
        { name: 'Kilogramy', value: 'kg', factor: 1 },
        { name: 'Gramy', value: 'g', factor: 1000 }, // 1 kg = 1000 g
        { name: 'Tony', value: 't', factor: 0.001 }, // 1 kg = 0.001 t
        { name: 'Funty', value: 'lb', factor: 2.20462 }, // 1 kg = 2.20462 lb
        { name: 'Uncje', value: 'oz', factor: 35.274 } // 1 kg = 35.274 oz
    ],
    temperature: [
        { name: 'Celsius', value: 'C' },
        { name: 'Fahrenheit', value: 'F' },
        { name: 'Kelvin', value: 'K' },
        { name: 'Rankine', value: 'R' }
    ],
    volume: [
        { name: 'Litry', value: 'L', factor: 1 },
        { name: 'Mililitry', value: 'mL', factor: 1000 }, // 1 L = 1000 mL
        { name: 'Metry sześcienne', value: 'm3', factor: 0.001 }, // 1 L = 0.001 m³
        { name: 'Galony', value: 'gal', factor: 0.264172 }, // 1 L = 0.264172 gal
        { name: 'Pinty', value: 'pt', factor: 2.11338 } // 1 L = 2.11338 pt
    ]
};

function updateUnitOptions() {
    const type = document.getElementById('conversionType').value;
    const unitFrom = document.getElementById('unitFrom');
    const unitTo = document.getElementById('unitTo');
    unitFrom.innerHTML = '';
    unitTo.innerHTML = '';
    
    unitOptions[type].forEach(unit => {
        const optionFrom = document.createElement('option');
        const optionTo = document.createElement('option');
        optionFrom.value = unit.value;
        optionTo.value = unit.value;
        optionFrom.textContent = unit.name;
        optionTo.textContent = unit.name;
        unitFrom.appendChild(optionFrom);
        unitTo.appendChild(optionTo);
    });
}

function convertUnits() {
    const type = document.getElementById('conversionType').value;
    const value = parseFloat(document.getElementById('unitInput').value);
    const unitFrom = document.getElementById('unitFrom').value;
    const unitTo = document.getElementById('unitTo').value;

    if (isNaN(value)) {
        alert('Proszę wprowadzić poprawną wartość');
        return;
    }

    let result;
    if (type === 'temperature') {
        result = convertTemperature(value, unitFrom, unitTo);
    } else {
        const fromUnit = unitOptions[type].find(u => u.value === unitFrom);
        const toUnit = unitOptions[type].find(u => u.value === unitTo);
        result = (value / fromUnit.factor) * toUnit.factor;
    }

    display.value = `${value} ${unitFrom} = ${result.toFixed(4)} ${unitTo}`;
    history.push(display.value);
    updateHistory();
}

function convertTemperature(value, from, to) {
    if (from === to) return value;
    
    let celsius;
    if (from === 'C') celsius = value;
    else if (from === 'F') celsius = (value - 32) * 5 / 9;
    else if (from === 'K') celsius = value - 273.15;
    else if (from === 'R') celsius = (value - 491.67) * 5 / 9;

    if (to === 'C') return celsius;
    else if (to === 'F') return celsius * 9 / 5 + 32;
    else if (to === 'K') return celsius + 273.15;
    else if (to === 'R') return (celsius + 273.15) * 9 / 5;
}

document.addEventListener('keydown', function(e) {
    if (isCalcMode) {
        const key = e.key;
        if (!isNaN(key) || ['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
            appendValue(key);
        } else if (key === 'Enter') {
            calculateResult();
        } else if (key === 'Backspace') {
            deleteLastChar();
        } else if (key.toLowerCase() === 'c' || key === 'Escape') {
            clearDisplay();
        }
    }
});

if (!isCalcMode) updateUnitOptions();