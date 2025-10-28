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

  // الحالة الابتدائية للأزرار
  if (finishBtn) finishBtn.disabled = true;
  if (errorPlus) errorPlus.disabled = true;
  if (helpPlus) helpPlus.disabled = true;
  // زر الإرسال قد يكون مفعّل إذا enable_submit=True من السيرفر

  // عند الضغط على زر البدء
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (timer) return;
      startBtn.disabled = true;

      if (finishBtn) finishBtn.disabled = false;
      if (errorPlus) errorPlus.disabled = false;
      if (helpPlus) helpPlus.disabled = false;

      elapsed = 0;
      timer = setInterval(() => {
        elapsed += 1;
        if (timerBadge) timerBadge.textContent = fmt(elapsed);
      }, 1000);
    });
  }

  // عند الضغط على زر الإنهاء
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        if (durationField) durationField.value = String(elapsed);
      }

      finishBtn.disabled = true;
      if (errorPlus) errorPlus.disabled = true;
      if (helpPlus) helpPlus.disabled = true;
      if (submitBtn) submitBtn.disabled = false; // تفعيل الإرسال بعد الإنهاء
    });
  }

  // زر الأخطاء
  if (errorPlus) {
    errorPlus.addEventListener("click", () => {
      const v = parseInt(errorsDisplay.textContent || "0") + 1;
      errorsDisplay.textContent = String(v);
      errorsField.value = String(v);
    });
  }

  // زر المساعدة
  if (helpPlus) {
    helpPlus.addEventListener("click", () => {
      const v = parseInt(helpDisplay.textContent || "0") + 1;
      helpDisplay.textContent = String(v);
      helpField.value = String(v);
    });
  }

  // ✅ تحقق العميل (client-side) فقط في صفحات المهام
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      // إذا ما فيه خيارات easy → يعني مو صفحة المهام
      const radios = document.querySelectorAll('input[name="easy"]');
      if (radios.length === 0) return; // تجاهل التحقق

      const picked = document.querySelector('input[name="easy"]:checked');
      if (!picked) {
        e.preventDefault();
        alert("Please select whether the task was easy or not.");
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
