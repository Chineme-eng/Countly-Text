const textInput = document.getElementById("textInput");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");

const wordCountEl = document.getElementById("wordCount");
const charCountEl = document.getElementById("charCount");
const charNoSpacesEl = document.getElementById("charNoSpaces");
const sentenceCountEl = document.getElementById("sentenceCount");
const paragraphCountEl = document.getElementById("paragraphCount");
const readingTimeEl = document.getElementById("readingTime");
const speakingTimeEl = document.getElementById("speakingTime");
const pageCountEl = document.getElementById("pageCount");
const avgWordLengthEl = document.getElementById("avgWordLength");
const avgSentenceLengthEl = document.getElementById("avgSentenceLength");
const readingGradeEl = document.getElementById("readingGrade");
const difficultyLevelEl = document.getElementById("difficultyLevel");
const longestWordEl = document.getElementById("longestWord");
const longestSentenceEl = document.getElementById("longestSentence");

function formatTime(minutesDecimal) {
  const totalSeconds = Math.ceil(minutesDecimal * 60);

  if (totalSeconds <= 0) return "0 sec";
  if (totalSeconds < 60) return `${totalSeconds} sec`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  const withoutEnding = cleaned.replace(/(?:es|ed|e)$/, "");
  const matches = withoutEnding.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function getDifficultyLabel(grade) {
  if (grade < 5) return "Elementary";
  if (grade < 8) return "Middle School";
  if (grade < 12) return "High School";
  if (grade < 16) return "College";
  return "Advanced Academic";
}

function updateStats() {
  const text = textInput.value;
  const trimmedText = text.trim();

  const words = trimmedText ? trimmedText.match(/\b[\w'-]+\b/g) || [] : [];
  const sentences = trimmedText
    ? trimmedText.match(/[^.!?]+[.!?]*/g)?.filter(s => s.trim().length > 0) || []
    : [];
  const paragraphs = trimmedText
    ? trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    : [];

  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, "").length;
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length || (trimmedText ? 1 : 0);

  let longestWord = "—";
  let totalWordLength = 0;
  let totalSyllables = 0;

  for (const word of words) {
    totalWordLength += word.length;
    totalSyllables += countSyllables(word);

    if (longestWord === "—" || word.length > longestWord.length) {
      longestWord = word;
    }
  }

  let longestSentence = "—";
  let longestSentenceWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.match(/\b[\w'-]+\b/g) || [];
    if (sentenceWords.length > longestSentenceWordCount) {
      longestSentenceWordCount = sentenceWords.length;
      longestSentence = sentence.trim();
    }
  }

  const avgWordLength = words.length ? (totalWordLength / words.length).toFixed(1) : "0";
  const avgSentenceLength = sentenceCount ? (words.length / sentenceCount).toFixed(1) : "0";
  const readingMinutes = words.length / 200;
  const speakingMinutes = words.length / 130;
  const pages = words.length ? (words.length / 500).toFixed(1) : "0";

  let readingGrade = 0;
  if (words.length > 0 && sentenceCount > 0) {
    readingGrade =
      0.39 * (words.length / sentenceCount) +
      11.8 * (totalSyllables / words.length) -
      15.59;
  }

  const gradeRounded = readingGrade > 0 ? readingGrade.toFixed(1) : "0";
  const difficultyLabel = readingGrade > 0 ? getDifficultyLabel(readingGrade) : "—";

  wordCountEl.textContent = words.length;
  charCountEl.textContent = charCount;
  charNoSpacesEl.textContent = charNoSpaces;
  sentenceCountEl.textContent = sentenceCount;
  paragraphCountEl.textContent = paragraphCount;
  readingTimeEl.textContent = formatTime(readingMinutes);
  speakingTimeEl.textContent = formatTime(speakingMinutes);
  pageCountEl.textContent = pages;
  avgWordLengthEl.textContent = avgWordLength;
  avgSentenceLengthEl.textContent = avgSentenceLength;
  readingGradeEl.textContent = gradeRounded;
  difficultyLevelEl.textContent = difficultyLabel;
  longestWordEl.textContent = longestWord;
  longestSentenceEl.textContent = longestSentence;
}

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  updateStats();
  textInput.focus();
});

sampleBtn.addEventListener("click", () => {
  textInput.value = `Clear writing is one of the fastest ways to make ideas easier to understand. A strong word counter does more than count words. It helps writers measure readability, estimate timing, and understand how difficult their text may feel to different readers. When tools are clean, useful, and fast, people come back to them again and again.`;
  updateStats();
});

textInput.addEventListener("input", updateStats);

updateStats();
