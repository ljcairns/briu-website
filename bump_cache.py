#!/usr/bin/env python3
import os
import re

def bump_versions(root_dir):
    count = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules and workers directories
        dirnames[:] = [d for d in dirnames if d not in ['node_modules', 'workers']]
        
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # Check if file has version strings
                if 'v=20260311a' in content or 'v=20260311c' in content:
                    new_content = content.replace('v=20260311a', 'v=20260311b')
                    new_content = new_content.replace('v=20260311c', 'v=20260311d')
                    
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    count += 1
                    print(f"Updated: {filepath}")
    
    print(f"\n✓ Total files updated: {count}")

if __name__ == '__main__':
    bump_versions('/Users/lucascairns/briu-website')
