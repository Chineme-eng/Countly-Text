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

const quickWordsEl = document.getElementById("quickWords");
const quickReadingEl = document.getElementById("quickReading");
const quickGradeEl = document.getElementById("quickGrade");

const feedbackLineEl = document.getElementById("feedbackLine");
const analysisPreviewEl = document.getElementById("analysisPreview");
const gradeExplanationEl = document.getElementById("gradeExplanation");

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

function getGradeExplanation(grade) {
  if (grade <= 0) return "Add text to see a reading-level explanation.";
  if (grade < 5) return "Easily understood by elementary-level readers.";
  if (grade < 8) return "Comfortable for middle school readers.";
  if (grade < 12) return "Best suited for high school readers.";
  if (grade < 16) return "More appropriate for college-level readers.";
  return "This reads at an advanced academic level.";
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

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pulseElements(elements) {
  elements.forEach((el) => {
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  });
}

function buildFeedback({ words, repeatedWords, avgSentenceLength, readingGrade, longestSentenceWords }) {
  if (words.length === 0) {
    return "Your writing insights will appear here.";
  }

  const messages = [];

  if (repeatedWords.length > 0) {
    messages.push(`You repeat “${repeatedWords[0][0]}” quite often.`);
  } else {
    messages.push("Your word variety looks solid.");
  }

  if (avgSentenceLength > 24) {
    messages.push("Your sentences are running long.");
  } else if (avgSentenceLength > 16) {
    messages.push("Your sentence length is moderate.");
  } else {
    messages.push("Your sentences are easy to scan.");
  }

  if (readingGrade >= 12) {
    messages.push("This reads on the heavier side.");
  } else if (readingGrade >= 8) {
    messages.push("This feels fairly balanced.");
  } else if (readingGrade > 0) {
    messages.push("This is easy to read.");
  }

  if (longestSentenceWords >= 30) {
    messages.push("At least one sentence may need splitting.");
  }

  return messages.join(" ");
}

function buildAnalysisPreview(text, repeatedWordsSet) {
  if (!text.trim()) {
    return "Start typing to see highlighted analysis.";
  }

  const sentenceRegex = /[^.!?\n]+[.!?]?/g;
  const sentences = text.match(sentenceRegex) || [text];

  const highlightedSentences = sentences.map((sentence) => {
    const sentenceWords = sentence.match(/\b[\w'-]+\b/g) || [];
    const isLongSentence = sentenceWords.length > 24;

    let safeSentence = escapeHtml(sentence);

    safeSentence = safeSentence.replace(/\b[\w'-]+\b/g, (match) => {
      const lower = match.toLowerCase();
      if (repeatedWordsSet.has(lower)) {
        return `<span class="highlight-repeat">${match}</span>`;
      }
      return match;
    });

    if (isLongSentence && sentence.trim()) {
      safeSentence = `<span class="highlight-long">${safeSentence}</span>`;
    }

    return safeSentence;
  });

  return highlightedSentences.join("");
}

function updateGradeTone(readingGrade) {
  gradeExplanationEl.classList.remove("grade-good", "grade-mid", "grade-hard");

  if (readingGrade <= 0) return;
  if (readingGrade < 8) {
    gradeExplanationEl.classList.add("grade-good");
  } else if (readingGrade < 12) {
    gradeExplanationEl.classList.add("grade-mid");
  } else {
    gradeExplanationEl.classList.add("grade-hard");
  }
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
  const avgSentenceLengthNum = sentences.length ? (words.length / sentences.length) : 0;
  const avgSentenceLength = avgSentenceLengthNum ? avgSentenceLengthNum.toFixed(1) : "0";
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
  const repeatedWordsSet = new Set(repeatedWords.map(([word]) => word));

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

  quickWordsEl.textContent = words.length;
  quickReadingEl.textContent = formatTime(readingMinutes);
  quickGradeEl.textContent = gradeDisplay;

  gradeExplanationEl.textContent = getGradeExplanation(readingGrade);
  updateGradeTone(readingGrade);

  feedbackLineEl.textContent = buildFeedback({
    words,
    repeatedWords,
    avgSentenceLength: avgSentenceLengthNum,
    readingGrade,
    longestSentenceWords
  });

  analysisPreviewEl.innerHTML = buildAnalysisPreview(text, repeatedWordsSet);

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

  pulseElements([
    wordCountEl,
    readingGradeEl,
    difficultyLevelEl,
    heroWordsEl,
    heroGradeEl,
    quickWordsEl,
    quickGradeEl
  ]);
}

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  updateStats();
  textInput.focus();
});

sampleBtn.addEventListener("click", () => {
  textInput.value = `Clear writing matters because it helps people understand ideas faster. Writers, students, founders, and creators all benefit from tools that reveal how long a piece takes to read, how difficult it feels, and which words appear too often. A good counter should feel simple, elegant, and genuinely useful. Good tools help people write with more confidence, and good tools often become part of a daily routine.`;
  updateStats();
});

textInput.addEventListener("input", updateStats);
updateStats();
