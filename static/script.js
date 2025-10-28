let timer = null;
let elapsed = 0;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn       = document.getElementById("startBtn");
  const finishBtn      = document.getElementById("finishBtn");
  const timerBadge     = document.getElementById("timerBadge");
  const submitBtn      = document.getElementById("submitBtn");
  const durationField  = document.getElementById("duration_seconds");

  const errorPlus      = document.getElementById("errorPlus");
  const helpPlus       = document.getElementById("helpPlus");
  const errorsDisplay  = document.getElementById("errorsDisplay");
  const helpDisplay    = document.getElementById("helpDisplay");
  const errorsField    = document.getElementById("errors_count");
  const helpField      = document.getElementById("help_count");

  // حالة ابتدائية دفاعية
  if (finishBtn) finishBtn.disabled = true;
  if (errorPlus) errorPlus.disabled = true;
  if (helpPlus)  helpPlus.disabled  = true;
  // ملاحظة: submitBtn قد يكون مفعّل إذا رجعت الصفحة بـ enable_submit=True من السيرفر

  // Start
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (timer) return;
      startBtn.disabled = true;

      if (finishBtn) finishBtn.disabled = false;
      if (errorPlus) errorPlus.disabled = false;
      if (helpPlus)  helpPlus.disabled  = false;

      elapsed = 0;
      timer = setInterval(() => {
        elapsed += 1;
        if (timerBadge) timerBadge.textContent = fmt(elapsed);
      }, 1000);
    });
  }

  // Finish
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        if (durationField) durationField.value = String(elapsed);
      }

      // بعد إنهاء المهمة:
      finishBtn.disabled = true;
      if (errorPlus) errorPlus.disabled = true;
      if (helpPlus)  helpPlus.disabled  = true;

      // فعّل زر الإرسال ليرسل النتيجة
      if (submitBtn) submitBtn.disabled = false;
    });
  }

  // Errors +
  if (errorPlus) {
    errorPlus.addEventListener("click", () => {
      const v = (parseInt(errorsDisplay?.textContent || "0") || 0) + 1;
      if (errorsDisplay) errorsDisplay.textContent = String(v);
      if (errorsField)   errorsField.value = String(v);
    });
  }

  // Help +
  if (helpPlus) {
    helpPlus.addEventListener("click", () => {
      const v = (parseInt(helpDisplay?.textContent || "0") || 0) + 1;
      if (helpDisplay) helpDisplay.textContent = String(v);
      if (helpField)   helpField.value = String(v);
    });
  }

  // ✅ تحقق عميل قبل الإرسال: لازم يختار Easy/Not Easy
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      const picked = document.querySelector('input[name="easy"]:checked');
      if (!picked) {
        e.preventDefault();
        alert("Please select whether the task was easy or not.");
        // تأكد أن زر الإرسال يبقى مفعّل بعد التنبيه
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
