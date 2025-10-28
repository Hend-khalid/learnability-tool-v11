let timer = null;
let elapsed = 0;

// حالات منطقية لتتبع التسلسل المطلوب
let hasStarted = false;
let hasFinished = false;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

document.addEventListener("DOMContentLoaded", () => {
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

  // دالة داخلية لتحديث حالة زر الإرسال حسب الشروط
  function updateSubmitState() {
    // لازم: بدأ ثم أنهى ثم اختار نوع المهمة
    const picked = document.querySelector('input[name="easy"]:checked');
    const canSubmit = hasStarted && hasFinished && !!picked;
    if (submitBtn) submitBtn.disabled = !canSubmit;
  }

  // الحالة الابتدائية: كل الأزرار معطلة ما عدا Start
  if (finishBtn) finishBtn.disabled = true;
  if (errorPlus) errorPlus.disabled = true;
  if (helpPlus)  helpPlus.disabled  = true;
  if (submitBtn) submitBtn.disabled = true;
  hasStarted = false;
  hasFinished = false;

  // Start
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (timer) return;
      startBtn.disabled = true;

      // فعّل باقي الأدوات
      if (finishBtn) finishBtn.disabled = false;
      if (errorPlus) errorPlus.disabled = false;
      if (helpPlus)  helpPlus.disabled  = false;

      // وضع البدء
      hasStarted = true;
      hasFinished = false;
      updateSubmitState(); // يبقى معطل لأن ما أنهى بعد

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

      // عطّل أدوات العداد
      finishBtn.disabled = true;
      if (errorPlus) errorPlus.disabled = true;
      if (helpPlus)  helpPlus.disabled  = true;

      // وضع الإنهاء
      hasFinished = true;

      // بعد الإنهاء: لا تفعل الإرسال إلا إذا اختير نوع المهمة
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

  // تفعيل الإرسال فقط إذا (بعد الإنهاء) اختير Easy/Not Easy
  easyRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      updateSubmitState();
    });
  });

  // حارس إضافي: حتى لو حاول يرسل بدون استيفاء الشروط (مثلاً من DevTools)، نمنع الإرسال بصمت
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      const picked = document.querySelector('input[name="easy"]:checked');
      const canSubmit = hasStarted && hasFinished && !!picked;
      if (!canSubmit) {
        e.preventDefault();
        // ما في alert — فقط نمنع الإرسال ونضمن بقاء الزر معطّل
        updateSubmitState();
      }
    });
  }
});
