let timer = null;
let elapsed = 0;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const finishBtn = document.getElementById("finishBtn");
  const timerBadge = document.getElementById("timerBadge");
  const submitBtn = document.getElementById("submitBtn");
  const durationField = document.getElementById("duration_seconds");

  const errorPlus = document.getElementById("errorPlus");
  const helpPlus = document.getElementById("helpPlus");
  const errorsDisplay = document.getElementById("errorsDisplay");
  const helpDisplay = document.getElementById("helpDisplay");
  const errorsField = document.getElementById("errors_count");
  const helpField = document.getElementById("help_count");

  // 🔹 عطّل الأزرار في البداية
  if (finishBtn) finishBtn.disabled = true;
  if (errorPlus) errorPlus.disabled = true;
  if (helpPlus) helpPlus.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  // 🔹 عند الضغط على زر البدء
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (timer) return;

      startBtn.disabled = true;
      finishBtn.disabled = false;
      errorPlus.disabled = false;
      helpPlus.disabled = false;

      elapsed = 0;
      timer = setInterval(() => {
        elapsed += 1;
        if (timerBadge) timerBadge.textContent = fmt(elapsed);
      }, 1000);
    });
  }

  // 🔹 عند الضغط على زر الإنهاء
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        if (durationField) durationField.value = String(elapsed);
      }

      finishBtn.disabled = true;
      errorPlus.disabled = true;
      helpPlus.disabled = true;
      submitBtn.disabled = false; // ← فعّل زر Submit بعد الانتهاء
    });
  }

  // 🔹 زر الأخطاء
  if (errorPlus) {
    errorPlus.addEventListener("click", () => {
      const v = parseInt(errorsDisplay.textContent || "0") + 1;
      errorsDisplay.textContent = String(v);
      errorsField.value = String(v);
    });
  }

  // 🔹 زر المساعدة
  if (helpPlus) {
    helpPlus.addEventListener("click", () => {
      const v = parseInt(helpDisplay.textContent || "0") + 1;
      helpDisplay.textContent = String(v);
      helpField.value = String(v);
    });
  }
});
