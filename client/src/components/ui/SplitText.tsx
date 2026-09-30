import React from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  startDelay?: number;
  charDelay?: number;
  highlightWords?: Record<string, string>;
  animationKey?: number | string;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  charClassName = '',
  startDelay = 0.05,
  charDelay = 0.022,
  highlightWords = {},
  animationKey = 0,
}) => {
  const words = text.split(' ');
  let runningCharIndex = 0;

  return (
    <span
      key={animationKey}
      className={`inline-block ${className}`}
      aria-label={text}
      role="text"
    >
      {words.map((word, wordIdx) => {
        const customColor = highlightWords[word] || '';
        const wordChars = word.split('');
        const startIndex = runningCharIndex;
        runningCharIndex += wordChars.length;

        return (
          <span
            key={`${wordIdx}-${word}`}
            className="inline-block whitespace-nowrap overflow-hidden align-bottom mr-[0.26em] last:mr-0"
          >
            {wordChars.map((char, cIdx) => {
              const delay = startDelay + (startIndex + cIdx) * charDelay;
              return (
                <span
                  key={cIdx}
                  className={`inline-block animate-split-char ${customColor} ${charClassName}`}
                  style={{
                    animationDelay: `${delay.toFixed(3)}s`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
};

interface SplitWordsProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  startDelay?: number;
  wordDelay?: number;
  animationKey?: number | string;
}

export const SplitWords: React.FC<SplitWordsProps> = ({
  text,
  className = '',
  startDelay = 0.35,
  wordDelay = 0.025,
  animationKey = 0,
}) => {
  if (!text) return null;
  const words = text.split(' ');

  return (
    <span
      key={animationKey}
      className={`inline-block ${className}`}
      aria-label={text}
      role="text"
    >
      {words.map((word, i) => {
        const delay = startDelay + i * wordDelay;
        return (
          <span
            key={`${i}-${word}`}
            className="inline-block whitespace-nowrap overflow-hidden align-bottom mr-[0.28em] last:mr-0"
          >
            <span
              className="inline-block animate-split-word"
              style={{
                animationDelay: `${delay.toFixed(3)}s`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
};

export default SplitText;
