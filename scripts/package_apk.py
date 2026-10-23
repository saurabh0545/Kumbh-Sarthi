import zipfile
import subprocess
import os
import sys

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
base_apk = os.path.join(base_dir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
new_bundle = os.path.join(base_dir, 'dist_bundle', 'index.android.bundle')
temp_apk = os.path.join(base_dir, 'dist_bundle', 'temp_unsigned.apk')
aligned_apk = os.path.join(base_dir, 'dist_bundle', 'temp_aligned.apk')
final_apk = os.path.join(base_dir, 'KumbhSarthi_Updated.apk')

# Map of native splash resources inside base APK to their updated Kumbh emblem files
splash_replacements = {
    'res/gV.png': os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', 'drawable-mdpi', 'splashscreen_logo.png'),
    'res/Zt.png': os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', 'drawable-hdpi', 'splashscreen_logo.png'),
    'res/42.png': os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', 'drawable-xhdpi', 'splashscreen_logo.png'),
    'res/St.png': os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', 'drawable-xxhdpi', 'splashscreen_logo.png'),
    'res/S7.png': os.path.join(base_dir, 'android', 'app', 'src', 'main', 'res', 'drawable-xxxhdpi', 'splashscreen_logo.png'),
}

print('Step 1/4: Packaging fresh JavaScript bundle and updated splash logos...')
with zipfile.ZipFile(base_apk, 'r') as zin, zipfile.ZipFile(temp_apk, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        if item.filename == 'assets/index.android.bundle':
            continue
        if item.filename in splash_replacements:
            continue
        if item.filename.startswith('META-INF/') and (item.filename.endswith('.RSA') or item.filename.endswith('.SF') or item.filename.endswith('.MF')):
            continue
        data = zin.read(item.filename)
        zout.writestr(item, data)
    zout.write(new_bundle, 'assets/index.android.bundle')
    for apk_path, local_path in splash_replacements.items():
        if os.path.exists(local_path):
            zout.write(local_path, apk_path)
            print(f'Replaced {apk_path} with official Kumbh emblem')

print('Step 2/4: Aligning APK with zipalign...')
zipalign_path = r'C:\Users\VICTUS\AppData\Local\Android\Sdk\build-tools\35.0.0\zipalign.exe'
subprocess.run([zipalign_path, '-p', '-f', '4', temp_apk, aligned_apk], check=True)

print('Step 3/4: Signing APK with apksigner (v2 & v3 schemes)...')
apksigner_path = r'C:\Users\VICTUS\AppData\Local\Android\Sdk\build-tools\35.0.0\apksigner.bat'
keystore_path = os.path.join(base_dir, 'android', 'app', 'debug.keystore')
subprocess.run([
    apksigner_path, 'sign',
    '--ks', keystore_path,
    '--ks-pass', 'pass:android',
    '--key-pass', 'pass:android',
    '--out', final_apk,
    aligned_apk
], check=True)

print('Step 4/4: Verifying signature...')
res = subprocess.run([apksigner_path, 'verify', final_apk], capture_output=True, text=True)
if 'DOES NOT VERIFY' in res.stdout or res.returncode != 0:
    print('Signature check failed:', res.stderr)
    sys.exit(1)

for f in [temp_apk, aligned_apk]:
    if os.path.exists(f):
        os.remove(f)

print('\nSUCCESS: KumbhSarthi_Updated.apk successfully built and verified!')
