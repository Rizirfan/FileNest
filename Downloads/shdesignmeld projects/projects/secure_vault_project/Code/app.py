from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, send_file, Response
import os
import shutil
import hashlib
import secrets
from pathlib import Path
from typing import Dict, List
import zipfile
import io

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

# ============================================================
# CONFIGURATION
# ============================================================
FILE_EXTENSION_MAP: Dict[str, List[str]] = {
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.tif', '.raw', '.psd', '.ai'],
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.md', '.epub'],
    'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus', '.aiff'],
    'Videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg', '.mpg', '.3gp'],
    'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso'],
    'Code': ['.py', '.js', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.html', '.css', '.json', '.xml', '.yaml', '.yml'],
}

EXTENSION_TO_CATEGORY: Dict[str, str] = {}
for category, extensions in FILE_EXTENSION_MAP.items():
    for ext in extensions:
        EXTENSION_TO_CATEGORY[ext.lower()] = category

# Default watch directory (Downloads folder)
DEFAULT_WATCH_DIR = os.path.join(os.path.expanduser('~'), 'Downloads')

# Default password (change this!)
DEFAULT_PASSWORD = "Irfan@786"

# Protected files directory
PROTECTED_DIR = "protected_files"


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def get_category_for_file(filename: str) -> str:
    """Determine category for a file"""
    ext = Path(filename).suffix.lower()
    return EXTENSION_TO_CATEGORY.get(ext, 'Others')


def generate_unique_filename(destination_dir: str, filename: str) -> str:
    """Generate unique filename if conflict exists"""
    file_path = Path(destination_dir) / filename
    if not file_path.exists():
        return filename
    
    path_obj = Path(filename)
    name = path_obj.stem
    extension = path_obj.suffix
    
    counter = 1
    while True:
        new_filename = f"{name}({counter}){extension}"
        new_path = Path(destination_dir) / new_filename
        if not new_path.exists():
            return new_filename
        counter += 1


def get_directory_structure(watch_dir: str) -> Dict:
    """Get directory structure with file information"""
    structure = {
        'root': watch_dir,
        'categories': {},
        'others': [],
        'total_files': 0
    }
    
    # Initialize category folders
    for category in FILE_EXTENSION_MAP.keys():
        category_path = os.path.join(watch_dir, category)
        if os.path.exists(category_path):
            files = []
            for f in os.listdir(category_path):
                filepath = os.path.join(category_path, f)
                if os.path.isfile(filepath):
                    files.append({
                        'name': f,
                        'size': os.path.getsize(filepath),
                        'path': filepath,
                        'category': category
                    })
            structure['categories'][category] = files
            structure['total_files'] += len(files)
    
    # Others folder
    others_path = os.path.join(watch_dir, 'Others')
    if os.path.exists(others_path):
        for f in os.listdir(others_path):
            filepath = os.path.join(others_path, f)
            if os.path.isfile(filepath):
                structure['others'].append({
                    'name': f,
                    'size': os.path.getsize(filepath),
                    'path': filepath,
                    'category': 'Others'
                })
        structure['total_files'] += len(structure['others'])
    
    # Root level files (unorganized)
    root_files = []
    for f in os.listdir(watch_dir):
        filepath = os.path.join(watch_dir, f)
        if os.path.isfile(filepath):
            root_files.append({
                'name': f,
                'size': os.path.getsize(filepath),
                'path': filepath,
                'category': get_category_for_file(f)
            })
    structure['root_files'] = root_files
    structure['total_files'] += len(root_files)
    
    return structure


def organize_all_files(watch_dir: str) -> Dict:
    """Organize all files in directory"""
    results = {'organized': 0, 'errors': 0, 'skipped': 0}
    
    # Ensure category folders exist
    for category in FILE_EXTENSION_MAP.keys():
        category_path = os.path.join(watch_dir, category)
        if not os.path.exists(category_path):
            os.makedirs(category_path)
    
    others_path = os.path.join(watch_dir, 'Others')
    if not os.path.exists(others_path):
        os.makedirs(others_path)
    
    # Process each file in root
    for f in os.listdir(watch_dir):
        filepath = os.path.join(watch_dir, f)
        
        # Skip directories and hidden files
        if os.path.isdir(filepath) or f.startswith('.'):
            results['skipped'] += 1
            continue
        
        # Skip if it's the protected folder
        if f == PROTECTED_DIR:
            results['skipped'] += 1
            continue
        
        category = get_category_for_file(f)
        
        if category == 'Others':
            destination_dir = others_path
        else:
            destination_dir = os.path.join(watch_dir, category)
        
        unique_filename = generate_unique_filename(destination_dir, f)
        destination_path = os.path.join(destination_dir, unique_filename)
        
        try:
            shutil.move(filepath, destination_path)
            results['organized'] += 1
        except Exception as e:
            print(f"Error moving {f}: {e}")
            results['errors'] += 1
    
    return results


# ============================================================
# ROUTES
# ============================================================

@app.route('/')
def index():
    """Landing page with project information and download options"""
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page with secret lock"""
    error = None
    
    if request.method == 'POST':
        password = request.form.get('password', '')
        if hash_password(password) == hash_password(DEFAULT_PASSWORD):
            session['authenticated'] = True
            session['password'] = hash_password(password)  # Store hashed password
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid password! Try again.'
    
    return render_template('login.html', error=error)


@app.route('/app')
def app_dashboard():
    """Main dashboard showing file organization status"""
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('dashboard'))


@app.route('/logout')
def logout():
    """Logout and clear session"""
    session.clear()
    return redirect(url_for('login'))


@app.route('/dashboard')
def dashboard():
    """Main dashboard showing file organization status"""
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    
    watch_dir = session.get('watch_dir', DEFAULT_WATCH_DIR)
    
    # Ensure directory exists
    if not os.path.exists(watch_dir):
        try:
            os.makedirs(watch_dir)
        except:
            watch_dir = os.path.expanduser('~')
    
    structure = get_directory_structure(watch_dir)
    structure['watch_dir'] = watch_dir
    
    return render_template('dashboard.html', structure=structure)


@app.route('/organize')
def organize_files():
    """Organize all files in the directory"""
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    
    watch_dir = session.get('watch_dir', DEFAULT_WATCH_DIR)
    results = organize_all_files(watch_dir)
    
    return render_template('result.html', results=results, action='Organized')


@app.route('/set_directory', methods=['POST'])
def set_directory():
    """Set the directory to watch"""
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    
    directory = request.form.get('directory', DEFAULT_WATCH_DIR)
    if os.path.exists(directory) and os.path.isdir(directory):
        session['watch_dir'] = directory
    
    return redirect(url_for('dashboard'))


@app.route('/change_password', methods=['GET', 'POST'])
def change_password():
    """Change the password"""
    global DEFAULT_PASSWORD
    
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    
    error = None
    success = None
    
    if request.method == 'POST':
        current_password = request.form.get('current_password', '')
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if hash_password(current_password) != hash_password(DEFAULT_PASSWORD):
            error = 'Current password is incorrect!'
        elif new_password != confirm_password:
            error = 'New passwords do not match!'
        elif len(new_password) < 4:
            error = 'Password must be at least 4 characters!'
        else:
            # In a real app, you'd save this to a config file
            DEFAULT_PASSWORD = new_password
            success = 'Password changed successfully!'
    
    return render_template('change_password.html', error=error, success=success)


@app.route('/protect_file', methods=['POST'])
def protect_file():
    """Protect a file by moving it to protected folder"""
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    
    filepath = request.form.get('filepath', '')
    watch_dir = session.get('watch_dir', DEFAULT_WATCH_DIR)
    
    if filepath and os.path.exists(filepath):
        # Create protected folder if not exists
        protected_path = os.path.join(watch_dir, PROTECTED_DIR)
        if not os.path.exists(protected_path):
            os.makedirs(protected_path)
        
        filename = os.path.basename(filepath)
        unique_filename = generate_unique_filename(protected_path, filename)
        destination = os.path.join(protected_path, unique_filename)
        
        try:
            shutil.move(filepath, destination)
        except Exception as e:
            print(f"Error protecting file: {e}")
    
    return redirect(url_for('dashboard'))


@app.route('/unprotect_file', methods=['POST'])
def unprotect_file():
    """Unprotect a file by moving it back to root"""
    if 'authenticated' not in session:
        return redirect(url_for('login'))
    
    filepath = request.form.get('filepath', '')
    watch_dir = session.get('watch_dir', DEFAULT_WATCH_DIR)
    
    if filepath and os.path.exists(filepath):
        filename = os.path.basename(filepath)
        destination = os.path.join(watch_dir, filename)
        
        # Handle conflict
        if os.path.exists(destination):
            filename = generate_unique_filename(watch_dir, filename)
            destination = os.path.join(watch_dir, filename)
        
        try:
            shutil.move(filepath, destination)
        except Exception as e:
            print(f"Error unprotecting file: {e}")
    
    return redirect(url_for('dashboard'))


@app.route('/get_protected_files')
def get_protected_files():
    """Get list of protected files"""
    if 'authenticated' not in session:
        return {'error': 'Not authenticated'}
    
    watch_dir = session.get('watch_dir', DEFAULT_WATCH_DIR)
    protected_path = os.path.join(watch_dir, PROTECTED_DIR)
    
    files = []
    if os.path.exists(protected_path):
        for f in os.listdir(protected_path):
            filepath = os.path.join(protected_path, f)
            if os.path.isfile(filepath):
                files.append({
                    'name': f,
                    'size': os.path.getsize(filepath),
                    'path': filepath
                })
    
    return {'files': files}


# ============================================================
# STATIC FILES
# ============================================================

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)


@app.route('/download/zip')
def download_zip():
    """Download the project as ZIP file"""
    try:
        # Create a ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Get the project root directory
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            
            # Add all files from Code and Documents directories
            for root, dirs, files in os.walk(project_root):
                # Skip certain directories
                dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git', '.vscode', 'protected_files', '.pytest_cache', 'instance']]
                
                for file in files:
                    # Skip certain files
                    if file.endswith(('.pyc', '.pyo', '.db', '.log', '.exe')):
                        continue
                    
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, os.path.dirname(project_root))
                    zip_file.write(file_path, arcname)
        
        zip_buffer.seek(0)
        
        # Send the ZIP file
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='secure-file-organizer.zip'
        )
    
    except Exception as e:
        print(f"Error creating ZIP: {e}")
        return redirect(url_for('index'))


@app.route('/download/source')
def download_source():
    """Alternative route for downloading source code"""
    return download_zip()


# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("=" * 50)
    print("🔐 Secure File Organizer Platform")
    print("=" * 50)
    print(f"Default password: {DEFAULT_PASSWORD}")
    print(f"Watch directory: {DEFAULT_WATCH_DIR}")
    print("=" * 50)
    print("Starting server at http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)
