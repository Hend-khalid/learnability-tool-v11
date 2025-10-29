from flask import Flask, render_template, request, redirect, url_for, session, flash, send_file, after_this_request
from datetime import datetime
import csv, os, json, uuid, argparse, shutil, time, glob

SESSIONS_PER_APP = 2

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me-please")

# تحميل المهام وقائمة التحميلات
with open(os.path.join("config", "apps_tasks.json"), "r", encoding="utf-8") as f:
    APPS_TASKS = json.load(f)

with open(os.path.join("config", "app_downloads.json"), "r", encoding="utf-8") as f:
    APP_DOWNLOADS = json.load(f)

# 📦 مجلد البيانات - يدعم التخزين الدائم (Persistent Disk)
DATA_DIR = os.environ.get("DATA_DIR", "/opt/render/project/src/data")
os.makedirs(DATA_DIR, exist_ok=True)

# 🔍 قراءة رابط الساندبوكس
def _load_sandbox_url():
    try:
        with open(os.path.join("config", "sandbox_url.txt"), "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception:
        return ""

@app.context_processor
def inject_globals():
    return dict(SANDBOX_URL=_load_sandbox_url())

def ensure_csv(path):
    """يتأكد من وجود ملف CSV ويضيف العناوين إن لم يكن موجودًا."""
    if not os.path.exists(path):
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "timestamp_iso","session_id",
                "user_name","gender","age_group","major",
                "app_name","app_experience",
                "trial_number",
                "task_index","task_description",
                "duration_seconds","errors_count","help_count",
                "easy_binary"
            ])

# الصفحة الرئيسية (البيانات الشخصية)
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        user_name = request.form.get("user_name", "").strip()
        gender = request.form.get("gender", "").strip()
        age_group = request.form.get("age_group", "").strip()
        major = request.form.get("major", "").strip()

        if not user_name or not gender or not age_group or not major:
            flash("Please fill in all fields: Name, Gender, Age group, Major.", "danger")
            return render_template("home.html")

        session.clear()
        session["session_id"] = str(uuid.uuid4())
        session["user_name"] = user_name
        session["gender"] = gender
        session["age_group"] = age_group
        session["major"] = major
        return redirect(url_for("choose_app"))
    return render_template("home.html")

# اختيار التطبيق
@app.route("/choose-app", methods=["GET", "POST"])
def choose_app():
    if "user_name" not in session:
        return redirect(url_for("home"))
    apps = list(APPS_TASKS.keys())
    downloads = APP_DOWNLOADS
    if request.method == "POST":
        app_name = request.form.get("app_name")
        app_experience = request.form.get("app_experience")
        if app_name not in APPS_TASKS:
            flash("Please select a valid application.", "danger")
            return render_template("choose_app.html", apps=apps, downloads=downloads)
        if app_experience not in ["None","Beginner","Intermediate","Advanced"]:
            flash("Please select your experience level for the chosen application.", "warning")
            return render_template("choose_app.html", apps=apps, downloads=downloads, selected_app=app_name)
        session["current_app"] = app_name
        session["app_experience"] = app_experience
        session["trial_number"] = 1
        session["task_index"] = 0
        return redirect(url_for("task", idx=0))
    return render_template("choose_app.html", apps=apps, downloads=downloads)

# صفحة المهام
@app.route("/task/<int:idx>", methods=["GET", "POST"])
def task(idx):
    if "user_name" not in session or "current_app" not in session:
        return redirect(url_for("home"))
    app_name = session["current_app"]
    tasks = APPS_TASKS.get(app_name, [])
    if idx < 0 or idx >= len(tasks):
        flash("You have completed all tasks for this application.", "success")
        return redirect(url_for("choose_app"))

    if request.method == "POST":
        duration = request.form.get("duration_seconds", "0").strip()
        errors = request.form.get("errors_count", "0").strip()
        help_count = request.form.get("help_count", "0").strip()
        easy = request.form.get("easy", "").strip()

        try:
            duration_seconds = int(float(duration))
        except:
            duration_seconds = 0
        try:
            errors_count = int(errors)
        except:
            errors_count = 0
        try:
            help_count_int = int(help_count)
        except:
            help_count_int = 0

        if easy not in ["easy", "not_easy"]:
            flash("Please select Easy or Not Easy before submitting.", "warning")
            return render_template("task.html",
                                   app_name=app_name,
                                   idx=idx,
                                   total=len(tasks),
                                   task_text=tasks[idx],
                                   trial_number=session.get("trial_number", 1),
                                   sessions_per_app=SESSIONS_PER_APP)

        easy_binary = 1 if easy == "easy" else 0
        trial_number = session.get("trial_number", 1)

        csv_path = os.path.join(DATA_DIR, f"{app_name.replace(' ','_')}.csv")
        ensure_csv(csv_path)
        with open(csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                datetime.utcnow().isoformat(),
                session.get("session_id",""),
                session.get("user_name",""),
                session.get("gender",""),
                session.get("age_group",""),
                session.get("major",""),
                app_name,
                session.get("app_experience",""),
                trial_number,
                idx,
                tasks[idx],
                duration_seconds,
                errors_count,
                help_count_int,
                easy_binary
            ])

        next_idx = idx + 1
        if next_idx >= len(tasks):
            if session.get("trial_number", 1) < SESSIONS_PER_APP:
                session["trial_number"] = session.get("trial_number", 1) + 1
                flash(f"Session {session['trial_number'] - 1} finished. Starting session {session['trial_number']} for {app_name}.", "info")
                return redirect(url_for("task", idx=0))
            else:
                flash(f"Finished {app_name} tasks for {SESSIONS_PER_APP} sessions. You can pick another app.", "success")
                return redirect(url_for("choose_app"))
        else:
            return redirect(url_for("task", idx=next_idx))

    return render_template("task.html",
                           app_name=app_name,
                           idx=idx,
                           total=len(tasks),
                           task_text=tasks[idx],
                           trial_number=session.get("trial_number", 1),
                           sessions_per_app=SESSIONS_PER_APP)

# صفحة الشكر
@app.route("/thanks")
def thanks():
    if "user_name" not in session:
        return redirect(url_for("home"))
    return render_template("thanks.html")

# يمنع الكاش على كل الردود
@app.after_request
def add_no_cache_headers(resp):
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp

# 🔥 تحميل كل ملفات البيانات كـ ZIP واحد
@app.route("/download-data")
def download_data():
    base = f"data_backup_{int(time.time())}"
    zip_path = shutil.make_archive(base, "zip", DATA_DIR)

    @after_this_request
    def cleanup(resp):
        try:
            if os.path.exists(zip_path):
                os.remove(zip_path)
        except Exception:
            pass
        return resp

    return send_file(zip_path, as_attachment=True)

# 📊 صفحة فحص الملفات والصفوف
@app.route("/debug-data-info")
def debug_data_info():
    info = {"dir": DATA_DIR, "files": [], "total_rows": 0}
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "*.csv"))):
        rows = 0
        try:
            with open(p, "r", encoding="utf-8") as f:
                r = csv.reader(f)
                next(r)
                for _ in r:
                    rows += 1
        except:
            pass
        info["files"].append({"name": os.path.basename(p), "rows": rows})
        info["total_rows"] += rows
    return info

# 🚀 تشغيل التطبيق
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=os.environ.get("HOST", "0.0.0.0"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8088)))
    parser.add_argument("--debug", action="store_true", default=True)
    args = parser.parse_args()
    app.run(debug=args.debug, host=args.host, port=args.port)

if __name__ == "__main__":
    main()
