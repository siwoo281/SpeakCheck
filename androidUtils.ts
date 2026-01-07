// Android 전용 유틸리티 함수들

/**
 * Android 진동 피드백 (Vibration API)
 * @param pattern - 진동 패턴 (밀리초)
 */
export const vibrate = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * 터치 피드백 (짧은 진동)
 */
export const touchFeedback = () => {
  vibrate(10);
};

/**
 * 성공 피드백 (이중 진동)
 */
export const successFeedback = () => {
  vibrate([10, 50, 10]);
};

/**
 * 경고 피드백 (긴 진동)
 */
export const warningFeedback = () => {
  vibrate(50);
};

/**
 * Android 여부 감지
 */
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Android Chrome PWA 여부 감지
 */
export const isAndroidPWA = (): boolean => {
  return isAndroid() && window.matchMedia('(display-mode: standalone)').matches;
};

/**
 * PWA 설치 가능 여부 체크 및 프롬프트 표시
 */
export const setupPWAInstallPrompt = (
  onInstallable: (prompt: BeforeInstallPromptEvent) => void
) => {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    onInstallable(deferredPrompt);
  });

  return deferredPrompt;
};

/**
 * PWA 설치 프롬프트 표시
 */
export const showInstallPrompt = async (
  prompt: BeforeInstallPromptEvent | null
): Promise<boolean> => {
  if (!prompt) return false;

  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === 'accepted';
};

/**
 * Android 뒤로가기 버튼 핸들링
 */
export const setupBackButtonHandler = (
  handler: () => boolean // true를 반환하면 기본 동작 방지
) => {
  if (!isAndroid()) return;

  // History API를 사용하여 뒤로가기 감지
  window.addEventListener('popstate', (e) => {
    const shouldPrevent = handler();
    if (shouldPrevent) {
      // 다시 history를 추가하여 앱을 닫지 않음
      window.history.pushState(null, '', window.location.href);
    }
  });

  // 초기 history 추가
  window.history.pushState(null, '', window.location.href);
};

/**
 * Android Share API 사용
 */
export const shareContent = async (data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  if ('share' in navigator) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      console.log('Share cancelled or failed:', err);
      return false;
    }
  }
  return false;
};

/**
 * Clipboard API (Android 최적화)
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if ('clipboard' in navigator) {
    try {
      await navigator.clipboard.writeText(text);
      successFeedback();
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

// TypeScript 타입 정의
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    BeforeInstallPromptEvent: BeforeInstallPromptEvent;
  }
}
