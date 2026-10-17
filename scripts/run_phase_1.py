"""Phase 1 validation runner — backend + frontend.

Usage:
    python scripts/run_phase_1.py
    python scripts/run_phase_1.py --reset
"""

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

STATUS_FILE = Path("runs/phase_1_status.json")


def load_status() -> dict:
    if STATUS_FILE.exists():
        return json.loads(STATUS_FILE.read_text())
    return {
        "started_at": datetime.utcnow().isoformat(),
        "last_updated": None,
        "steps_completed": [],
        "step_details": {},
    }


def save_status(status: dict) -> None:
    STATUS_FILE.parent.mkdir(exist_ok=True)
    status["last_updated"] = datetime.utcnow().isoformat()
    STATUS_FILE.write_text(json.dumps(status, indent=2))


def run_step(name: str, cmd: str, status: dict, cwd: str = ".") -> None:
    if name in status["steps_completed"]:
        print(f"[SKIP] {name} — already completed")
        return
    print(f"[RUN]  {name}: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"[FAIL] {name}")
        sys.exit(result.returncode)
    status["steps_completed"].append(name)
    status["step_details"][name] = {"completed_at": datetime.utcnow().isoformat()}
    save_status(status)
    print(f"[PASS] {name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    if args.reset and STATUS_FILE.exists():
        STATUS_FILE.unlink()
        print("[RESET] Phase 1 status cleared")

    status = load_status()

    run_step("pip_install",   "pip install -r requirements.txt", status)
    run_step("black_check",   "black backend/ --check",          status)
    run_step("isort_check",   "isort backend/ --check-only",     status)
    run_step("pytest_backend", "pytest backend/tests/ -v --cov=backend --cov-report=term-missing", status)

    run_step("npm_install",  "npm install",            status, cwd="frontend")
    run_step("type_check",   "npm run type-check",     status, cwd="frontend")
    run_step("lint",         "npm run lint",            status, cwd="frontend")
    run_step("build",        "npm run build",           status, cwd="frontend")

    print("\n✅ Phase 1 backend + frontend validation complete.")


if __name__ == "__main__":
    main()
