import os
import sys
import subprocess

def main():
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if not os.path.exists(project_dir):
        print(f"ERROR: Cannot find project directory at: {project_dir}")
        return

    print("=" * 60)
    print("STARTING KUMBH SMART ASSIST FASTAPI BACKEND")
    print("Host: 0.0.0.0 | Port: 8001")
    print(f"Working Directory: {project_dir}")
    print("=" * 60)

    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8001",
        "--reload"
    ]
    try:
        subprocess.run(cmd, cwd=anc_dir)
    except KeyboardInterrupt:
        print("\nBackend stopped.")

if __name__ == "__main__":
    main()
