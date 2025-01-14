let targetSite = new URLSearchParams(window.location.search).get('site');
let timeLeft = 30;
let currentChallenge = null;

function generateChallenge() {
  const challenges = [
    {
      type: 'math',
      generate: () => {
        const num1 = Math.floor(Math.random() * 100);
        const num2 = Math.floor(Math.random() * 100);
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        const expression = `${num1} ${operator} ${num2}`;
        let expectedAnswer;
        if (operator === '+') {
            expectedAnswer = num1 + num2;
        } else if (operator === '-') {
            expectedAnswer = num1 - num2;
        } else if (operator === '*') {
            expectedAnswer = num1 * num2;
        }
        return {
          type: 'math',
          question: `Giải bài toán: ${expression} = ?`,
          expectedAnswer: expectedAnswer
        };
      }
    },
    {
      type: 'typing',
      generate: () => {
        const texts = [
          "Tôi đang lãng phí thời gian của mình trên mạng xã hội",
          "Tôi nên tập trung làm việc thay vì lướt web",
          "Thời gian là vàng bạc, đừng lãng phí nó",
          "Suy nghĩ kỹ vào rồi ra quyết định",
          "Mục tiêu của mày là gì"
        ];
        const text = texts[Math.floor(Math.random() * texts.length)];
        return {
          type: 'typing',
          question: `Gõ chính xác đoạn văn sau: "${text}"`,
          text: text
        };
      }
    }
  ];

  const challengeType = challenges[Math.floor(Math.random() * challenges.length)];
  return challengeType.generate();
}

function startChallenge() {
  currentChallenge = generateChallenge();
  document.getElementById('challengeDesc').textContent = currentChallenge.question;
  
  const timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      timeLeft = 30;
      startChallenge();
    }
  }, 1000);
}

document.getElementById('submit').addEventListener('click', async () => {
  const answer = document.getElementById('answer').value;
  
  const response = await chrome.runtime.sendMessage({
    type: "VERIFY_CHALLENGE",
    challenge: currentChallenge,
    answer: answer
  });

  if (response.success) {
    window.location.href = targetSite;
  } else {
    alert('Câu trả lời không đúng. Vui lòng thử lại!');
    document.getElementById('answer').value = '';
    timeLeft = 30;
    startChallenge();
  }
});

startChallenge();