// Deklaracja zmiennych globalnych
const currentInput = { value: '' }; // Obiekt do przechowywania wprowadzonego wyrażenia
const display = document.getElementById('display');
const historyContainer = document.getElementById('history');
const history = []; // Tablica przechowująca historię obliczeń
const isCalcMode = { value: true }; // Flaga trybu (kalkulator/konwerter)
const math = window.math; // Biblioteka math.js
const toggleModeButton = document.getElementById('toggleModeButton');

// Funkcja obliczająca silnię
function factorial(n) {
    if (!Number.isInteger(n) || n < 0) throw new Error('Silnia wymaga nieujemnej liczby całkowitej');
    return n === 0 || n === 1 ? 1 : n * factorial(n - 1);
}

// Balansowanie nawiasów w wyrażeniu
function balanceParentheses(expr) {
    let openParens = 0;
    for (const char of expr) {
        openParens += char === '(' ? 1 : char === ')' ? -1 : 0;
    }
    return expr + ')'.repeat(Math.max(0, openParens));
}

// Parsowanie wyrażenia matematycznego
function parseExpression(expr) {
    return balanceParentheses(
        expr.replace('^', '**')
            .replace(/(\d+)%/g, '($1/100)')
            .replace(/(\d+)!/g, 'factorial($1)')
    );
}

// Dodawanie wartości do wyrażenia
function appendValue(value) {
    if (!isCalcMode.value) return;
    currentInput.value += value;
    display.value = currentInput.value;
}

// Obliczanie wyniku wyrażenia
function calculateResult() {
    if (!isCalcMode.value) return;
    try {
        const expression = parseExpression(currentInput.value);
        const result = math.evaluate(expression, { factorial });
        const equation = `${currentInput.value} = ${result}`;
        history.push(equation);
        updateHistory();
        display.value = result;
        currentInput.value = result.toString();
    } catch (e) {
        display.value = `Błąd: ${e.message}`;
        setTimeout(() => {
            if (display.value.startsWith('Błąd')) display.value = currentInput.value;
        }, 2000);
    }
}

// Czyszczenie wyświetlacza
function clearDisplay() {
    currentInput.value = '';
    display.value = '';
}

// Usuwanie ostatniego znaku
function deleteLastChar() {
    if (!isCalcMode.value) return;
    currentInput.value = currentInput.value.slice(0, -1);
    display.value = currentInput.value;
}

// Przełączanie widoczności historii
function toggleHistory() {
    historyContainer.classList.toggle('show');
}

// Aktualizacja widoku historii
function updateHistory() {
    historyContainer.innerHTML = '<h3>Historia</h3>';
    history.slice().reverse().forEach(entry => {
        const item = document.createElement('div');
        item.textContent = entry;
        item.style.cursor = 'pointer';
        item.onclick = () => {
            const expr = entry.split('=')[0].trim();
            currentInput.value = expr;
            display.value = expr;
        };
        historyContainer.appendChild(item);
    });
}

// Ustawianie motywu kolorystycznego
function setTheme(theme) {
    document.body.className = `${theme}-mode`;
    document.getElementById('themeSelect').value = theme;
}

// Przełączanie trybu (kalkulator/konwerter)
function toggleMode() {
    isCalcMode.value = !isCalcMode.value;
    document.getElementById('calcMode').style.display = isCalcMode.value ? 'block' : 'none';
    document.getElementById('unitMode').style.display = isCalcMode.value ? 'none' : 'block';
    toggleModeButton.innerHTML = `<span>🔄</span> ${isCalcMode.value ? 'Konwerter' : 'Kalkulator'}`;
    toggleModeButton.title = isCalcMode.value ? 'Przełącz na konwerter jednostek' : 'Przełącz na kalkulator';
    clearDisplay();
    if (!isCalcMode.value) updateUnitOptions();
}

// Pokazywanie modala z instrukcją
function showInstructions() {
    document.getElementById('instructionsModal').style.display = 'block';
}

// Pokazywanie modala z notatkami
function showNotesModal() {
    document.getElementById('notesModal').style.display = 'block';
    loadNotes();
}

// Zapisywanie notatki
function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();
    if (noteText) {
        const notes = JSON.parse(localStorage.getItem('calculatorNotes') || '[]');
        notes.push({ text: noteText, timestamp: new Date().toLocaleString('pl-PL') });
        localStorage.setItem('calculatorNotes', JSON.stringify(notes));
        noteInput.value = '';
        loadNotes();
    }
}

// Wczytywanie notatek
function loadNotes() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '<h3>Zapisane notatki</h3>';
    const notes = JSON.parse(localStorage.getItem('calculatorNotes') || '[]');
    notes.slice().reverse().forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        noteDiv.innerHTML = `
            <p>${note.text}</p>
            <small>${note.timestamp}</small>
            <button onclick="deleteNote(${notes.length - 1 - index})" style="margin-left: 10px;">Usuń</button>
        `;
        notesList.appendChild(noteDiv);
    });
}

// Usuwanie notatki
function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('calculatorNotes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('calculatorNotes', JSON.stringify(notes));
    loadNotes();
}

// Definicja jednostek do konwersji
const unitOptions = {
    length: [
        { name: 'Metry', value: 'm', factor: 1 },
        { name: 'Centymetry', value: 'cm', factor: 100 },
        { name: 'Milimetry', value: 'mm', factor: 1000 },
        { name: 'Kilometry', value: 'km', factor: 0.001 },
        { name: 'Cale', value: 'in', factor: 39.3701 },
        { name: 'Stopy', value: 'ft', factor: 3.28084 },
        { name: 'Jardy', value: 'yd', factor: 1.09361 },
        { name: 'Mile', value: 'mi', factor: 0.000621371 }
    ],
    mass: [
        { name: 'Kilogramy', value: 'kg', factor: 1 },
        { name: 'Gramy', value: 'g', factor: 1000 },
        { name: 'Tony', value: 't', factor: 0.001 },
        { name: 'Funty', value: 'lb', factor: 2.20462 },
        { name: 'Uncje', value: 'oz', factor: 35.274 }
    ],
    temperature: [
        { name: 'Celsius', value: 'C' },
        { name: 'Fahrenheit', value: 'F' },
        { name: 'Kelvin', value: 'K' },
        { name: 'Rankine', value: 'R' }
    ],
    volume: [
        { name: 'Litry', value: 'L', factor: 1 },
        { name: 'Mililitry', value: 'mL', factor: 1000 },
        { name: 'Metry sześcienne', value: 'm3', factor: 0.001 },
        { name: 'Galony', value: 'gal', factor: 0.264172 },
        { name: 'Pinty', value: 'pt', factor: 2.11338 }
    ]
};

// Aktualizacja opcji jednostek w konwerterze
function updateUnitOptions() {
    const type = document.getElementById('conversionType').value;
    const unitFrom = document.getElementById('unitFrom');
    const unitTo = document.getElementById('unitTo');
    unitFrom.innerHTML = '';
    unitTo.innerHTML = '';
    unitOptions[type].forEach(unit => {
        const optionFrom = new Option(unit.name, unit.value);
        const optionTo = new Option(unit.name, unit.value);
        unitFrom.appendChild(optionFrom);
        unitTo.appendChild(optionTo);
    });
}

// Konwersja jednostek
function convertUnits() {
    const type = document.getElementById('conversionType').value;
    const value = parseFloat(document.getElementById('unitInput').value);
    const unitFrom = document.getElementById('unitFrom').value;
    const unitTo = document.getElementById('unitTo').value;

    if (isNaN(value)) {
        display.value = 'Proszę wprowadzić poprawną wartość';
        setTimeout(() => {
            if (display.value.startsWith('Proszę')) display.value = '';
        }, 2000);
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

// Konwersja temperatury
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

// Funkcja przeciągania elementów
function makeDraggable(element) {
    const handle = element.querySelector('.drag-handle');
    const position = { isDragging: false, currentX: 0, currentY: 0, initialX: 0, initialY: 0 };

    const startDragging = e => {
        position.isDragging = true;
        element.classList.add('dragging');
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        position.initialX = clientX - position.currentX;
        position.initialY = clientY - position.currentY;
    };

    const drag = e => {
        if (!position.isDragging) return;
        e.preventDefault();
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        let newX = clientX - position.initialX;
        let newY = clientY - position.initialY;

        const rect = element.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));

        position.currentX = newX;
        position.currentY = newY;

        requestAnimationFrame(() => {
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        });
    };

    const stopDragging = () => {
        position.isDragging = false;
        element.classList.remove('dragging');
        savePosition(element.id, position.currentX, position.currentY);
    };

    handle.addEventListener('mousedown', startDragging);
    handle.addEventListener('touchstart', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);

    const pos = loadPosition(element.id);
    position.currentX = pos.left;
    position.currentY = pos.top;
    element.style.left = `${pos.left}px`;
    element.style.top = `${pos.top}px`;
}

// Zapisywanie pozycji elementu
function savePosition(id, left, top) {
    localStorage.setItem(`position_${id}`, JSON.stringify({ left, top }));
}

// Wczytywanie pozycji elementu
function loadPosition(id) {
    const defaultPositions = {
        calculator: { left: 50, top: 50 },
        sidebar: { left: 450, top: 50 }
    };
    return JSON.parse(localStorage.getItem(`position_${id}`)) || defaultPositions[id];
}

// Obsługa klawiatury
document.addEventListener('keydown', e => {
    if (!isCalcMode.value) return;
    const key = e.key;
    if (/[\d+\-*/.()]/.test(key)) appendValue(key);
    else if (key === 'Enter') calculateResult();
    else if (key === 'Backspace') deleteLastChar();
    else if (key.toLowerCase() === 'c' || key === 'Escape') clearDisplay();
});

// Inicjalizacja przeciągania
document.querySelectorAll('.draggable').forEach(makeDraggable);

// Inicjalizacja konwertera jednostek
if (!isCalcMode.value) updateUnitOptions();
