import type { CheerState, RestrainState, GrowthState } from "../domain/types";

export const cheerCopy: Record<CheerState, string> = {
  empty: "Quyết tâm!!! 🔥",
  cold: "Tìm khách nào!!! 🤔",
  slow: "Cố lên nào!!! 💪",
  onTrack: "Xịn xò bạn ơi!!! 😎",
  almost: "Sắp tới rồi! 🔥🔥🔥",
  cleared: "Vượt mục tiêu rồi! 🎉🎉🎉",
  newRecord: "Kỷ lục mới! 🏆",
};

export const restrainCopy: Record<RestrainState, string> = {
  calm: "Túi nhiều tiền. 😌",
  watch: "Chú ý. Chú ý!!! 🚨",
  stop: "Phanh lại bạn ơi! ⛔",
  over: "Hết cả :(( 🤕",
  recovered: "Làm tốt lắm! 💪",
};

export const growthCopy: Record<GrowthState, string> = {
  seed: "Mới gieo hạt thôi, còn dài.",
  sprout: "Đã nảy mầm rồi.",
  growing: "Đang lớn tốt lắm.",
  blooming: "Sắp nở hoa rồi.",
  harvest: "Đạt mục tiêu!",
};
