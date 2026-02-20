#!/usr/bin/env python3
"""
File Organizer Script
Monitors a directory and automatically organizes files into subfolders based on file extensions.
Supports both one-time organization and continuous watch mode.
"""

import os
import shutil
import argparse
import time
from pathlib import Path
from typing import Dict, List

# Try to import watchdog, install if not available
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    print("watchdog library not found. Install it with: pip install watchdog")
    print("Watch mode will not be available.")


# ============================================================
# CONFIGURATION: File Extension Mapping
# ============================================================
FILE_EXTENSION_MAP: Dict[str, List[str]] = {
    'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.tif', '.raw', '.psd', '.ai'],
    'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.md', '.epub'],
    'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus', '.aiff'],
    'Videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpeg', '.mpg', '.3gp'],
    'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso'],
    'Code': ['.py', '.js', '.java', '.c', '.cpp', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.html', '.css', '.json', '.xml', '.yaml', '.yml'],
    'Executables': ['.exe', '.msi', '.dmg', '.app', '.deb', '.rpm', '.sh', '.bat', '.cmd'],
}

# Create reverse mapping for quick lookup
EXTENSION_TO_CATEGORY: Dict[str, str] = {}
for category, extensions in FILE_EXTENSION_MAP.items():
    for ext in extensions:
        EXTENSION_TO_CATEGORY[ext.lower()] = category


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def get_category_for_file(filename: str) -> str:
    """
    Determine the category for a file based on its extension.
    
    Args:
        filename: The name of the file
        
    Returns:
        The category name or 'Others' if not found
    """
    ext = Path(filename).suffix.lower()
    return EXTENSION_TO_CATEGORY.get(ext, 'Others')


def generate_unique_filename(destination_dir: str, filename: str) -> str:
    """
    Generate a unique filename if a file with the same name exists.
    Appends a number in parentheses like 'report(1).pdf'
    
    Args:
        destination_dir: The directory where the file will be moved
        filename: The original filename
        
    Returns:
        A unique filename that doesn't conflict with existing files
    """
    file_path = Path(destination_dir) / filename
    
    if not file_path.exists():
        return filename
    
    # Split filename into name and extension
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


def is_script_file(filepath: str, script_name: str) -> bool:
    """
    Check if the file is the script itself (safety check).
    
    Args:
        filepath: Full path of the file to check
        script_name: Name of the script
        
    Returns:
        True if the file is the script itself
    """
    return os.path.basename(filepath) == script_name


def organize_file(filepath: str, watch_directory: str, dry_run: bool = False) -> bool:
    """
    Organize a single file into the appropriate category folder.
    
    Args:
        filepath: Full path of the file to organize
        watch_directory: The directory being monitored
        dry_run: If True, don't actually move files
        
    Returns:
        True if file was organized successfully, False otherwise
    """
    filename = os.path.basename(filepath)
    script_name = os.path.basename(__file__)
    
    # Safety check: Don't move the script itself
    if is_script_file(filepath, script_name):
        print(f"  ⏭️  Skipping script file: {filename}")
        return False
    
    # Skip directories
    if os.path.isdir(filepath):
        return False
    
    # Get category for this file
    category = get_category_for_file(filename)
    
    # Create destination folder
    destination_dir = os.path.join(watch_directory, category)
    
    # Create 'Others' folder if category is not found and it's not already defined
    if category == 'Others':
        destination_dir = os.path.join(watch_directory, 'Others')
    
    if not os.path.exists(destination_dir):
        os.makedirs(destination_dir)
        print(f"  📁 Created folder: {category}")
    
    # Generate unique filename if there's a conflict
    unique_filename = generate_unique_filename(destination_dir, filename)
    destination_path = os.path.join(destination_dir, unique_filename)
    
    if dry_run:
        print(f"  [DRY RUN] Would move: {filename} -> {category}/{unique_filename}")
    else:
        try:
            shutil.move(filepath, destination_path)
            print(f"  ✅ Moved: {filename} -> {category}/{unique_filename}")
        except Exception as e:
            print(f"  ❌ Error moving {filename}: {e}")
            return False
    
    return True


def organize_directory(watch_directory: str, dry_run: bool = False) -> int:
    """
    Organize all files in the specified directory.
    
    Args:
        watch_directory: The directory to organize
        dry_run: If True, don't actually move files
        
    Returns:
        Number of files organized
    """
    print(f"\n📂 Organizing files in: {watch_directory}")
    print("=" * 50)
    
    if not os.path.exists(watch_directory):
        print(f"❌ Error: Directory '{watch_directory}' does not exist!")
        return 0
    
    files_organized = 0
    
    # Get all files in the directory
    try:
        entries = os.listdir(watch_directory)
    except PermissionError:
        print(f"❌ Error: Permission denied for directory '{watch_directory}'")
        return 0
    
    for entry in entries:
        filepath = os.path.join(watch_directory, entry)
        
        if organize_file(filepath, watch_directory, dry_run):
            files_organized += 1
    
    print("=" * 50)
    print(f"✅ Organization complete! {files_organized} file(s) processed.")
    
    return files_organized


# ============================================================
# WATCH MODE (using watchdog)
# ============================================================

class FileOrganizerHandler(FileSystemEventHandler):
    """Handler for file system events in watch mode."""
    
    def __init__(self, watch_directory: str):
        self.watch_directory = watch_directory
        self.processed_files = set()
        super().__init__()
    
    def on_created(self, event):
        """Handle file creation events."""
        if event.is_directory:
            return
        
        # Wait a bit for file to be fully written
        time.sleep(0.5)
        
        filepath = event.src_path
        
        # Skip if already processed
        if filepath in self.processed_files:
            return
        
        print(f"\n🆕 New file detected: {os.path.basename(filepath)}")
        organize_file(filepath, self.watch_directory)
        self.processed_files.add(filepath)
    
    def on_modified(self, event):
        """Handle file modification events."""
        # Sometimes files are modified after being created
        # We can ignore this to avoid duplicate processing
        pass


def watch_directory(watch_directory: str):
    """
    Watch a directory continuously and organize new files.
    
    Args:
        watch_directory: The directory to watch
    """
    if not WATCHDOG_AVAILABLE:
        print("❌ Cannot start watch mode: watchdog library not available")
        print("   Install it with: pip install watchdog")
        return
    
    if not os.path.exists(watch_directory):
        print(f"❌ Error: Directory '{watch_directory}' does not exist!")
        return
    
    print(f"\n👀 Starting watch mode on: {watch_directory}")
    print("Press Ctrl+C to stop...")
    print("=" * 50)
    
    # First, organize existing files
    organize_directory(watch_directory)
    
    # Then start watching for new files
    event_handler = FileOrganizerHandler(watch_directory)
    observer = Observer()
    observer.schedule(event_handler, watch_directory, recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping watch mode...")
        observer.stop()
    
    observer.join()
    print("✅ Watch mode stopped.")


def watch_directory_loop(watch_directory: str, interval: int = 5):
    """
    Alternative watch implementation using a simple loop (no watchdog needed).
    
    Args:
        watch_directory: The directory to watch
        interval: Time in seconds between checks
    """
    print(f"\n👀 Starting simple watch mode on: {watch_directory}")
    print(f"   Checking every {interval} seconds...")
    print("Press Ctrl+C to stop...")
    print("=" * 50)
    
    # Track files we've already processed
    processed_files = set()
    
    # First, organize existing files and mark them as processed
    if os.path.exists(watch_directory):
        for entry in os.listdir(watch_directory):
            filepath = os.path.join(watch_directory, entry)
            if os.path.isfile(filepath):
                processed_files.add(os.path.abspath(filepath))
    
    print(f"📊 Found {len(processed_files)} existing files (marked as processed)")
    print("=" * 50)
    
    try:
        while True:
            if os.path.exists(watch_directory):
                for entry in os.listdir(watch_directory):
                    filepath = os.path.join(watch_directory, entry)
                    filepath_abs = os.path.abspath(filepath)
                    
                    if os.path.isfile(filepath) and filepath_abs not in processed_files:
                        print(f"\n🆕 New file detected: {entry}")
                        if organize_file(filepath, watch_directory):
                            processed_files.add(filepath_abs)
            
            time.sleep(interval)
    
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping watch mode...")
    
    print("✅ Watch mode stopped.")


# ============================================================
# MAIN FUNCTION
# ============================================================

def main():
    """Main entry point for the file organizer script."""
    parser = argparse.ArgumentParser(
        description='Organize files in a directory by file extension',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                          # Organize Downloads folder (default)
  %(prog)s /path/to/folder          # Organize specific folder
  %(prog)s -w                        # Watch mode (continuous)
  %(prog)s --watch /path/to/folder  # Watch specific folder
  %(prog)s --dry-run                 # Show what would happen without moving files
  %(prog)s --list-categories         # Show available categories
        """
    )
    
    parser.add_argument(
        'directory',
        nargs='?',
        default=os.path.join(os.path.expanduser('~'), 'Downloads'),
        help='Directory to organize (default: ~/Downloads)'
    )
    
    parser.add_argument(
        '-w', '--watch',
        action='store_true',
        help='Run in watch mode (continuous monitoring)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would happen without actually moving files'
    )
    
    parser.add_argument(
        '--list-categories',
        action='store_true',
        help='Show available categories and their extensions'
    )
    
    parser.add_argument(
        '--interval',
        type=int,
        default=5,
        help='Interval in seconds for watch mode (default: 5)'
    )
    
    args = parser.parse_args()
    
    # List categories if requested
    if args.list_categories:
        print("\n📋 Available Categories and Extensions:")
        print("=" * 50)
        for category, extensions in FILE_EXTENSION_MAP.items():
            print(f"\n{category}:")
            print(f"  {', '.join(extensions)}")
        print("\nOthers: (any extension not listed above)")
        return
    
    watch_directory = os.path.abspath(args.directory)
    
    # Check if directory exists
    if not os.path.exists(watch_directory):
        print(f"❌ Error: Directory '{watch_directory}' does not exist!")
        return
    
    if not os.path.isdir(watch_directory):
        print(f"❌ Error: '{watch_directory}' is not a directory!")
        return
    
    # Run in watch mode or one-time organization
    if args.watch:
        if WATCHDOG_AVAILABLE:
            watch_directory(watch_directory)
        else:
            watch_directory_loop(watch_directory, args.interval)
    else:
        organize_directory(watch_directory, dry_run=args.dry_run)


if __name__ == '__main__':
    main()
