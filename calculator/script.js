//declaring variables
const display = document.getElementById("display");
const buttonsContainer = document.getElementById("buttons");

//buttons array
const buttons = [
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "/", label: "/" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "*", label: "*" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "-", label: "-" },
  { value: "0", label: "0" },
  { value: "C", label: "C" },
  { value: ".", label: "." },
  { value: "+", label: "+" },
  { value: "=", label: "=" },
  { value: "backspace", label: "⌫" },
];

let hasError = false;

//creating buttons dynamically
buttons.forEach((item) => {
  const button = document.createElement("button");
  button.textContent = item.label;
  button.dataset.value = item.value;
  buttonsContainer.appendChild(button);
});

//function to calculate the expression

function calculateExpression(expression) {
  const tokens = [];
  let match;
  const tokenRegex = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|([+\-*/]))/gy;
  let position = 0;

  if (!expression.trim()) {
    return "";
  }
  // Use a simpler, reliable tokenizer.
  while (position < expression.length) {
    tokenRegex.lastIndex = position;
    match = tokenRegex.exec(expression);

    if (!match) {
      return "Error";
    }

    if (match[1] !== undefined) {
      tokens.push(Number(match[1]));
    } else {
      tokens.push(match[2]);
    }

    position = tokenRegex.lastIndex;
  }

  // Combine unary minus with the number that follows it.
  const normalized = [];

  for (let i = 0; i < tokens.length; i++) {
    if (
      tokens[i] === "-" &&
      (i === 0 || ["+", "-", "*", "/"].includes(tokens[i - 1]))
    ) {
      if (typeof tokens[i + 1] !== "number") {
        return "Error";
      }

      normalized.push(-tokens[i + 1]);
      i++;
    } else {
      normalized.push(tokens[i]);
    }
  }

  if (
    normalized.length % 2 === 0 ||
    normalized.some((item, index) =>
      index % 2 === 0
        ? typeof item !== "number" || !Number.isFinite(item)
        : !["+", "-", "*", "/"].includes(item),
    )
  ) {
    return "Error";
  }

  // Multiplication and division first.
  for (let i = 1; i < normalized.length; ) {
    if (normalized[i] === "*" || normalized[i] === "/") {
      const a = normalized[i - 1];
      const b = normalized[i + 1];

      if (normalized[i] === "/" && b === 0) {
        return "Error";
      }

      const result = normalized[i] === "*" ? a * b : a / b;

      normalized.splice(i - 1, 3, result);
      i = 1;
    } else {
      i += 2;
    }
  }

  // Addition and subtraction from left to right.
  let result = normalized[0];

  for (let i = 1; i < normalized.length; i += 2) {
    if (normalized[i] === "+") {
      result += normalized[i + 1];
    } else {
      result -= normalized[i + 1];
    }
  }

  return Number.isFinite(result) ? String(result) : "Error";
}

//interacting with buttons
buttonsContainer.addEventListener("click", (event) => {
  const clickedButton = event.target.closest("button");
  if (!clickedButton) return;
  const value = clickedButton.dataset.value;

  if (value === "C") {
    display.value = "";
    hasError = false;
  } else if (value === "backspace") {
    if (hasError) {
      display.value = "";
      hasError = false;
    } else {
      display.value = display.value.slice(0, -1);
    }
  } else if (value === "=") {
    display.value = calculateExpression(display.value);
    hasError = display.value === "Error";
  } else {
    const operators = ["+", "-", "*", "/"];
    const lastChar = display.value.slice(-1);

    if (hasError) {
      display.value = "";
      hasError = false;
    }
    if (operators.includes(value)) {
      if (operators.includes(lastChar)) {
        if (value === "-" && lastChar !== "-") {
          // Allow minus as a negative sign after another operator.
        } else {
          return;
        }
      }

      if (display.value === "" && value !== "-") {
        return;
      }
    }

    if (value === ".") {
      const parts = display.value.split(/([+\-*/])/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber.includes(".")) {
        return; // Prevent adding multiple decimal points in the current number
      }
    }
    display.value += value;
  }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.+\-*/]$/.test(key)) {
    event.preventDefault();

    // Reuse the same button logic.
    const button = buttonsContainer.querySelector(
      `button[data-value="${key}"]`,
    );

    if (button) {
      button.click();
    }
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();

    const equalsButton = buttonsContainer.querySelector(
      'button[data-value="="]',
    );

    if (equalsButton) {
      equalsButton.click();
    }
  } else if (key === "Backspace") {
    event.preventDefault();

    const backspaceButton = buttonsContainer.querySelector(
      'button[data-value="backspace"]',
    );

    if (backspaceButton) {
      backspaceButton.click();
    }
  } else if (key === "Escape") {
    event.preventDefault();

    const clearButton = buttonsContainer.querySelector(
      'button[data-value="C"]',
    );

    if (clearButton) {
      clearButton.click();
    }
  }
});
