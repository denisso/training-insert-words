function throttle<T extends (...args: Parameters<T>) => void>(
  cb: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

export default throttle;
