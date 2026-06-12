# -*- coding: utf-8 -*-
"""SaaS 포털 서버 — 포트 9900 | 클림트 황금빛 우주 UI"""
import subprocess, sys, os, json, threading, time, socket, socketserver, re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

class ThreadingHTTPServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

LOCAL_IP = get_local_ip()

# ── 커스텀 카드 DB ──
CUSTOM_CARDS_DB = os.path.join(DATA_DIR if 'DATA_DIR' in dir() else
    os.path.join(os.path.dirname(__file__),'data'), "custom_cards.json")

def load_custom_cards():
    try:
        with open(CUSTOM_CARDS_DB,"r",encoding="utf-8-sig") as f: return json.load(f)
    except: return []

def save_custom_cards(cards):
    os.makedirs(os.path.dirname(CUSTOM_CARDS_DB), exist_ok=True)
    with open(CUSTOM_CARDS_DB,"w",encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

def cards_timestamp():
    try: return int(os.path.getmtime(CUSTOM_CARDS_DB) * 1000)
    except: return 0

# ── 포트 자동 탐지 ──
SCAN_ROOTS = [
    r"E:\1._AI_SaaS 제작소",  # 전체 범용 스캔
]
# 포털 자체 폴더는 스캔 제외 (portal_server.py에 모든 포트번호가 적혀있어서 오탐지)
SCAN_EXCLUDE = {
    os.path.normpath(r"E:\1._AI_SaaS 제작소\0.SaaS 포털"),
}
SKIP_DIRS = {'node_modules','.git','__pycache__','.venv','dist','build','.next'}
SKIP_PREFIX = ('_', '.')  # 언더스코어/점 시작 폴더 제외 (백업·체크포인트 폴더)

def scan_port_in_file(filepath, port):
    """실제 서버 포트 설정 패턴만 탐지 (리스트·딕셔너리 내 참조는 제외)"""
    try:
        with open(filepath,'r',encoding='utf-8',errors='ignore') as f:
            content = f.read()
        p = str(port)
        patterns = [
            r'port\s*[=:]\s*' + p + r'\b',   # port=9530 / port: 9530
            r'PORT\s*=\s*' + p + r'\b',       # PORT=9530
            r'--port\s+' + p + r'\b',         # --port 9530
            r'listen\s*\(\s*' + p,            # listen(9530
        ]
        return any(re.search(pat, content, re.IGNORECASE) for pat in patterns)
    except: return False

# 라이브러리 → 추가 포트 매핑
KNOWN_EXTRA = {
    'comfyui': 8188, 'gradio': 7860, 'stable-diffusion': 7860,
    'jupyter': 8888, 'tensorboard': 6006, 'streamlit': 8501,
}

def detect_conda_env(dirpath):
    """폴더에서 conda 환경명 자동 탐지"""
    # environment.yml
    for fname in ('environment.yml','environment.yaml'):
        p = os.path.join(dirpath, fname)
        if os.path.exists(p):
            try:
                with open(p,'r',encoding='utf-8',errors='ignore') as f:
                    m = re.search(r'^name:\s*(\S+)', f.read(), re.MULTILINE)
                    if m: return m.group(1)
            except: pass
    # README / .sh / .bat 에서 conda activate 패턴
    for fname in os.listdir(dirpath):
        if fname.lower().endswith(('.md','.txt','.sh','.bat','.ps1')):
            try:
                with open(os.path.join(dirpath,fname),'r',encoding='utf-8',errors='ignore') as f:
                    m = re.search(r'conda activate (\S+)', f.read())
                    if m: return m.group(1)
            except: pass
    return None

def detect_extra_port(dirpath):
    """requirements.txt / 코드에서 추가 서비스 포트 자동 탐지"""
    req = os.path.join(dirpath, 'requirements.txt')
    if os.path.exists(req):
        try:
            with open(req,'r',encoding='utf-8',errors='ignore') as f:
                content = f.read().lower()
            for lib, port in KNOWN_EXTRA.items():
                if lib in content:
                    return port
        except: pass
    # .py 파일에서 특수 포트 참조 — URL 형태(:8188) 포함
    for fname in os.listdir(dirpath):
        if not fname.endswith('.py'): continue
        try:
            with open(os.path.join(dirpath,fname),'r',encoding='utf-8',errors='ignore') as f:
                content = f.read()
            for lib, port in KNOWN_EXTRA.items():
                p = str(port)
                patterns = [
                    r'(?:port|host)["\s]*[=:,\s]+' + p + r'\b',  # port=8188
                    r':' + p + r'(?:["/\')\s]|$)',                # :8188/ URL 형태
                ]
                if any(re.search(pat, content, re.I) for pat in patterns):
                    return port
        except: pass
    return None

def find_venv_python(folder):
    """폴더 내 .venv python.exe 탐색 — .venv 폴더는 탐색 허용"""
    SKIP_VENV = SKIP_DIRS - {'.venv'}
    for root, dirs, files in os.walk(folder):
        dirs[:] = [d for d in dirs if d not in SKIP_VENV]
        if 'python.exe' in files and '.venv' in root:
            return os.path.join(root, 'python.exe')
    return None

# ── 포트 인덱스 (서버 시작 시 1회 빌드, 이후 즉시 조회) ──
_PORT_INDEX = {}   # {port: {"back": {...}, "front": {...}}}
_INDEX_READY = False

def _build_index():
    global _PORT_INDEX, _INDEX_READY
    idx = {}
    BACK_FILES  = ('main.py','app.py','server.py','api.py','run.py')
    FRONT_FILES = ('vite.config.ts','vite.config.js','package.json')
    for root_path in SCAN_ROOTS:
        if not os.path.exists(root_path): continue
        for dirpath, dirs, files in os.walk(root_path):
            if os.path.normpath(dirpath) in SCAN_EXCLUDE: dirs[:]=[];continue
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(SKIP_PREFIX)]
            if dirpath.replace(root_path,'').count(os.sep) > 6: continue
            for fname in files:
                fpath = os.path.join(dirpath, fname)
                try:
                    if os.path.getsize(fpath) > 300_000: continue  # 300KB 이상 스킵
                    with open(fpath,'r',encoding='utf-8',errors='ignore') as f:
                        content = f.read()
                except: continue
                parts = dirpath.replace(root_path,'').strip(os.sep).split(os.sep)
                proj_name = parts[0] if parts else ''
                if fname in BACK_FILES:
                    # scan_port_in_file()과 동일한 엄격한 패턴 사용 (리스트 참조 오탐지 방지)
                    found_ports = set()
                    for p_str in re.findall(r'\d{4,5}', content):
                        p = int(p_str)
                        if not (1024 <= p <= 65535): continue
                        if p in found_ports: continue
                        patterns = [
                            r'port\s*[=:]\s*' + p_str + r'\b',
                            r'PORT\s*=\s*' + p_str + r'\b',
                            r'--port\s+' + p_str + r'\b',
                            r'listen\s*\(\s*' + p_str,
                        ]
                        if any(re.search(pat, content, re.IGNORECASE) for pat in patterns):
                            found_ports.add(p)
                            if p not in idx: idx[p] = {}
                            if 'back' not in idx[p]:
                                py = find_venv_python(dirpath) or find_venv_python(os.path.dirname(dirpath))
                                idx[p]['back'] = {'dir':dirpath,'script':fname,'exe':py or 'python','name':proj_name}
                if fname in FRONT_FILES:
                    for m in re.finditer(
                        r'(?:port\s*[=:]\s*|--port\s+)(\d{4,5})\b',
                        content, re.IGNORECASE):
                        port = int(m.group(1))
                        if 1024 <= port <= 65535:
                            if port not in idx: idx[port] = {}
                            if 'front' not in idx[port]:
                                cmd = 'npm run dev'
                                if fname == 'package.json':
                                    try:
                                        pkg = json.loads(content)
                                        scripts = pkg.get('scripts',{})
                                        if 'preview' in scripts and str(port) in str(scripts.get('preview','')):
                                            cmd = 'npm run preview'
                                        elif 'dev' not in scripts and 'preview' in scripts:
                                            cmd = 'npm run preview'
                                    except: pass
                                idx[port]['front'] = {'dir':dirpath,'cmd':cmd,'name':proj_name}
    _PORT_INDEX = idx
    _INDEX_READY = True
    print(f"[인덱스] 완료 — {len(idx)}개 포트 등록")

threading.Thread(target=_build_index, daemon=True).start()

ENV_FILES = ('.env','.env.local','.env.production','.env.development','.env.example','.env.server')

def _find_port_in_env(filepath, port):
    """KEY=포트값 패턴 → 변수명 반환"""
    try:
        with open(filepath,'r',encoding='utf-8',errors='ignore') as f:
            for line in f:
                line=line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    k,v=line.split('=',1)
                    if v.strip().strip('"\'') == str(port):
                        return k.strip()
    except: pass
    return None

def diagnose_miss(port, kind):
    """탐지 실패 원인 분석 — .env·docker-compose 스캔"""
    hints=[]
    for root_path in SCAN_ROOTS:
        if not os.path.exists(root_path): continue
        for dirpath, dirs, files in os.walk(root_path):
            if os.path.normpath(dirpath) in SCAN_EXCLUDE: dirs[:]=[];continue
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(SKIP_PREFIX)]
            depth = dirpath.replace(root_path,'').count(os.sep)
            if depth > 7: continue
            for fname in files:
                fpath = os.path.join(dirpath, fname)
                if fname in ENV_FILES:
                    var = _find_port_in_env(fpath, port)
                    if var:
                        py = find_venv_python(dirpath) or find_venv_python(os.path.dirname(dirpath))
                        hints.append({
                            "file": fpath,
                            "var": var,
                            "dir": dirpath,
                            "back_exe": py or "",
                            "reason": f"포트 {port}가 코드 파일이 아닌 .env의 `{var}` 환경변수로 분리되어 있어 자동 탐지 불가",
                            "fix": f"① 직접 입력 열기 → 경로: {dirpath}\n② 실행 스크립트 확인 (main.py / app.py 등)\n③ Python 경로: {py or '직접 입력'}"
                        })
                if fname in ('docker-compose.yml','docker-compose.yaml'):
                    if scan_port_in_file(fpath, port):
                        hints.append({
                            "file": fpath,
                            "dir": dirpath,
                            "reason": f"포트 {port}가 docker-compose에 정의됨 — Docker 환경변수 방식",
                            "fix": "Docker 컨테이너 방식이므로 직접 실행 명령 확인 필요"
                        })
    return hints

def detect_by_port(front_port=None, back_port=None):
    result = {
        "front_dir": None, "front_cmd": None, "front_port": front_port,
        "back_dir":  None, "back_exe":  None, "back_script": None, "back_port": back_port,
        "back_cmd": None, "extra_port": None, "extra_dir": None, "extra_cmd": None,
        "name": "", "note": "", "diagnosis": [], "index_ready": _INDEX_READY
    }

    # ── SECTIONS 우선 조회 (0.000초) — 이미 정확한 경로가 정의된 항목 ──
    for sec in SECTIONS:
        for item in sec['items']:
            # 양쪽 포트 모두 명시된 경우 모두 일치해야 함 (오탐지 방지)
            if back_port and front_port:
                if item.get('back_port') != back_port or item.get('front_port') != front_port:
                    continue
            elif back_port:
                if item.get('back_port') != back_port: continue
            elif front_port:
                if item.get('front_port') != front_port: continue
            else:
                continue
            result['back_dir']    = item.get('back_dir')
            result['back_exe']    = item.get('back_exe')
            result['back_script'] = item.get('back_script')
            result['back_cmd']    = item.get('back_cmd')
            result['front_dir']   = item.get('front_dir')
            result['front_cmd']   = item.get('front_cmd')
            result['name']        = item.get('name','')
            result['note']        = item.get('note','')
            if result['back_dir']:
                result['extra_port'] = detect_extra_port(result['back_dir'])
                if result['extra_port']:
                    # back_dir 조상 3단계에서 ComfyUI 탐색 (PermissionError 안전 처리)
                    search_root = result['back_dir']
                    for _ in range(3):
                        search_root = os.path.dirname(search_root)
                        if not search_root or not os.path.exists(search_root): break
                        try:
                            for cname in os.listdir(search_root):
                                if cname.lower() in ('comfyui', 'comfy_ui'):
                                    cpath = os.path.join(search_root, cname)
                                    if os.path.isdir(cpath) and os.path.exists(os.path.join(cpath, 'main.py')):
                                        env = detect_conda_env(cpath) or 'comfyui'
                                        result['extra_dir'] = cpath
                                        result['extra_cmd'] = f'conda activate {env} && python main.py'
                                        break
                        except (PermissionError, OSError):
                            pass
                        if result['extra_dir']: break
            return result

    if _INDEX_READY:
        # ── 인덱스에서 즉시 조회 (0.001초) ──
        if back_port and back_port in _PORT_INDEX:
            b = _PORT_INDEX[back_port].get('back')
            if b:
                result['back_dir']    = b['dir']
                result['back_script'] = b['script']
                result['back_exe']    = b['exe']
                if not result['name']: result['name'] = b['name']
                # conda 환경 자동 탐지 → back_cmd 생성
                env = detect_conda_env(b['dir'])
                if env:
                    result['back_cmd'] = f"conda activate {env} && python {b['script']}"
                    result['back_exe'] = None
                    result['back_script'] = None
                # extra_port 자동 탐지
                result['extra_port'] = detect_extra_port(b['dir'])
        if front_port and front_port in _PORT_INDEX:
            f = _PORT_INDEX[front_port].get('front')
            if f:
                result['front_dir'] = f['dir']
                result['front_cmd'] = f['cmd']
                if not result['name']: result['name'] = f['name']
    else:
        # ── 인덱스 미완성 시 기존 스캔 폴백 ──
        for root_path in SCAN_ROOTS:
            if not os.path.exists(root_path): continue
            for dirpath, dirs, files in os.walk(root_path):
                if os.path.normpath(dirpath) in SCAN_EXCLUDE: dirs[:]=[];continue
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(SKIP_PREFIX)]
                if dirpath.replace(root_path,'').count(os.sep) > 6: continue
                for fname in files:
                    fpath = os.path.join(dirpath, fname)
                    ext = os.path.splitext(fname)[1].lower()
                    if front_port and ext in {'.ts','.js','.json'} and not result["front_dir"]:
                        if fname in ('vite.config.ts','vite.config.js','package.json'):
                            if scan_port_in_file(fpath, front_port):
                                result["front_dir"] = dirpath
                                result["front_cmd"] = "npm run dev"
                                if not result["name"]:
                                    parts = dirpath.replace(root_path,'').strip(os.sep).split(os.sep)
                                    result["name"] = parts[0] if parts else ""
                    if back_port and ext == '.py' and not result["back_dir"]:
                        if fname in ('main.py','app.py','server.py','api.py','run.py'):
                            if scan_port_in_file(fpath, back_port):
                                result["back_dir"]    = dirpath
                                result["back_script"] = fname
                                py = find_venv_python(dirpath) or find_venv_python(os.path.dirname(dirpath))
                                result["back_exe"] = py or "python"
                                if not result["name"]:
                                    parts = dirpath.replace(root_path,'').strip(os.sep).split(os.sep)
                                    result["name"] = parts[0] if parts else ""
                if result["front_dir"] and (not back_port or result["back_dir"]): break
            if result["front_dir"] and (not back_port or result["back_dir"]): break

    # 인덱스 미완성 폴백에서도 extra_port 탐지
    if not result['extra_port'] and result['back_dir']:
        result['extra_port'] = detect_extra_port(result['back_dir'])

    # extra_port 탐지 후 → extra_dir/extra_cmd 자동 탐지 (ComfyUI 등)
    if result['extra_port'] and not result['extra_dir'] and result['back_dir']:
        # 1) back_dir 상위 폴더에서 ComfyUI 폴더 탐색
        parent = os.path.dirname(result['back_dir'])
        for cname in ('ComfyUI', 'comfyui', 'Comfy_UI'):
            cpath = os.path.join(parent, cname)
            if os.path.exists(cpath) and os.path.exists(os.path.join(cpath, 'main.py')):
                env = detect_conda_env(cpath) or 'comfyui'
                result['extra_dir'] = cpath
                result['extra_cmd'] = f'conda activate {env} && python main.py'
                break
        # 2) back_dir 조상 폴더(최대 3단계 위)에서만 탐색 — 전체 SCAN 금지
        if not result['extra_dir']:
            search_root = result['back_dir']
            for _ in range(3):
                search_root = os.path.dirname(search_root)
                if not search_root or not os.path.exists(search_root): break
                try:
                    for cname in os.listdir(search_root):
                        if cname.lower() in ('comfyui', 'comfy_ui'):
                            cpath = os.path.join(search_root, cname)
                            if os.path.isdir(cpath) and os.path.exists(os.path.join(cpath, 'main.py')):
                                env = detect_conda_env(cpath) or 'comfyui'
                                result['extra_dir'] = cpath
                                result['extra_cmd'] = f'conda activate {env} && python main.py'
                                break
                except (PermissionError, OSError):
                    pass
                if result['extra_dir']: break

    # 탐지 실패 시 원인 진단
    if back_port and not result["back_dir"]:
        result["diagnosis"].extend(diagnose_miss(back_port, "back"))
    if front_port and not result["front_dir"]:
        result["diagnosis"].extend(diagnose_miss(front_port, "front"))

    return result

# ─────────────────────────────────────────────
#  경로 베이스
# ─────────────────────────────────────────────
S  = r"E:\1._AI_SaaS 제작소\1.SaaS_제품"
E  = r"E:\1._AI_SaaS 제작소\7.인공지능 엔진"
T  = r"E:\1._AI_SaaS 제작소\3.보조_도구"

# ─────────────────────────────────────────────
#  SaaS 정의
# ─────────────────────────────────────────────
SECTIONS = [
    {
        "key": "engine",
        "title": "인공지능 엔진",
        "icon": "⚡",
        "items": [
            {
                "id": "e9528", "name": "이미지 공장",
                "note": "Juggernaut XL · SDXL",
                "front_port": None, "back_port": 9528,
                "back_dir":  rf"{E}\1.인공지능_이미지",
                "back_exe":  None,   # conda env imgtrain
                "back_cmd":  "conda activate imgtrain && python server.py",
                "front_dir": None, "front_cmd": None,
            },
            {
                "id": "e9529", "name": "GPT-SoVITS 음성",
                "note": "감정복제 · 무료 TTS",
                "front_port": None, "back_port": 9529,
                "back_dir":  rf"{E}\2.인공지능_보이스\GPT-SoVITS",
                "back_exe":  None,
                "back_cmd":  "conda activate gptsovits && python server.py",
                "front_dir": None, "front_cmd": None,
            },
            {
                "id": "e9530", "name": "영상 엔진",
                "note": "3토글 local·hybrid·cloud | FastAPI + Vite",
                "front_port": 9531, "back_port": 9530,
                "back_dir":  rf"{E}\3.인공지능_영상\backend",
                "back_exe":  r"C:\Users\GAPER\miniconda3\envs\videogen\python.exe",
                "back_script": "server.py",
                "back_cmd":  None,
                "front_dir": rf"{E}\3.인공지능_영상\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "e9534", "name": "립싱크 엔진 백엔드",
                "note": "EchoMimic v3 · LatentSync",
                "front_port": None, "back_port": 9534,
                "back_dir":  rf"{E}\4.인공지능_영상+합성\backend",
                "back_exe":  None,
                "back_cmd":  "conda activate lipsync && python lipsync_engine.py",
                "front_dir": None, "front_cmd": None,
            },
            {
                "id": "e8188", "name": "ComfyUI 엔진",
                "note": "이미지 생성 워크플로우",
                "front_port": None, "back_port": None, "extra_port": 8188,
                "back_dir":  None, "back_exe":  None, "back_cmd":  None,
                "extra_dir": rf"{E}\3.인공지능_영상\ComfyUI",
                "extra_cmd": r'"C:\Users\GAPER\miniconda3\envs\imgtrain\python.exe" main.py --port 8188',
                "front_dir": None, "front_cmd": None,
                "engine_only": True,
            },
            {
                "id": "e11434", "name": "Ollama 두뇌",
                "note": "qwen2.5vl · qwen2.5:7b | 로컬 LLM",
                "front_port": None, "back_port": 11434, "extra_port": None,
                "back_dir":  rf"{E}\0.인공지능_두뇌\1_Ollama\program",
                "back_exe":  rf"{E}\0.인공지능_두뇌\1_Ollama\program\ollama.exe",
                "back_script": None,
                "back_args":   ["serve"],
                "back_cmd":    None,
                "front_dir": None, "front_cmd": None,
            },
        ]
    },
    {
        "key": "saas",
        "title": "SaaS 프로그램",
        "icon": "🚀",
        "items": [
            {
                "id": "s01", "name": "DREAM MACHINE",
                "note": "dreammachine.kr 운영 중",
                "front_port": 5101, "mobile_port": 5201, "back_port": 8101,
                "back_dir":  rf"{S}\01_DREAM_MACHINE\미친_기계장치\2.adapter",
                "back_exe":  rf"{S}\01_DREAM_MACHINE\미친_기계장치\2.adapter\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\01_DREAM_MACHINE\미친_기계장치\1.frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s02", "name": "다이아몬드 Special",
                "note": "유튜브 자동화 SaaS",
                "front_port": 5102, "back_port": 8102,
                "back_dir":  rf"{S}\02_다이아몬드_special\backend",
                "back_cmd":  rf'"{S}\02_다이아몬드_special\backend\.venv\Scripts\python.exe" -m uvicorn main:app --port 8102',
                "front_dir": rf"{S}\02_다이아몬드_special\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s03", "name": "v3 묵도",
                "note": "묵도 v3 · 유튜브 영상 자동제작 SaaS",
                "front_port": 5203, "mobile_port": 5203, "back_port": 8103,
                "back_dir":  rf"{S}\03_v3_묵도_1\backend",
                "back_exe":  None,
                "back_cmd":  "python -m uvicorn main:app --port 8103",
                "back_script": None,
                "front_dir": rf"{S}\03_v3_묵도_1\frontend",
                "front_cmd": "npm run preview -- --host 0.0.0.0",
                "extra_dir": r"E:\1._AI_SaaS 제작소\2.AI_제작_자료\_image_models",
                "extra_cmd": "이미지엔진_시작.bat",
            },
            {
                "id": "s04", "name": "미니멀 v4 효율",
                "note": "",
                "front_port": 5104, "back_port": 8104,
                "back_dir":  rf"{S}\04_미니멀_v4_효율\backend",
                "back_exe":  rf"{S}\04_미니멀_v4_효율\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\04_미니멀_v4_효율\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s05", "name": "미니멀 제3의길",
                "note": "",
                "front_port": 5105, "back_port": 8105,
                "back_dir":  rf"{S}\05_미니멀_제3의길\backend",
                "back_exe":  rf"{S}\05_미니멀_제3의길\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\05_미니멀_제3의길\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s06", "name": "OPUS UNUM",
                "note": "",
                "front_port": 5106, "back_port": 8106,
                "back_dir":  rf"{S}\06_OPUS_UNUM\backend",
                "back_exe":  rf"{S}\06_OPUS_UNUM\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\06_OPUS_UNUM\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s07", "name": "OPUS UNUM (free)",
                "note": "",
                "front_port": 5107, "back_port": 8107,
                "back_dir":  rf"{S}\07_OPUS_UNUM_free\backend",
                "back_exe":  rf"{S}\07_OPUS_UNUM_free\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\07_OPUS_UNUM_free\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s08", "name": "aribot_app",
                "note": "모바일 PWA",
                "front_port": 5108, "back_port": 8108,
                "back_dir":  rf"{S}\08_aribot_app\backend",
                "back_exe":  rf"{S}\08_aribot_app\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\08_aribot_app\pwa",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s09", "name": "다이아 Special 미니멀",
                "note": "",
                "front_port": 5109, "back_port": 8109,
                "back_dir":  rf"{S}\09_다이아_special_미니멀\backend",
                "back_exe":  rf"{S}\09_다이아_special_미니멀\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\09_다이아_special_미니멀\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s10", "name": "CEO CLI",
                "note": "",
                "front_port": 5110, "back_port": 8110,
                "back_dir":  rf"{S}\10_CEO_CLI\backend",
                "back_exe":  rf"{S}\10_CEO_CLI\backend\.venv\Scripts\python.exe",
                "back_script": "main.py",
                "front_dir": rf"{S}\10_CEO_CLI\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s11", "name": "moneylog",
                "note": "머니로그 공식",
                "front_port": 5111, "back_port": 8111,
                "back_dir":  rf"{S}\11_moneylog_official",
                "back_exe":  "python",
                "back_script": "moneylog_official.py",
                "front_dir": rf"{S}\11_moneylog_official\frontend",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s12", "name": "뮤지엄_수노AI",
                "note": "museum.lullabot.kr · Cloudflare Tunnel",
                "front_port": None, "mobile_port": None, "back_port": 8112,
                "mobile_url": "https://museum.lullabot.kr/",
                "back_dir":  rf"{S}\12_수노AI_홈페이지\뮤지엄",
                "back_exe":  rf"{S}\12_수노AI_홈페이지\뮤지엄\.venv\Scripts\python.exe",
                "back_cmd":  None,
                "back_script": "api.py",
                "back_args":   ["-X", "utf8", "api.py"],
                "front_dir": None, "front_cmd": None,
            },
            {
                "id": "s14", "name": "원클릭",
                "note": "",
                "front_port": 5114, "back_port": 8114,
                "back_dir":  rf"{S}\14_원클릭",
                "back_exe":  "node",
                "back_script": "server/index.js",
                "front_dir": rf"{S}\14_원클릭",
                "front_cmd": "npm run dev",
            },
            {
                "id": "s16", "name": "AI 큐레이터",
                "note": "흩어진 가치 정리 SaaS ✦ 운영 검증",
                "front_port": 5116, "back_port": 8116,
                "back_dir":  rf"{S}\16_AI 큐레이터\AI 큐레이터(PC 버젼)\backend",
                "back_exe":  rf"{S}\16_AI 큐레이터\AI 큐레이터(PC 버젼)\backend\.venv\Scripts\python.exe",
                "back_script": "app.py",
                "front_dir": rf"{S}\16_AI 큐레이터\AI 큐레이터(PC 버젼)\frontend",
                "front_cmd": "npm run dev",
            },
        ]
    },
    {
        "key": "tools",
        "title": "보조 도구",
        "icon": "🔧",
        "items": [
            {
                "id": "t7777", "name": "ScreenshotToPC",
                "note": "폰 캡처 자동저장",
                "front_port": None, "back_port": 7777,
                "back_dir":  r"C:\Users\Public\phone_paste_server",
                "back_exe":  "python",
                "back_script": "server.py",
                "front_dir": None, "front_cmd": None,
            },
        ]
    }
]

# ─────────────────────────────────────────────
#  Chrome 경로
# ─────────────────────────────────────────────
_CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]
CHROME_EXE = next((p for p in _CHROME_CANDIDATES if os.path.exists(p)), None)

# ─────────────────────────────────────────────
#  프로세스 추적
# ─────────────────────────────────────────────
PROCS = {}   # id → [Popen, ...]
LAUNCH_TIME = {}  # id → timestamp

def is_port_open(port):
    if not port:
        return False
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.08):
            return True
    except:
        return False

def kill_port(port):
    """포트 점유 PID + 자식 프로세스 트리 강제 종료 — cmd 직접 실행 (빠름)"""
    try:
        cmd = (
            f'for /f "tokens=5" %a in '
            f'(\'netstat -ano ^| findstr ":{port} "\') '
            f'do taskkill /PID %a /T /F >nul 2>&1'
        )
        subprocess.run(cmd, shell=True, capture_output=True,
                       creationflags=subprocess.CREATE_NO_WINDOW, timeout=4)
    except:
        pass

def kill_port_netstat(port):
    """netstat 백업 방식 — kill_port 실패 시 사용"""
    try:
        out = subprocess.check_output(
            f'netstat -ano', shell=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW
        )
        for line in out.splitlines():
            if f':{port}' in line and 'LISTENING' in line:
                parts = line.split()
                if parts:
                    pid = parts[-1]
                    if pid.isdigit() and int(pid) > 4:
                        subprocess.run(f'taskkill /PID {pid} /T /F', shell=True,
                                       capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    except:
        pass

def close_chrome_for_port(port):
    """Chrome DevTools Protocol로 해당 포트 탭 완전 종료"""
    import urllib.request, json as _json
    closed = False
    # CDP로 탭 목록 조회 후 해당 포트 URL 탭 닫기
    for dbg_port in range(9222, 9232):
        try:
            tabs = _json.loads(
                urllib.request.urlopen(
                    f'http://localhost:{dbg_port}/json', timeout=0.15
                ).read()
            )
            for tab in tabs:
                url = tab.get('url','')
                if f':{port}' in url or f'localhost:{port}' in url:
                    tid = tab.get('id','')
                    urllib.request.urlopen(
                        f'http://localhost:{dbg_port}/json/close/{tid}', timeout=0.5
                    )
                    closed = True
        except:
            pass

    if not closed:
        # CDP 없으면 PowerShell AutoClose — 모든 chrome 창 중 해당 포트 URL 포함된 것
        ps = (
            f'$sh = New-Object -ComObject Shell.Application; '
            f'$sh.Windows() | Where-Object {{$_.LocationURL -like "*:{port}*"}} | '
            f'ForEach-Object {{$_.Quit()}}'
        )
        try:
            subprocess.run(['powershell','-NoProfile','-Command',ps],
                           capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW, timeout=2)
        except: pass

        # 마지막 수단 — taskkill로 해당 포트 프로세스와 연결된 chrome PID kill
        try:
            out = subprocess.check_output('netstat -ano', shell=True, text=True,
                                          creationflags=subprocess.CREATE_NO_WINDOW)
            chrome_pids = set()
            for line in out.splitlines():
                if f':{port}' in line:
                    parts = line.split()
                    if parts and parts[-1].isdigit():
                        pid = int(parts[-1])
                        # chrome 프로세스인지 확인
                        try:
                            name = subprocess.check_output(
                                f'tasklist /FI "PID eq {pid}" /FO CSV /NH',
                                shell=True, text=True,
                                creationflags=subprocess.CREATE_NO_WINDOW
                            )
                            if 'chrome' in name.lower():
                                chrome_pids.add(pid)
                        except: pass
            for pid in chrome_pids:
                subprocess.run(f'taskkill /PID {pid} /F', shell=True,
                               capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
        except: pass

def wait_port_open(port, timeout=25):
    """포트가 실제로 열릴 때까지 대기 (최대 timeout초)"""
    import time as _t
    start = _t.time()
    while _t.time() - start < timeout:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.5):
                return True
        except:
            _t.sleep(0.5)
    return False

def launch(sid):
    cfg = None
    # custom_cards 우선 — UI 수정이 SECTIONS 하드코딩보다 우선 적용
    for card in load_custom_cards():
        if card.get("id") == sid:
            cfg = card
            break
    if not cfg:
        for sec in SECTIONS:
            for item in sec["items"]:
                if item["id"] == sid:
                    cfg = item
                    break
    if not cfg:
        return False

    procs = []

    # 백엔드
    if cfg.get("back_dir") and (cfg.get("back_script") or cfg.get("back_args")):
        exe = cfg.get("back_exe") or "python"
        if exe == "python":
            exe = sys.executable
        if not os.path.exists(exe):
            exe = sys.executable
        args = cfg.get("back_args") or [cfg["back_script"]]
        proc = subprocess.Popen(
            [exe] + args,
            cwd=cfg["back_dir"],
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        procs.append(proc)
        if cfg.get("back_port"):
            wait_port_open(cfg["back_port"])  # 포트 열릴 때까지 대기
        else:
            time.sleep(3)
    elif cfg.get("back_cmd"):
        proc = subprocess.Popen(
            cfg["back_cmd"], cwd=cfg.get("back_dir", "."),
            shell=True, creationflags=subprocess.CREATE_NO_WINDOW
        )
        procs.append(proc)
        if cfg.get("back_port"):
            wait_port_open(cfg["back_port"])
        else:
            time.sleep(3)

    # 프론트
    if cfg.get("front_dir") and cfg.get("front_cmd"):
        proc = subprocess.Popen(
            cfg["front_cmd"], cwd=cfg["front_dir"],
            shell=True, creationflags=subprocess.CREATE_NO_WINDOW
        )
        procs.append(proc)
        if cfg.get("front_port"):
            wait_port_open(cfg["front_port"])  # 프론트 포트 열리면 바로 크롬 오픈
        else:
            time.sleep(4)

    # 크롬 오픈 — PC 포트 (CDP 디버깅 포트 포함)
    port = cfg.get("front_port") or cfg.get("back_port")
    # 창 열기는 Electron(portal.html window.open)이 담당
    # 추가 서비스 (ComfyUI 등) 실행 + 탭 오픈
    extra_cmd  = cfg.get("extra_cmd")
    extra_dir  = cfg.get("extra_dir")
    extra_port = cfg.get("extra_port")
    if extra_cmd:
        subprocess.Popen(
            extra_cmd,
            cwd=extra_dir or ".",
            shell=True,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        time.sleep(3)
    if extra_port and chrome:
        subprocess.Popen([chrome, f"http://localhost:{extra_port}"],
                         creationflags=subprocess.CREATE_NO_WINDOW)

    # 모바일 — mobile_url 우선, 없으면 IP:mobile_port
    mobile_url = cfg.get("mobile_url")
    mobile_port = cfg.get("mobile_port")
    if mobile_url and chrome:
        time.sleep(1)
        subprocess.Popen([chrome, mobile_url],
                         creationflags=subprocess.CREATE_NO_WINDOW)
    elif mobile_port and chrome:
        time.sleep(1)
        subprocess.Popen([chrome, f"http://{LOCAL_IP}:{mobile_port}"],
                         creationflags=subprocess.CREATE_NO_WINDOW)

    PROCS.setdefault(sid, []).extend(procs)
    LAUNCH_TIME[sid] = time.time()
    all_ports = [p for p in [cfg.get("front_port"), cfg.get("back_port"), cfg.get("extra_port")] if p]
    _notify_curator("start", all_ports)
    return True

def close_service(sid):
    # 1. 포트 목록 수집 + Chrome 닫기는 별도 thread (blocking 방지)
    found = False
    ports_to_kill = []
    # custom_cards 우선 — UI 수정값 반영
    for card in load_custom_cards():
        if card.get("id") == sid:
            found = True
            for port_key in ("front_port", "mobile_port", "back_port", "extra_port"):
                p = card.get(port_key)
                if p:
                    ports_to_kill.append(p)
                    threading.Thread(target=close_chrome_for_port, args=(p,), daemon=True).start()
    if not found:
        for sec in SECTIONS:
            for item in sec["items"]:
                if item["id"] == sid:
                    found = True
                    for port_key in ("front_port", "mobile_port", "back_port", "extra_port"):
                        p = item.get(port_key)
                        if p:
                            ports_to_kill.append(p)
                            threading.Thread(target=close_chrome_for_port, args=(p,), daemon=True).start()

    # 2. 프로세스 kill
    for p in PROCS.get(sid, []):
        try:
            subprocess.call(
                ['taskkill', '/PID', str(p.pid), '/T', '/F'],
                creationflags=subprocess.CREATE_NO_WINDOW,
                timeout=3
            )
        except:
            pass
    PROCS.pop(sid, None)
    LAUNCH_TIME.pop(sid, None)

    # 3. 포트 강제 종료 (백업)
    for p in ports_to_kill:
        kill_port(p)
        kill_port_netstat(p)
    _notify_curator("stop", ports_to_kill)
    return True

def _notify_curator(action: str, ports: list):
    """큐레이터 엔진룸(8116)에 엔진 상태 변경 즉시 통보 (fire-and-forget, 실패 무시)."""
    import urllib.request as _ureq, json as _json
    def _send():
        ep = "stop" if action == "stop" else "start"
        for p in ports:
            try:
                data = _json.dumps({"port": p}).encode()
                req = _ureq.Request(
                    f"http://127.0.0.1:8116/gpu/{ep}",
                    data=data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                _ureq.urlopen(req, timeout=0.5)
            except Exception:
                pass
    threading.Thread(target=_send, daemon=True).start()

def get_status():
    import datetime
    from concurrent.futures import ThreadPoolExecutor
    all_items = []
    for sec in SECTIONS:
        all_items.extend(sec["items"])
    all_items.extend(load_custom_cards())

    def check(item):
        sid = item["id"]
        fp = item.get("front_port")
        bp = item.get("back_port")
        ep = item.get("extra_port")
        f_alive = is_port_open(fp) if fp else None
        b_alive = is_port_open(bp) if bp else None
        e_alive = is_port_open(ep) if ep else None
        alive = any(v for v in [f_alive, b_alive, e_alive] if v is not None)
        lt = LAUNCH_TIME.get(sid)
        lt_str = datetime.datetime.fromtimestamp(lt).strftime("%p %I시%M분") if lt else ""
        return sid, {"alive": alive, "front": f_alive, "back": b_alive, "extra": e_alive, "last": lt_str}

    result = {}
    with ThreadPoolExecutor(max_workers=16) as ex:
        for sid, val in ex.map(check, all_items):
            result[sid] = val
    return result

# ─────────────────────────────────────────────
#  HTTP 핸들러
# ─────────────────────────────────────────────
HTML_PATH    = os.path.join(os.path.dirname(__file__), "portal.html")
DATA_DIR     = os.path.join(os.path.dirname(__file__), "data")
GALLERY_DIR  = os.path.join(DATA_DIR, "gallery")
SETTINGS_DB  = os.path.join(DATA_DIR, "settings.json")  # 기존 호환 (PC 폴백)

# viewport key 허용 목록 (경로 traversal 방지)
_VALID_VK = {'pc', 'fold_closed', 'fold_open'}

def _settings_path(key='pc'):
    k = key if key in _VALID_VK else 'pc'
    return os.path.join(DATA_DIR, f"settings_{k}.json")
HIDDEN_DB    = os.path.join(DATA_DIR, "hidden_cards.json")
BG_ACTIVE    = os.path.join(os.path.dirname(__file__), "klimt_tree.jpg")
os.makedirs(GALLERY_DIR, exist_ok=True)
CARD_IMG_DIR   = os.path.join(DATA_DIR, 'card_images')
GALLERY_THUMB_DIR = os.path.join(DATA_DIR, 'gallery_thumbs')
os.makedirs(CARD_IMG_DIR, exist_ok=True)
os.makedirs(GALLERY_THUMB_DIR, exist_ok=True)

def make_gallery_thumb(src_path, name):
    """원본 이미지 → gallery_thumbs/<name>.webp (200×150) 자동 생성"""
    try:
        from PIL import Image
        thumb_path = os.path.join(GALLERY_THUMB_DIR, os.path.splitext(name)[0] + '.webp')
        img = Image.open(src_path).convert('RGB')
        img.thumbnail((440, 300), Image.LANCZOS)
        img.save(thumb_path, 'WEBP', quality=85)
        return thumb_path
    except Exception as e:
        print(f'[thumb] 생성 실패: {e}')
        return src_path  # 실패 시 원본 fallback

def make_all_thumbs():
    """기존 갤러리 이미지 일괄 썸네일 생성"""
    for fn in os.listdir(GALLERY_DIR):
        if fn.lower().endswith(('.jpg','jpeg','.png','.webp','.gif')):
            thumb = os.path.join(GALLERY_THUMB_DIR, os.path.splitext(fn)[0]+'.webp')
            if not os.path.exists(thumb):
                make_gallery_thumb(os.path.join(GALLERY_DIR, fn), fn)
    print(f'[thumb] 일괄 생성 완료')

import threading as _thr
_thr.Thread(target=make_all_thumbs, daemon=True).start()

def get_card_img_path(cid):
    for ext in ('jpg','jpeg','png','webp','gif'):
        p = os.path.join(CARD_IMG_DIR, f'{cid}.{ext}')
        if os.path.exists(p): return p, ext
    return None, None

def load_hidden():
    try:
        with open(HIDDEN_DB,"r",encoding="utf-8") as f: return set(json.load(f))
    except: return set()

def save_hidden(ids):
    with open(HIDDEN_DB,"w",encoding="utf-8") as f: json.dump(list(ids), f)

def load_settings(key='pc'):
    # key별 파일 우선, 없으면 기존 settings.json 폴백 후 자동 생성
    p = _settings_path(key)
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        # fold_closed / fold_open 미설정 → settings.json 폴백
        fallback = {}
        try:
            with open(SETTINGS_DB, "r", encoding="utf-8") as f:
                fallback = json.load(f)
        except:
            pass
        if key != 'pc' and fallback:
            # 첫 접속 시 폴백 값으로 해당 key 파일 자동 생성 (다음 로드부터 독립)
            try:
                with open(p, "w", encoding="utf-8") as f:
                    json.dump(fallback, f, ensure_ascii=False, indent=2)
            except:
                pass
        return fallback

def save_settings(data, key='pc'):
    p = _settings_path(key)
    existing = load_settings(key)
    existing.update(data)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

def gallery_list():
    items = []
    for fn in sorted(os.listdir(GALLERY_DIR)):
        if fn.lower().endswith(('.jpg','.jpeg','.png','.webp')):
            path = os.path.join(GALLERY_DIR, fn)
            items.append({
                "name": fn,
                "size": os.path.getsize(path),
                "active": os.path.exists(BG_ACTIVE) and
                          os.path.getsize(path) == os.path.getsize(BG_ACTIVE)
            })
    return items

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    protocol_version = "HTTP/1.0"  # keep-alive 비활성 → 요청마다 연결 닫음

    def send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        if path == "/":
            with open(HTML_PATH, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(data)

        elif path == "/api/detect":
            from urllib.parse import parse_qs
            qs = parse_qs(urlparse(self.path).query)
            fp = int(qs.get('front_port',['0'])[0]) or None
            bp = int(qs.get('back_port', ['0'])[0]) or None
            self.send_json(detect_by_port(fp, bp))

        elif path == "/api/custom_cards":
            # SECTIONS에 이미 있는 ID는 제외 (중복 방지)
            section_ids = {it["id"] for sec in SECTIONS for it in sec["items"]}
            cards = [c for c in load_custom_cards() if c.get("id") not in section_ids]
            self.send_json(cards)

        elif path.startswith("/api/custom_cards/delete/"):
            cid = path.split("/api/custom_cards/delete/")[1]
            cards = [c for c in load_custom_cards() if c.get("id") != cid]
            save_custom_cards(cards)
            self.send_json({"ok": True})

        elif path == "/api/cards_ts":
            self.send_json({"ts": cards_timestamp()})

        elif path == "/api/save_custom_card":
            pass  # POST에서 처리

        elif path == "/api/settings":
            from urllib.parse import parse_qs as _pqs
            _vk = _pqs(parsed.query).get('key', ['pc'])[0]
            self.send_json(load_settings(_vk))

        elif path == "/api/gallery":
            self.send_json(gallery_list())

        elif path.startswith("/api/gallery/img/"):
            from urllib.parse import unquote as _uq
            fn = _uq(path.split("/api/gallery/img/")[1])
            fp = os.path.join(GALLERY_DIR, fn)
            if os.path.exists(fp):
                with open(fp, "rb") as f: data = f.read()
                ext = fn.rsplit(".",1)[-1].lower()
                ct = {"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","webp":"image/webp"}.get(ext,"image/jpeg")
                self.send_response(200)
                self.send_header("Content-Type", ct)
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404); self.end_headers()

        elif path.startswith("/api/gallery/activate/"):
            from urllib.parse import unquote as _uq
            fn = _uq(path.split("/api/gallery/activate/")[1])
            fp = os.path.join(GALLERY_DIR, fn)
            if os.path.exists(fp):
                import shutil
                shutil.copy2(fp, BG_ACTIVE)
                self.send_json({"ok": True, "name": fn})
            else:
                self.send_json({"ok": False})

        elif path.startswith("/api/gallery/delete/"):
            from urllib.parse import unquote as _uq
            fn = _uq(path.split("/api/gallery/delete/")[1])
            fp = os.path.join(GALLERY_DIR, fn)
            try:
                os.remove(fp)
                self.send_json({"ok": True})
            except:
                self.send_json({"ok": False})

        elif path == "/upload_bg":
            pass  # POST에서 처리

        elif path in ("/icon_192.png", "/icon_512.png", "/favicon.png"):
            img_path = os.path.join(os.path.dirname(HTML_PATH), path.lstrip("/"))
            try:
                with open(img_path, "rb") as f: data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.end_headers()
                self.wfile.write(data)
            except:
                self.send_response(404); self.end_headers()

        elif path == "/manifest.json":
            mf_path = os.path.join(os.path.dirname(HTML_PATH), "manifest.json")
            try:
                with open(mf_path, "rb") as f: data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/manifest+json")
                self.end_headers()
                self.wfile.write(data)
            except:
                self.send_response(404); self.end_headers()

        elif path == "/klimt_tree.jpg":
            img_path = os.path.join(os.path.dirname(HTML_PATH), "klimt_tree.jpg")
            try:
                with open(img_path, "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "image/jpeg")
                self.end_headers()
                self.wfile.write(data)
            except:
                self.send_response(404)
                self.end_headers()

        elif path == "/sections":
            hidden = load_hidden()
            # custom_cards 오버라이드 맵 (ID → custom 데이터)
            custom_override = {c["id"]: c for c in load_custom_cards()}
            out = []
            for sec in SECTIONS:
                items = []
                for it in sec["items"]:
                    if it["id"] in hidden: continue
                    ov = custom_override.get(it["id"], {})  # 저장된 수정값
                    merged = {**it, **ov}                   # custom_cards 값 우선
                    items.append({
                        "id": merged["id"], "name": merged.get("name", it["name"]),
                        "note": merged.get("note", it.get("note","")),
                        "front_port":  merged.get("front_port"),
                        "mobile_port": merged.get("mobile_port"),
                        "mobile_url":  merged.get("mobile_url"),
                        "back_port":   merged.get("back_port"),
                        "back_dir":    merged.get("back_dir"),
                        "back_exe":    merged.get("back_exe"),
                        "back_script": merged.get("back_script"),
                        "back_cmd":    merged.get("back_cmd"),
                        "front_dir":   merged.get("front_dir"),
                        "front_cmd":   merged.get("front_cmd"),
                        "extra_dir":   merged.get("extra_dir"),
                        "extra_cmd":   merged.get("extra_cmd"),
                        "extra_port":  merged.get("extra_port"),
                        "section_key": sec["key"],
                        "engine_only": merged.get("engine_only", False),
                    })
                out.append({"key": sec["key"], "title": sec["title"],
                            "icon": sec["icon"], "items": items})
            self.send_json({"sections": out, "local_ip": LOCAL_IP})

        elif path.startswith("/api/delete_card/"):
            cid = path.split("/api/delete_card/")[1]
            hidden = load_hidden()
            hidden.add(cid)
            save_hidden(hidden)
            self.send_json({"ok": True})

        elif path == "/status":
            self.send_json(get_status())

        elif path == "/api/open-chrome":
            from urllib.parse import parse_qs
            qs = parse_qs(urlparse(self.path).query)
            sid  = qs.get('sid',  [''])[0]
            port = qs.get('port', [''])[0]
            if sid and port and CHROME_EXE:
                # --user-data-dir: 독립 Chrome 인스턴스 → 새 PID 생성 → 추적 가능
                import tempfile
                udd = os.path.join(tempfile.gettempdir(), f'chrome_saas_{sid}')
                proc = subprocess.Popen(
                    [CHROME_EXE, f'--user-data-dir={udd}', f'http://localhost:{port}'],
                    creationflags=subprocess.CREATE_NO_WINDOW
                )
                PROCS.setdefault(sid, []).append(proc)
            self.send_json({"ok": True})

        elif path.startswith("/launch/"):
            sid = path.split("/")[-1]
            def run():
                launch(sid)
            threading.Thread(target=run, daemon=True).start()
            self.send_json({"ok": True})

        elif path.startswith("/close/"):
            sid = path.split("/")[-1]
            # 즉시 응답 후 백그라운드 종료
            self.send_json({"ok": True})
            threading.Thread(target=close_service, args=(sid,), daemon=True).start()

        elif path == "/closeall":
            self.send_json({"ok": True})
            def _closeall():
                for sec in SECTIONS:
                    for it in sec["items"]:
                        close_service(it["id"])
            threading.Thread(target=_closeall, daemon=True).start()

        elif path == "/api/restart-electron":
            # 쿼리에서 창 크기 읽기
            from urllib.parse import parse_qs as _pqs
            _q = _pqs(parsed.query)
            _w = int(_q.get('w', [0])[0] or 0)
            _h = int(_q.get('h', [0])[0] or 0)
            # settings_pc.json에 창 크기 직접 저장 (PC 전용)
            if _w >= 400 and _h >= 200:
                try:
                    save_settings({'win-width': _w, 'win-height': _h}, 'pc')
                except: pass
            self.send_json({"ok": True})
            portal_dir = os.path.dirname(os.path.abspath(__file__))
            def _restart():
                import time as _t
                _t.sleep(0.8)
                # PowerShell Start-Process 방식 — DETACHED cmd 조합의 실행 실패 문제 우회
                ps_cmd = (
                    f'Start-Sleep -Milliseconds 500; '
                    f'taskkill /f /im electron.exe 2>$null; '
                    f'Start-Sleep -Milliseconds 800; '
                    f'Start-Process -FilePath "cmd" '
                    f'-ArgumentList "/c cd /d \\\"{portal_dir}\\\" && npx electron ." '
                    f'-WorkingDirectory "{portal_dir}" '
                    f'-WindowStyle Hidden'
                )
                subprocess.Popen(
                    ['powershell', '-WindowStyle', 'Hidden', '-NonInteractive', '-Command', ps_cmd],
                    cwd=portal_dir,
                    creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW
                )
            threading.Thread(target=_restart, daemon=False).start()

        # ── 갤러리 썸네일 서빙 (200×150 WebP) ──
        elif path.startswith('/api/gallery/thumb/'):
            from urllib.parse import unquote as _uq
            fn = _uq(path.split('/api/gallery/thumb/')[1])
            thumb_path = os.path.join(GALLERY_THUMB_DIR, os.path.splitext(fn)[0]+'.webp')
            if not os.path.exists(thumb_path):
                orig = os.path.join(GALLERY_DIR, fn)
                if os.path.exists(orig):
                    make_gallery_thumb(orig, fn)
                else:
                    self.send_response(404); self.end_headers(); return
            with open(thumb_path,'rb') as f: data=f.read()
            self.send_response(200)
            self.send_header('Content-Type','image/webp')
            self.send_header('Cache-Control','max-age=86400')
            self.send_header('Access-Control-Allow-Origin','*')
            self.end_headers(); self.wfile.write(data)

        # ── 카드 이미지 서빙 ──
        elif path.startswith('/api/card_img/') and not path.startswith('/api/card_img_'):
            cid = path.split('/api/card_img/')[1]
            imgp, ext = get_card_img_path(cid)
            if imgp:
                with open(imgp,'rb') as f: data=f.read()
                ct={'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','webp':'image/webp','gif':'image/gif'}.get(ext,'image/jpeg')
                self.send_response(200)
                self.send_header('Content-Type', ct)
                self.send_header('Access-Control-Allow-Origin','*')
                self.send_header('Cache-Control','no-cache')
                self.end_headers(); self.wfile.write(data)
            else:
                self.send_response(404); self.end_headers()

        elif path.startswith('/api/card_img_delete/'):
            cid = path.split('/api/card_img_delete/')[1]
            imgp, _ = get_card_img_path(cid)
            if imgp and os.path.exists(imgp):
                os.remove(imgp)
                self.send_json({'ok': True})
            else:
                self.send_json({'ok': False})

        elif path.startswith('/api/card_favicon/'):
            port = path.split('/api/card_favicon/')[1].strip('/')
            import urllib.request as _ur
            ok=False; fdata=b''; fct='image/x-icon'
            for furl in [f'http://localhost:{port}/favicon.ico',f'http://localhost:{port}/favicon.png',f'http://localhost:{port}/static/favicon.ico']:
                try:
                    req=_ur.Request(furl,headers={'User-Agent':'Mozilla/5.0'})
                    with _ur.urlopen(req,timeout=2) as r:
                        fdata=r.read(); fct=r.headers.get('Content-Type','image/x-icon'); ok=True; break
                except: pass
            if ok and fdata:
                self.send_response(200)
                self.send_header('Content-Type',fct)
                self.send_header('Access-Control-Allow-Origin','*')
                self.end_headers(); self.wfile.write(fdata)
            else:
                self.send_response(404); self.end_headers()

        elif path.endswith('.js') and '/' not in path.lstrip('/'):
            # 포털 폴더의 .js 파일 직접 서빙 (design_picker.js 등)
            fname = path.lstrip('/')
            fpath = os.path.join(os.path.dirname(HTML_PATH), fname)
            if os.path.exists(fpath):
                with open(fpath, 'rb') as f: data = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/javascript; charset=utf-8')
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404); self.end_headers()

        elif path.endswith('.html') and '/' not in path.lstrip('/'):
            # 포털 폴더의 .html 파일 직접 서빙 (ai_concepts.html 등)
            fname = path.lstrip('/')
            fpath = os.path.join(os.path.dirname(HTML_PATH), fname)
            if os.path.exists(fpath):
                with open(fpath, 'rb') as f: data = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404); self.end_headers()

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)

        if path == "/api/settings":
            try:
                from urllib.parse import parse_qs as _pqs
                _vk = _pqs(parsed.query).get('key', ['pc'])[0]
                data = json.loads(body.decode("utf-8"))
                save_settings(data, _vk)
                self.send_json({"ok": True})
            except:
                self.send_json({"ok": False})

        elif path == "/api/save_custom_card":
            try:
                data = json.loads(body.decode("utf-8"))
                cards = load_custom_cards()
                # ID 없으면 생성
                if not data.get("id"):
                    data["id"] = "custom_" + str(int(time.time()))
                # 기존 있으면 업데이트
                existing = next((i for i,c in enumerate(cards) if c.get("id")==data["id"]), None)
                if existing is not None: cards[existing] = data
                else: cards.append(data)
                save_custom_cards(cards)
                self.send_json({"ok": True, "id": data["id"]})
            except Exception as e:
                self.send_json({"ok": False, "error": str(e)})

        elif path in ("/upload_bg", "/api/gallery/upload"):
            try:
                ct = self.headers.get('Content-Type', '')
                img_data = None
                orig_name = "image.jpg"
                if 'boundary=' in ct:
                    boundary = ct.split('boundary=')[1].encode()
                    parts = body.split(b'--' + boundary)
                    for part in parts:
                        if b'filename=' in part:
                            # 파일명 추출
                            if b'filename="' in part:
                                orig_name = part.split(b'filename="')[1].split(b'"')[0].decode(errors='replace')
                            if b'\r\n\r\n' in part:
                                img_data = part.split(b'\r\n\r\n', 1)[1].rstrip(b'\r\n--')
                                break
                if img_data:
                    import shutil, hashlib
                    # 갤러리에 저장 (이름 중복 방지)
                    ext = orig_name.rsplit(".",1)[-1].lower() if "." in orig_name else "jpg"
                    safe_name = orig_name.rsplit(".",1)[0][:30].replace(" ","_") + f".{ext}"
                    gallery_path = os.path.join(GALLERY_DIR, safe_name)
                    with open(gallery_path, 'wb') as f: f.write(img_data)
                    # 썸네일 자동 생성 (백그라운드)
                    _thr.Thread(target=make_gallery_thumb, args=(gallery_path, safe_name), daemon=True).start()
                    # 현재 배경으로도 설정
                    shutil.copy2(gallery_path, BG_ACTIVE)
                    self.send_json({"ok": True, "name": safe_name})
                else:
                    self.send_json({"ok": False, "error": "no image"})
            except Exception as e:
                self.send_json({"ok": False, "error": str(e)})

        # ── 카드 이미지 업로드 ──
        elif path == '/api/card_img_upload':
            try:
                from urllib.parse import parse_qs as _pqs2
                cid = _pqs2(parsed.query).get('id',[''])[0]
                if not cid: self.send_json({'ok':False,'error':'no id'}); return
                ct_hdr = self.headers.get('Content-Type','')
                img_data=None; orig_ext='jpg'
                if 'boundary=' in ct_hdr:
                    boundary=ct_hdr.split('boundary=')[1].encode()
                    parts=body.split(b'--'+boundary)
                    for part in parts:
                        if b'filename=' in part:
                            fn=part.split(b'filename="')[1].split(b'"')[0].decode(errors='replace') if b'filename="' in part else 'img.jpg'
                            orig_ext=fn.rsplit('.',1)[-1].lower() if '.' in fn else 'jpg'
                            if orig_ext not in ('jpg','jpeg','png','webp','gif'): orig_ext='jpg'
                            if b'\r\n\r\n' in part:
                                img_data=part.split(b'\r\n\r\n',1)[1].rstrip(b'\r\n--'); break
                else:
                    img_data=body; orig_ext='jpg'
                if img_data:
                    for ext in ('jpg','jpeg','png','webp','gif'):
                        old=os.path.join(CARD_IMG_DIR,f'{cid}.{ext}')
                        if os.path.exists(old): os.remove(old)
                    save_path=os.path.join(CARD_IMG_DIR,f'{cid}.{orig_ext}')
                    with open(save_path,'wb') as f: f.write(img_data)
                    self.send_json({'ok':True,'ext':orig_ext})
                else:
                    self.send_json({'ok':False,'error':'no image'})
            except Exception as e:
                self.send_json({'ok':False,'error':str(e)})

        elif path == "/api/start-curator":
            _ps = (r"E:\1._AI_SaaS 제작소\1.SaaS_제품"
                   r"\16_AI 큐레이터\AI 큐레이터(PC 버젼)\_원클릭_시작.ps1")
            subprocess.Popen(
                ["powershell", "-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass", "-File", _ps],
                creationflags=subprocess.CREATE_NO_WINDOW
            )
            self.send_json({"ok": True})

        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 9900))
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"포털 서버: http://localhost:{PORT}")
    server.serve_forever()
