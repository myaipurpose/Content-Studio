export function calculateFleschKincaid(text: string): { score: number; label: string } {
  if (!text || text.trim().length === 0) return { score: 0, label: 'N/A' };

  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const syllables = text.split(/\s+/).filter(Boolean).reduce((count, word) => {
    word = word.toLowerCase();
    if (word.length <= 3) return count + 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return count + (matches ? matches.length : 1);
  }, 0);

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  
  let label = 'Very Easy';
  if (score < 30) label = 'Very Difficult';
  else if (score < 50) label = 'Difficult';
  else if (score < 60) label = 'Fairly Difficult';
  else if (score < 70) label = 'Plain English';
  else if (score < 80) label = 'Fairly Easy';
  else if (score < 90) label = 'Easy';

  return { score: Math.round(score), label };
}

export function analyzeSentiment(text: string): { score: number; label: string; emoji: string } {
  if (!text || text.trim().length === 0) return { score: 0, label: 'Neutral', emoji: '😐' };

  const positiveWords = ['good', 'great', 'awesome', 'excellent', 'happy', 'love', 'amazing', 'perfect', 'best', 'success', 'win', 'innovative', 'excited', 'thrilled', 'proud'];
  const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'hate', 'worst', 'fail', 'loss', 'poor', 'disappointing', 'frustrated', 'angry', 'boring', 'hard', 'difficult'];

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;

  words.forEach(word => {
    // Remove punctuation from word
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (positiveWords.includes(cleanWord)) score++;
    if (negativeWords.includes(cleanWord)) score--;
  });

  if (score > 1) return { score, label: 'Very Positive', emoji: '🤩' };
  if (score === 1) return { score, label: 'Positive', emoji: '😊' };
  if (score === -1) return { score, label: 'Negative', emoji: '😟' };
  if (score < -1) return { score, label: 'Very Negative', emoji: '😠' };
  
  return { score, label: 'Neutral', emoji: '😐' };
}
