// Preload any missing modern Array methods used by Metro/Expo.
// This lets the dev server run even on older Node versions (<20) that
// don't ship Array.prototype.toReversed.
if (!Array.prototype.toReversed) {
  // Keep behaviour immutable: return a reversed copy.
  Array.prototype.toReversed = function toReversed() {
    return [...this].reverse();
  };
}

// Some tooling also calls toSorted/toSpliced; add minimal shims for safety.
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function toSorted(compareFn) {
    return [...this].sort(compareFn);
  };
}

if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function toSpliced(start, deleteCount, ...items) {
    const copy = [...this];
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}
