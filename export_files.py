#!/usr/bin/env python3
import argparse
import shutil
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Copy files from repo to export directory')
    parser.add_argument('repo_path', help='Path to the speedtyper.dev repository')
    parser.add_argument('output_dir', help='Directory to export files to')
    parser.add_argument('--input-files', required=True, help='Path to file containing list of files to export')
    
    args = parser.parse_args()
    
    repo_path = Path(args.repo_path).resolve()
    output_dir = Path(args.output_dir).resolve()
    input_files = Path(args.input_files).resolve()
    
    # Validate repo exists
    if not repo_path.exists():
        print(f"Error: Repository path does not exist: {repo_path}")
        return 1
    
    # Validate input file exists
    if not input_files.exists():
        print(f"Error: Input files list does not exist: {input_files}")
        return 1
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Read file list
    with open(input_files, 'r') as f:
        file_paths = [line.strip() for line in f if line.strip()]
    
    copied = 0
    skipped = 0
    
    for rel_path in file_paths:
        source = repo_path / rel_path
        dest = output_dir / rel_path
        
        if not source.exists():
            print(f"⚠️  Skipped (not found): {rel_path}")
            skipped += 1
            continue
        
        if source.is_dir():
            print(f"⚠️  Skipped (is directory): {rel_path}")
            skipped += 1
            continue
        
        # Create parent directories in destination
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        shutil.copy2(source, dest)
        print(f"✓ Copied: {rel_path}")
        copied += 1
    
    print(f"\n{'='*50}")
    print(f"✓ Copied: {copied} files")
    print(f"⚠️  Skipped: {skipped} files")
    print(f"📁 Output directory: {output_dir}")
    
    return 0

if __name__ == '__main__':
    exit(main())
