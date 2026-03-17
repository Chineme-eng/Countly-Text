const textInput = document.getElementById("textInput");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");

const wordCountEl = document.getElementById("wordCount");
const charCountEl = document.getElementById("charCount");
const charNoSpacesEl = document.getElementById("charNoSpaces");
const sentenceCountEl = document.getElementById("sentenceCount");
const paragraphCountEl = document.getElementById("paragraphCount");
const pageCountEl = document.getElementById("pageCount");
const readingTimeEl = document.getElementById("readingTime");
const speakingTimeEl = document.getElementById("speakingTime");
const avgWordLengthEl = document.getElementById("avgWordLength");
const avgSentenceLengthEl = document.getElementById("avgSentenceLength");
const readingGradeEl = document.getElementById("readingGrade");
const difficultyLevelEl = document.getElementById("difficultyLevel");
const longestWordEl = document.getElementById("longestWord");
const longestSentenceWordsEl = document.getElementById("longestSentenceWords");
const repeatedWordsEl = document.getElementById("repeatedWords");

const heroWordsEl = document.getElementById("heroWords");
const heroReadingEl = document.getElementById("heroReading");
const heroGradeEl = document.getElementById("heroGrade");

function formatTime(minutesDecimal) {
  const totalSeconds = Math.ceil(minutesDecimal * 60);
  if (totalSeconds <= 0) return "0 sec";
  if (totalSeconds < 60) return `${totalSeconds} sec`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
}

function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  const simplified = cleaned.replace(/(?:es|ed|e)$/, "");
  const matches = simplified.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function getDifficultyLabel(grade) {
  if (grade < 5) return "Elementary";
  if (grade < 8) return "Middle School";
  if (grade < 12) return "High School";
  if (grade < 16) return "College";
  return "Advanced Academic";
}

function getRepeatedWords(words) {
  const ignore = new Set([
    "the", "a", "an", "and", "or", "but", "if", "then", "than", "so", "of",
    "to", "in", "on", "for", "at", "by", "with", "is", "it", "this", "that",
    "as", "are", "was", "were", "be", "from", "you", "your", "i"
  ]);

  const counts = {};
  for (const rawWord of words) {
    const word = rawWord.toLowerCase();
    if (word.length < 3 || ignore.has(word)) continue;
    counts[word] = (counts[word] || 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

function updateStats() {
  const text = textInput.value;
  const trimmed = text.trim();

  const words = trimmed ? trimmed.match(/\b[\w'-]+\b/g) || [] : [];
  const sentences = trimmed
    ? trimmed.match(/[^.!?]+[.!?]*/g)?.filter(s => s.trim().length > 0) || []
    : [];
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    : [];

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const pages = words.length ? (words.length / 500).toFixed(1) : "0";

  let totalWordLength = 0;
  let totalSyllables = 0;
  let longestWord = "—";
  let longestSentenceWords = 0;

  for (const word of words) {
    totalWordLength += word.length;
    totalSyllables += countSyllables(word);

    if (longestWord === "—" || word.length > longestWord.length) {
      longestWord = word;
    }
  }

  for (const sentence of sentences) {
    const sentenceWords = sentence.match(/\b[\w'-]+\b/g) || [];
    if (sentenceWords.length > longestSentenceWords) {
      longestSentenceWords = sentenceWords.length;
    }
  }

  const avgWordLength = words.length ? (totalWordLength / words.length).toFixed(1) : "0";
  const avgSentenceLength = sentences.length ? (words.length / sentences.length).toFixed(1) : "0";
  const readingMinutes = words.length / 200;
  const speakingMinutes = words.length / 130;

  let readingGrade = 0;
  if (words.length > 0 && sentences.length > 0) {
    readingGrade =
      0.39 * (words.length / sentences.length) +
      11.8 * (totalSyllables / words.length) -
      15.59;
  }

  const gradeDisplay = readingGrade > 0 ? readingGrade.toFixed(1) : "0";
  const difficulty = readingGrade > 0 ? getDifficultyLabel(readingGrade) : "—";
  const repeatedWords = getRepeatedWords(words);

  wordCountEl.textContent = words.length;
  charCountEl.textContent = characters;
  charNoSpacesEl.textContent = charactersNoSpaces;
  sentenceCountEl.textContent = sentences.length;
  paragraphCountEl.textContent = paragraphs.length || (trimmed ? 1 : 0);
  pageCountEl.textContent = pages;
  readingTimeEl.textContent = formatTime(readingMinutes);
  speakingTimeEl.textContent = formatTime(speakingMinutes);
  avgWordLengthEl.textContent = avgWordLength;
  avgSentenceLengthEl.textContent = avgSentenceLength;
  readingGradeEl.textContent = gradeDisplay;
  difficultyLevelEl.textContent = difficulty;
  longestWordEl.textContent = longestWord;
  longestSentenceWordsEl.textContent = `${longestSentenceWords} words`;

  heroWordsEl.textContent = words.length;
  heroReadingEl.textContent = formatTime(readingMinutes);
  heroGradeEl.textContent = gradeDisplay;

  repeatedWordsEl.innerHTML = "";
  if (repeatedWords.length === 0) {
    repeatedWordsEl.innerHTML = `<span class="chip muted">None yet</span>`;
  } else {
    repeatedWords.forEach(([word, count]) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = `${word} ×${count}`;
      repeatedWordsEl.appendChild(chip);
    });
  }
}

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  updateStats();
  textInput.focus();
});

sampleBtn.addEventListener("click", () => {
  textInput.value = `Clear writing matters because it helps people understand ideas faster. Writers, students, founders, and creators all benefit from tools that reveal how long a piece takes to read, how difficult it feels, and which words appear too often. A good counter should feel simple, elegant, and genuinely useful.`;
  updateStats();
});

textInput.addEventListener("input", updateStats);
updateStats();
