import os
import re
import unicodedata

def remove_accents(text):
    """Remove accents and special chars, replace with ASCII equivalents."""
    # Normalize to NFD (decomposes accented chars)
    nfd = unicodedata.normalize('NFD', text)
    # Remove combining characters (accents)
    ascii_text = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    return ascii_text

def slugify(text):
    text = remove_accents(text)
    text = text.lower()
    text = text.replace('%20', '-')
    # Remove parentheses and other problematic chars
    text = re.sub(r'[()]+', '', text)
    # Replace spaces and other whitespace with hyphens
    text = re.sub(r'[\s]+', '-', text)
    # Remove any remaining non-alphanumeric chars except hyphen and dot
    text = re.sub(r'[^\w\-.]', '', text)
    # Collapse multiple hyphens
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def clean_filename(filename):
    name, ext = os.path.splitext(filename)
    new_name = slugify(name)
    return new_name + ext.lower()

map_old_to_new = {}

dirs = ['canecas-site', 'placas-de-mdf']

for d in dirs:
    if not os.path.exists(d):
        continue
    for filename in os.listdir(d):
        old_filepath = os.path.join(d, filename)
        if not os.path.isfile(old_filepath):
            continue
        new_filename = clean_filename(filename)
        if new_filename != filename:
            new_filepath = os.path.join(d, new_filename)
            # Avoid collision
            if os.path.exists(new_filepath) and new_filepath.lower() != old_filepath.lower():
                base, ext = os.path.splitext(new_filename)
                counter = 1
                while os.path.exists(os.path.join(d, f"{base}-{counter}{ext}")):
                    counter += 1
                new_filename = f"{base}-{counter}{ext}"
                new_filepath = os.path.join(d, new_filename)
            os.rename(old_filepath, new_filepath)
            print(f'Renamed: "{filename}" -> "{new_filename}"')
        
        # Track mapping (old name -> new name for URL replacement)
        map_old_to_new[f"{d}/{filename}".lower()] = f"{d}/{new_filename}"
        map_old_to_new[f"{d}/{new_filename}".lower()] = f"{d}/{new_filename}"

print(f"\nTotal mappings: {len(map_old_to_new)}")

# Now fix all JS and HTML files
def replace_match(match):
    full = match.group(0)
    key = full.lower()
    if key in map_old_to_new:
        return map_old_to_new[key]
    # Best effort: clean whatever we found
    parts = full.split('/', 1)
    if len(parts) == 2:
        return f"{parts[0]}/{clean_filename(parts[1])}"
    return full

regex = re.compile(r'(?:canecas-site|placas-de-mdf)/[^\s"\'\\]+', re.IGNORECASE)

for root_file in os.listdir('.'):
    if not (root_file.endswith('.html') or root_file.endswith('.js')):
        continue
    if root_file in ['fix_all.js', 'fix_all.py', 'fix_all2.py']:
        continue
    
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
        original = content
        content = regex.sub(replace_match, content)
        if content != original:
            with open(root_file, 'w', encoding=enc) as f:
                f.write(content)
            print(f'Updated: {root_file}')

print("\nAll done!")
