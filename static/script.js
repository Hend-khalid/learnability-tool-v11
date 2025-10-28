let timer = null;
let elapsed = 0;
let hasStarted = false;
let hasFinished = false;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

document.addEventListener("DOMContentLoaded", () => {
  // ✅ نتأكد أولاً إننا في صفحة فيها تقييم للمهمة
  const taskForm = document.querySelector("#taskForm");
  if (!taskForm) return; // <-- لو مو صفحة المهام، لا نسوي أي شيء

  const startBtn      = document.getElementById("startBtn");
  const finishBtn     = document.getElementById("finishBtn");
  const timerBadge    = document.getElementById("timerBadge");
  const submitBtn     = document.getElementById("submitBtn");
  const durationField = document.getElementById("duration_seconds");

  const errorPlus     = document.getElementById("errorPlus");
  const helpPlus      = document.getElementById("helpPlus");
  const errorsDisplay = document.getElementById("errorsDisplay");
  const helpDisplay   = document.getElementById("helpDisplay");
  const errorsField   = document.getElementById("errors_count");
  const helpField     = document.getElementById("help_count");

  const easyRadios    = document.querySelectorAll('input[name="easy"]');

  // تحديث حالة زر الإرسال بناء على الشروط
  function updateSubmitState() {
    const picked = document.querySelector('input[name="easy"]:checked');
    const canSubmit = hasStarted && hasFinished && !!picked;
    if (submitBtn) submitBtn.disabled = !canSubmit;
  }

  // الحالة الابتدائية
  if (finishBtn) finishBtn.disabled = true;
  if (errorPlus) errorPlus.disabled = true;
  if (helpPlus)  helpPlus.disabled  = true;
  if (submitBtn) submitBtn.disabled = true;

  hasStarted = false;
  hasFinished = false;

  // زر البدء
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (timer) return;
      startBtn.disabled = true;

      if (finishBtn) finishBtn.disabled = false;
      if (errorPlus) errorPlus.disabled = false;
      if (helpPlus)  helpPlus.disabled  = false;

      hasStarted = true;
      hasFinished = false;
      updateSubmitState();

      elapsed = 0;
      timer = setInterval(() => {
        elapsed += 1;
        if (timerBadge) timerBadge.textContent = fmt(elapsed);
      }, 1000);
    });
  }

  // زر الإنهاء
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        if (durationField) durationField.value = String(elapsed);
      }

      finishBtn.disabled = true;
      if (errorPlus) errorPlus.disabled = true;
      if (helpPlus)  helpPlus.disabled  = true;

      hasFinished = true;
      updateSubmitState();
    });
  }

  // عداد الأخطاء
  if (errorPlus) {
    errorPlus.addEventListener("click", () => {
      const v = parseInt(errorsDisplay.textContent || "0") + 1;
      errorsDisplay.textContent = String(v);
      errorsField.value = String(v);
    });
  }

  // عداد المساعدة
  if (helpPlus) {
    helpPlus.addEventListener("click", () => {
      const v = parseInt(helpDisplay.textContent || "0") + 1;
      helpDisplay.textContent = String(v);
      helpField.value = String(v);
    });
  }

  // تفعيل الإرسال فقط بعد اكتمال الشروط
  easyRadios.forEach(radio => {
    radio.addEventListener("change", () => updateSubmitState());
  });

  // تأكيد إضافي لمنع الإرسال من المطور أو بدونه
  taskForm.addEventListener("submit", (e) => {
    const picked = document.querySelector('input[name="easy"]:checked');
    const canSubmit = hasStarted && hasFinished && !!picked;
    if (!canSubmit) {
      e.preventDefault();
      updateSubmitState();
    }
  });
});
