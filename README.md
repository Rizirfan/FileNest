# 🔐 FileNest - Secure File Organizer

An open-source, secure file organization and management system built with Flask. Automatically organize your files into smart categories while maintaining security through password protection.

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## 📱 Download APK

Get the latest Android build from GitHub Releases:

**https://github.com/Rizirfan/FileNest/releases**

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Developer](#-developer)

## ✨ Features

- **Smart File Categorization** - Automatically organize files into categories:
  - 🖼️ Images (JPG, PNG, GIF, SVG, etc.)
  - 📄 Documents (PDF, DOCX, TXT, etc.)
  - 🎵 Audio (MP3, WAV, FLAC, etc.)
  - 🎬 Videos (MP4, MKV, AVI, etc.)
  - 📦 Archives (ZIP, RAR, 7Z, etc.)
  - 💻 Code (PY, JS, HTML, CSS, etc.)

- **Password Protected Access** - Secure authentication to protect your files
- **Secure File Vault** - Move sensitive files to a protected folder
- **One-Click Organization** - Organize all files with a single button click
- **Automatic Conflict Handling** - Smart handling of files with duplicate names
- **Modern Web Interface** - Clean, intuitive, and responsive design
- **Real-time Updates** - Live dashboard with file statistics
- **Fast & Lightweight** - Built with Flask for quick performance
- **Open Source** - Fully customizable and community-driven

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Python 3.8+** | Backend programming language |
| **Flask 2.0+** | Web framework |
| **HTML5** | Frontend structure |
| **CSS3** | Styling and animations |
| **JavaScript** | Dynamic interactions |
| **File System API** | File management operations |

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git (optional, for cloning)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rizirfan/FileNest.git
cd FileNest
```

Or download the ZIP file and extract it.

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Navigate to Code Directory

```bash
cd Code
```

### Step 4: Run the Application

```bash
python app.py
```

### Step 5: Access in Browser

Open your browser and navigate to:

```
http://localhost:5000
```

### Step 6: Login

Use the default credentials:
- **Username:** admin
- **Password:** Irfan@786

⚠️ **Important:** Change the default password immediately after your first login for security.

## 🚀 Usage

### Dashboard Overview

1. **Total Items** - View the total number of files in your watch directory
2. **Media Library** - See the count of organized media files
3. **Protected** - Track your secure vault files

### Organizing Files

1. Enter your directory path in the search bar
2. Click **"Organize Now"** button
3. Files will be automatically categorized and moved
4. Watch the real-time progress on your dashboard

### Protecting Files

1. Navigate to the file you want to protect
2. Click the **"Vault"** button
3. File moves to the **Secure Vault** section
4. Access protected files with your password

### Changing Password

1. Click **Settings** in the sidebar
2. Enter your current password
3. Set your new password
4. Confirm the new password
5. Click **Update Password**

## ⚙️ Configuration

### Default Configuration

Create a `config.py` file in the `Code` directory to customize:

```python
# Default watch directory
WATCH_DIR = os.path.expanduser("~/Downloads")

# Application port
PORT = 5000

# Debug mode
DEBUG = False

# Session timeout (in minutes)
SESSION_TIMEOUT = 30
```

### Environment Variables

```bash
# Set custom port
export FLASK_PORT=5000

# Enable debug mode (development only)
export FLASK_DEBUG=True

# Set watch directory
export WATCH_DIR=/path/to/directory
```

## 🖥️ Build Desktop Software (Windows .exe)

This project can be packaged as desktop software using `pywebview` + `PyInstaller`.

### Steps

1. Install dependencies:
   ```powershell
   pip install -r Downloads\shdesignmeld projects\projects\secure_vault_project\Documents\requirements.txt
   ```
2. Build executable:
   ```powershell
   cd "Downloads\shdesignmeld projects\projects\secure_vault_project\Code"
   .\build_windows_exe.ps1
   ```

### Output

- EXE: `Downloads\shdesignmeld projects\projects\secure_vault_project\Code\dist\FileNest\FileNest.exe`

## 📁 Project Structure

```
FileNest/
├── Downloads/
│   └── shdesignmeld projects/projects/secure_vault_project/
│       ├── Code/
│       │   ├── app.py                 # Main Flask application
│       │   ├── desktop_app.py         # Desktop launcher (pywebview)
│       │   ├── build_windows_exe.ps1  # Windows EXE build script
│       │   ├── file_organizer.py      # File organization logic
│       │   └── templates/             # HTML templates
│       └── Documents/
│           └── requirements.txt       # Python dependencies
├── README.md                  # This file
└── .gitignore                # Git ignore rules
```

## 📋 Requirements

All dependencies are listed in `Downloads\shdesignmeld projects\projects\secure_vault_project\Documents\requirements.txt`:

```
flask>=2.0.0
watchdog>=3.0.0
pywebview>=5.1
pyinstaller>=6.10.0
```

## 🔒 Security Features

- **Password Authentication** - Secure login system
- **Session Management** - Automatic session timeout
- **File Encryption** - Secure vault for sensitive files
- **Password Hashing** - Industry-standard password security
- **Input Validation** - Protection against malicious inputs

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
python app.py --port 5001
```

### Module Not Found Error

```bash
# Reinstall all dependencies
pip install --upgrade -r requirements.txt

# Or use Python3 explicitly
python3 -m pip install -r requirements.txt
```

### Permission Denied (Linux/Mac)

```bash
# Use python3 instead of python
python3 app.py

# Or add execute permission
chmod +x app.py
```

### Files Not Organizing

1. Ensure the directory path is correct
2. Check folder permissions
3. Verify file extensions are recognized
4. Check browser console for errors (F12)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 code style
- Add comments for complex logic
- Test your changes thoroughly
- Update README if adding new features

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

## 👨‍💻 Developer

**Rizirfan** - Full Stack Developer

- 🔗 [GitHub Profile](https://github.com/Rizirfan)
- ⭐ [Project Repository](https://github.com/Rizirfan/FileNest)
- 💬 [Get Support](https://github.com/Rizirfan/FileNest/issues)

## 🙏 Acknowledgments

- Thanks to Flask community for the amazing framework
- Inspired by the need for simple, secure file management
- Built with ❤️ for developers and users

## 📞 Support & Issues

Found a bug or have a suggestion? Please open an issue on [GitHub Issues](https://github.com/Rizirfan/FileNest/issues)

## 🌟 Show Your Support

If you like this project, please consider:
- ⭐ Starring the repository
- 🍴 Forking and contributing
- 🐛 Reporting bugs
- 💡 Suggesting improvements

---

**Happy Organizing! 🎉**

*FileNest - Your secure file management solution*

Last Updated: February 20, 2026
