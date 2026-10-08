import confetti from 'canvas-confetti';

export function fireConfetti(): void {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });
  } catch {
    // Canvas might not be available in headless test environments
  }
}
