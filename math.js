// Math Game Logic for Snake Game
class MathGame {
    constructor(game) {
        this.game = game;
        this.mathMode = 'none';
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.wrongAnswers = [];
        this.mathProblems = {
            plus: [],
            minus: [],
            multiply: []
        };
        this.gradualLevel = 0; // 0=plus, 1=minus, 2=multiply, 3=mixed
        this.portalCount = 0; // Track portals for gradual mode
        
        // Load math problems from files
        this.loadMathProblems();
        
        // Get DOM elements
        this.mathQuestionElement = document.getElementById('mathQuestion');
        this.mathQuestionTextElement = document.getElementById('mathQuestionText');
    }
    
    loadMathProblems() {
        // Load plus problems
        fetch('math/plus.txt')
            .then(response => response.text())
            .then(data => {
                this.mathProblems.plus = this.parseMathProblems(data);
                this.ensurePlusHasThreeDigitMix();
            })
            .catch(error => {
                console.warn('Could not load plus.txt:', error);
                this.mathProblems.plus = this.generateDefaultProblems('plus');
            });
        
        // Load minus problems
        fetch('math/minus.txt')
            .then(response => response.text())
            .then(data => {
                this.mathProblems.minus = this.parseMathProblems(data);
            })
            .catch(error => {
                console.warn('Could not load minus.txt:', error);
                this.mathProblems.minus = this.generateDefaultProblems('minus');
            });
        
        // Load multiply problems
        fetch('math/mal.txt')
            .then(response => response.text())
            .then(data => {
                this.mathProblems.multiply = this.parseMathProblems(data);
            })
            .catch(error => {
                console.warn('Could not load mal.txt:', error);
                this.mathProblems.multiply = this.generateDefaultProblems('multiply');
            });
    }

    // Ensure PLUS mode includes some three-digit sums (100-999)
    ensurePlusHasThreeDigitMix() {
        const plus = this.mathProblems.plus || [];
        const hasThreeDigit = plus.some(p => (p?.answer ?? 0) >= 100);
        if (!hasThreeDigit) {
            const extras = this.generatePlusThreeDigitProblems(20);
            this.mathProblems.plus = plus.concat(extras);
        }
    }

    generatePlusThreeDigitProblems(count = 20) {
        const extras = [];
        for (let i = 0; i < count; i++) {
            let num1, num2, sum;
            do {
                num1 = Math.floor(Math.random() * 990) + 10; // 10..999
                num2 = Math.floor(Math.random() * 990) + 10; // 10..999
                sum = num1 + num2;
            } while (sum < 100 || sum > 999);
            extras.push({
                num1,
                operator: '+',
                num2,
                answer: sum,
                question: `${num1} + ${num2} = ?`
            });
        }
        return extras;
    }
    
    parseMathProblems(data) {
        const lines = data.split('\n').filter(line => line.trim());
        const problems = [];
        
        for (const line of lines) {
            // Parse format like "75 + 91 = 166" or "88 - 27 = 61" or "1 * 1 = 01"
            const match = line.match(/^(\d+)\s*([+\-*])\s*(\d+)\s*=\s*(\d+)$/);
            if (match) {
                const [, num1, operator, num2, answer] = match;
                problems.push({
                    num1: parseInt(num1),
                    operator: operator,
                    num2: parseInt(num2),
                    answer: parseInt(answer),
                    question: `${num1} ${operator} ${num2} = ?`
                });
            }
        }
        
        return problems;
    }
    
    generateDefaultProblems(type) {
        const problems = [];
        
        if (type === 'plus') {
            // Mix of small and three-digit sums
            for (let i = 0; i < 20; i++) {
                let num1, num2, sum;
                if (i < 10) {
                    // smaller sums
                    num1 = Math.floor(Math.random() * 50) + 1;
                    num2 = Math.floor(Math.random() * 50) + 1;
                    sum = num1 + num2;
                } else {
                    // force sum within 100..999
                    do {
                        num1 = Math.floor(Math.random() * 990) + 10; // 10..999
                        num2 = Math.floor(Math.random() * 990) + 10; // 10..999
                        sum = num1 + num2;
                    } while (sum < 100 || sum > 999);
                }
                problems.push({
                    num1,
                    operator: '+',
                    num2,
                    answer: sum,
                    question: `${num1} + ${num2} = ?`
                });
            }
        } else if (type === 'minus') {
            for (let i = 0; i < 20; i++) {
                const num1 = Math.floor(Math.random() * 50) + 50;
                const num2 = Math.floor(Math.random() * 50) + 1;
                problems.push({
                    num1: num1,
                    operator: '-',
                    num2: num2,
                    answer: num1 - num2,
                    question: `${num1} - ${num2} = ?`
                });
            }
        } else if (type === 'multiply') {
            for (let i = 0; i < 20; i++) {
                const num1 = Math.floor(Math.random() * 9) + 1;
                const num2 = Math.floor(Math.random() * 9) + 1;
                problems.push({
                    num1: num1,
                    operator: '*',
                    num2: num2,
                    answer: num1 * num2,
                    question: `${num1} × ${num2} = ?`
                });
            }
        }
        
        return problems;
    }
    
    setMathMode(mode) {
        this.mathMode = mode;
        this.gradualLevel = 0;
        this.portalCount = 0;
        
        if (mode === 'none') {
            this.hideMathQuestion();
        } else {
            this.showMathQuestion();
            this.generateNewQuestion();
        }
    }
    
    showMathQuestion() {
        if (this.mathQuestionElement) {
            this.mathQuestionElement.style.display = 'block';
        }
    }
    
    hideMathQuestion() {
        if (this.mathQuestionElement) {
            this.mathQuestionElement.style.display = 'none';
        }
    }
    
    generateNewQuestion() {
        if (this.mathMode === 'none') return;
        
        let problems = [];
        let currentType = '';
        
        // Determine which problems to use based on mode
        if (this.mathMode === 'plus' || this.mathMode === 'plus2' || this.mathMode === 'plus3') {
            problems = this.mathProblems.plus;
            currentType = 'plus';
        } else if (this.mathMode === 'minus') {
            problems = this.mathProblems.minus;
            currentType = 'minus';
        } else if (this.mathMode === 'multiply') {
            problems = this.mathProblems.multiply;
            currentType = 'multiply';
        } else if (this.mathMode === 'mixed') {
            // Mix all types
            problems = [...this.mathProblems.plus, ...this.mathProblems.minus, ...this.mathProblems.multiply];
            currentType = 'mixed';
        } else if (this.mathMode === 'gradual') {
            // Gradual progression: plus -> minus -> multiply -> mixed
            if (this.gradualLevel === 0) {
                problems = this.mathProblems.plus;
                currentType = 'plus';
            } else if (this.gradualLevel === 1) {
                problems = this.mathProblems.minus;
                currentType = 'minus';
            } else if (this.gradualLevel === 2) {
                problems = this.mathProblems.multiply;
                currentType = 'multiply';
            } else {
                problems = [...this.mathProblems.plus, ...this.mathProblems.minus, ...this.mathProblems.multiply];
                currentType = 'mixed';
            }
        }
        
        if (problems.length === 0) {
            console.warn('No math problems available for type:', currentType);
            return;
        }
        
        // Select random problem with sum-size filters for plus2/plus3
        if (this.mathMode === 'plus2' || this.mathMode === 'plus3') {
            const wantThree = (this.mathMode === 'plus3');
            const filtered = problems.filter(p => p.operator==='+' && (wantThree ? (p.answer>=100 && p.answer<=999) : (p.answer>=10 && p.answer<=99)));
            const pool = filtered.length ? filtered : problems;
            const idx = Math.floor(Math.random() * pool.length);
            this.currentQuestion = pool[idx];
        } else {
            const randomIndex = Math.floor(Math.random() * problems.length);
            this.currentQuestion = problems[randomIndex];
        }
        this.currentAnswer = this.currentQuestion.answer;
        
        
        // Display question
        if (this.mathQuestionTextElement) {
            this.mathQuestionTextElement.textContent = this.currentQuestion.question;
        }
        
        // Generate wrong answers
        this.generateWrongAnswers();
    }
    
    generateWrongAnswers() {
        this.wrongAnswers = [];
        const correctAnswer = this.currentAnswer;
        
        // Always generate 4 wrong answers to make 5 bubbles total
        const wrongCount = 4;
        
        for (let i = 0; i < wrongCount; i++) {
            let wrongAnswer;
            do {
                // Generate wrong answer within reasonable range
                const variation = Math.floor(Math.random() * 20) + 1; // 1-20 variation
                const isPositive = Math.random() < 0.5;
                wrongAnswer = isPositive ? correctAnswer + variation : correctAnswer - variation;
                
                // Ensure it's positive and different from correct answer
                if (wrongAnswer <= 0) wrongAnswer = correctAnswer + variation;
            } while (wrongAnswer === correctAnswer || this.wrongAnswers.includes(wrongAnswer));
            
            this.wrongAnswers.push(wrongAnswer);
        }
    }
    
    getNumbersForFood() {
        if (this.mathMode === 'none') return [];
        
        const desiredCount = 5; // Always show 5 bubbles
        const numbers = [this.currentAnswer, ...this.wrongAnswers];

        // Hard guarantee: ensure the correct answer is present
        if (!numbers.includes(this.currentAnswer)) {
            numbers.push(this.currentAnswer);
        }

        // Top-up with unique wrong answers until we reach desiredCount
        while (numbers.length < desiredCount) {
            let wrongAnswer;
            do {
                const variation = Math.floor(Math.random() * 20) + 1;
                const isPositive = Math.random() < 0.5;
                wrongAnswer = isPositive ? this.currentAnswer + variation : this.currentAnswer - variation;
                if (wrongAnswer <= 0) wrongAnswer = this.currentAnswer + variation;
            } while (numbers.includes(wrongAnswer));
            numbers.push(wrongAnswer);
        }
        
        // Shuffle the numbers
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        return numbers;
    }
    
    updateAllNumbers(existingFoods) {
        if (this.mathMode === 'none') return;
        
        // Count existing math number foods
        const mathFoods = existingFoods.filter(food => food.type.isMathNumber);
        const numMathFoods = mathFoods.length;
        
        
        if (numMathFoods === 0) return;
        
        // Create new numbers array with correct answer + wrong answers
        const newNumbers = [this.currentAnswer, ...this.wrongAnswers];
        
        // If we need more numbers than we have, generate additional wrong answers
        while (newNumbers.length < numMathFoods) {
            let wrongAnswer;
            do {
                const variation = Math.floor(Math.random() * 20) + 1;
                const isPositive = Math.random() < 0.5;
                wrongAnswer = isPositive ? this.currentAnswer + variation : this.currentAnswer - variation;
                if (wrongAnswer <= 0) wrongAnswer = this.currentAnswer + variation;
            } while (newNumbers.includes(wrongAnswer));
            newNumbers.push(wrongAnswer);
        }

        // Hard guarantee: ensure the correct answer is present among the values
        if (!newNumbers.includes(this.currentAnswer)) {
            const replaceIndex = Math.floor(Math.random() * newNumbers.length);
            newNumbers[replaceIndex] = this.currentAnswer;
        }

        // Additional difficulty for plus3: ensure at least one 3-digit decoy shares
        // the same last digit as the correct 3-digit answer
        if (this.mathMode === 'plus3') {
            const answer = this.currentAnswer;
            const isThreeDigit = (answer >= 100 && answer <= 999);
            if (isThreeDigit) {
                const lastDigit = answer % 10;
                let hasDecoy = false;
                for (const n of newNumbers) {
                    if (n !== answer && n >= 100 && n <= 999 && (n % 10) === lastDigit) {
                        hasDecoy = true;
                        break;
                    }
                }
                if (!hasDecoy) {
                    // Replace one wrong entry with a 3-digit number ending with lastDigit
                    const wrongIdxs = [];
                    for (let i = 0; i < newNumbers.length; i++) {
                        if (newNumbers[i] !== answer) wrongIdxs.push(i);
                    }
                    if (wrongIdxs.length > 0) {
                        const replaceIndex = wrongIdxs[Math.floor(Math.random() * wrongIdxs.length)];
                        let candidate = null;
                        let attempts = 0;
                        do {
                            const hundreds = Math.floor(Math.random() * 9) + 1; // 1..9
                            const tens = Math.floor(Math.random() * 10); // 0..9
                            candidate = hundreds * 100 + tens * 10 + lastDigit;
                            attempts++;
                            if (attempts > 200) break;
                        } while (candidate === answer || newNumbers.includes(candidate));
                        if (candidate && candidate !== answer) {
                            newNumbers[replaceIndex] = candidate;
                        }
                    }
                }
            }
        }
        
        // Shuffle the numbers to randomize positions - this ensures correct answer can be anywhere
        for (let i = newNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newNumbers[i], newNumbers[j]] = [newNumbers[j], newNumbers[i]];
        }
        
        
        // Update existing math number foods with new numbers in random order
        let numberIndex = 0;
        for (let food of existingFoods) {
            if (food.type.isMathNumber && numberIndex < newNumbers.length) {
                food.type.emoji = newNumbers[numberIndex].toString();
                food.type.number = newNumbers[numberIndex];
                numberIndex++;
            }
        }
        
    }
    
    checkAnswer(number) {
        if (this.mathMode === 'none') return null;
        
        if (number === this.currentAnswer) {
            return 'correct';
        } else if (this.wrongAnswers.includes(number)) {
            return 'wrong';
        }
        
        return null;
    }
    
    onPortalEntered() {
        if (this.mathMode === 'gradual') {
            this.portalCount++;
            
            // Progress through levels: plus -> minus -> multiply -> mixed
            if (this.portalCount === 1) {
                this.gradualLevel = 1; // minus
            } else if (this.portalCount === 2) {
                this.gradualLevel = 2; // multiply
            } else if (this.portalCount >= 3) {
                this.gradualLevel = 3; // mixed
            }
            
            // Generate new question for the new level
            this.generateNewQuestion();
        }
    }
    
    // Method to be called when food is eaten
    onFoodEaten(number, isPlayer2 = false) {
        const result = this.checkAnswer(number);
        
        
        if (result === 'correct') {
            // Correct answer - snake grows and score increases
            return { grow: true, scoreChange: 1 };
        } else if (result === 'wrong') {
            // Wrong answer - snake shrinks and score decreases (but not below 0)
            return { grow: false, scoreChange: -1 };
        }
        
        return null; // Not a math number
    }
    
    // Method to get the current math mode
    getCurrentMode() {
        return this.mathMode;
    }
    
    // Method to check if math mode is active
    isMathModeActive() {
        return this.mathMode !== 'none';
    }
}
