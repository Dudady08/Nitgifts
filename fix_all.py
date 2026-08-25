import os
import re

def slugify(text):
    text = text.lower()
    text = text.replace('%20', '-')
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def clean_filename(filename):
    name, ext = os.path.splitext(filename)
    return slugify(name) + ext.lower()

dirs_to_rename = {
    'canecas site': 'canecas-site',
    'canecas-site': 'canecas-site', 
    'Placas de MDF': 'placas-de-mdf',
    'placas-de-mdf': 'placas-de-mdf'
}

map_old_to_new = {}

for old_dir, new_dir in dirs_to_rename.items():
    if os.path.exists(old_dir) and old_dir != new_dir:
        os.rename(old_dir, new_dir)
        
    if os.path.exists(new_dir):
        for filename in os.listdir(new_dir):
            old_filepath = os.path.join(new_dir, filename)
            if os.path.isfile(old_filepath):
                new_filename = clean_filename(filename)
                if new_filename != filename:
                    new_filepath = os.path.join(new_dir, new_filename)
                    if os.path.exists(new_filepath):
                        base, ext = os.path.splitext(new_filename)
                        new_filename = f"{base}-1{ext}"
                        new_filepath = os.path.join(new_dir, new_filename)
                    os.rename(old_filepath, new_filepath)
                
                old_variants = [old_dir, 'canecas site', 'Placas de MDF', 'canecas-site', 'placas-de-mdf']
                for ov in old_variants:
                    old_url_path = f"{ov}/{filename}".lower()
                    new_url_path = f"{new_dir}/{new_filename}"
                    map_old_to_new[old_url_path] = new_url_path
                    # Also map the uncleaned original filename if it had spaces/caps
                    old_url_path2 = f"{ov}/{new_filename}".lower()
                    map_old_to_new[old_url_path2] = new_url_path

def replace_match(match):
    dir_part = match.group(1)
    file_part = match.group(2)
    old_full = f"{dir_part}/{file_part}".lower()
    
    if old_full in map_old_to_new:
        return map_old_to_new[old_full]
    else:
        clean_dir = "canecas-site" if "caneca" in dir_part.lower() else "placas-de-mdf"
        return f"{clean_dir}/{clean_filename(file_part)}"

regex = re.compile(r'(canecas site|Placas de MDF|canecas-site|placas-de-mdf)/([^"\'\\]+)', re.IGNORECASE)

for root_file in os.listdir('.'):
    if (root_file.endswith('.html') or root_file.endswith('.js')) and root_file not in ['fix_all.js', 'fix_all.py']:
        content = None
        enc = 'utf-8'
        try:
            with open(root_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            enc = 'latin1'
            with open(root_file, 'r', encoding='latin1') as f:
                content = f.read()
            
        if content is not None:
            original_content = content
            content = regex.sub(replace_match, content)
            
            if content != original_content:
                with open(root_file, 'w', encoding=enc) as f:
                    f.write(content)
                print(f'Updated paths in {root_file}')

print("Fix completed successfully.")
