export const serif = { fontFamily: "'Fraunces', serif" };

export const keyframeStyles = `
  @keyframes sh-breathe {
    0% { transform: scale(0.82); }
    33% { transform: scale(1.15); }
    66% { transform: scale(1.15); }
    100% { transform: scale(0.82); }
  }
  @keyframes sh-ring-pulse {
    0% { transform: scale(0.9); opacity: 0.25; }
    33% { transform: scale(1.3); opacity: 0.6; }
    66% { transform: scale(1.3); opacity: 0.6; }
    100% { transform: scale(0.9); opacity: 0.25; }
  }
  .sh-sun { animation: sh-breathe 12s ease-in-out infinite; }
  .sh-ring { animation: sh-ring-pulse 12s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .sh-sun, .sh-ring { animation: none !important; }
  }
`;