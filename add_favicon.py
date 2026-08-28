import os
import glob

html_files = glob.glob('*.html')
icon_tag = ' <link rel="icon" type="image/png" href="icone-nitgifts.png">\n'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'icone-nitgifts.png' in content:
        continue
        
    head_pos = content.find('<head>')
    if head_pos != -1:
        insert_pos = head_pos + len('<head>')
        new_content = content[:insert_pos] + '\n' + icon_tag + content[insert_pos:]
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
