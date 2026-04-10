import os
import re

directory = r'c:\Proyectos\admin-rutadeltelar\app'

# Matches the multi-line or single-line `<Link ...>&larr; Volver al listado</Link>`
# Using regex to catch variants like `&larr; Volver al listado` or just `Volver al listado` inside `<Link>`
pattern1 = re.compile(r'<Link\s+href="[^"]+"\s+className="([^"]+)">\s*(?:&larr;)?\s*Volver al listado\s*</Link>')

count = 0
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace Link with button
            new_content = pattern1.sub(r'<button onClick={() => router.back()} className="\1">&larr; Volver</button>', content)
            
            if new_content != content:
                # Need to ensure `const router = useRouter();` is present.
                if 'useRouter' not in new_content:
                    # Add import if missing
                    if 'next/navigation' not in new_content:
                        new_content = re.sub(r'(import [^\n]+)', r"import { useRouter } from 'next/navigation';\n\1", new_content, count=1)
                    else:
                        new_content = re.sub(r'import \{([^}]+)\} from \'next/navigation\'', r"import {\1, useRouter} from 'next/navigation'", new_content)
                    
                    # Add `const router = useRouter();` inside the component
                    # find the export default function line
                    new_content = re.sub(r'(export default function[^{]+\{\s*)', r"\1const router = useRouter();\n  ", new_content)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f'Updated {filepath}')

print(f'Total files updated: {count}')
