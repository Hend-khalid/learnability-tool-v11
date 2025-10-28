let timer = null;
let elapsed = 0;
function fmt(sec){
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m<10?"0"+m:m) + ":" + (s<10?"0"+s:s);
}
document.addEventListener("DOMContentLoaded", ()=>{
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

  if(startBtn){
    startBtn.addEventListener("click", ()=>{
      if(timer){ return; }
      startBtn.disabled = true;
      finishBtn.disabled = false;
      elapsed = 0;
      timer = setInterval(()=>{
        elapsed += 1;
        timerBadge.textContent = fmt(elapsed);
      }, 1000);
    });
  }
  if(finishBtn){
    finishBtn.addEventListener("click", ()=>{
      if(timer){
        clearInterval(timer);
        timer = null;
        durationField.value = String(elapsed);
        submitBtn.disabled = false;
        finishBtn.disabled = true;
      }
    });
  }
  if(errorPlus){
    errorPlus.addEventListener("click", ()=>{
      const v = parseInt(errorsDisplay.textContent || "0") + 1;
      errorsDisplay.textContent = String(v);
      errorsField.value = String(v);
    });
  }
  if(helpPlus){
    helpPlus.addEventListener("click", ()=>{
      const v = parseInt(helpDisplay.textContent || "0") + 1;
      helpDisplay.textContent = String(v);
      helpField.value = String(v);
    });
  }
});








document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const submitBtn = document.getElementById("submitBtn");
  if (!form || !submitBtn) return;

  form.addEventListener("submit", function (e) {
    const picked = document.querySelector('input[name="easy"]:checked');
    if (!picked) {
      e.preventDefault();                    // امنعي الإرسال
      alert("Please select whether the task was easy or not.");
      submitBtn.disabled = false;            // رجّعي تفعيل الزر
    }
  });
});

