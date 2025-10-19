import re

def is_english_text(text):
    """Check if text contains primarily English characters"""
    # Remove emojis and special characters first
    clean_text = re.sub(r'[^\w\s]', '', text)
    # Count English letters vs Chinese characters
    english_chars = len(re.findall(r'[a-zA-Z]', clean_text))
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', clean_text))
    return english_chars > chinese_chars and english_chars > 0

def extract_english_content(input_file, output_file):
    """Extract only English content from markdown file"""
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    english_lines = []
    current_slide_title = ""
    slide_counter = 1
    
    for line in lines:
        line = line.strip()
        
        # Handle slide markers
        if line.startswith("---"):
            english_lines.append(line)
            continue
        
        # Handle slide titles
        if line.startswith("## Slide"):
            # Extract slide number and title
            match = re.match(r'## Slide (\d+): (.+)', line)
            if match:
                slide_num = match.group(1)
                title = match.group(2)
                # Only keep the English part of the title
                if '/' in title:
                    english_title = title.split('/')[0].strip()
                else:
                    english_title = title
                english_lines.append(f"## Slide {slide_num}: {english_title}")
                slide_counter = int(slide_num)
            continue
        
        # Skip empty lines
        if not line:
            english_lines.append("")
            continue
        
        # Process content lines
        if is_english_text(line):
            # Clean up the line but keep structure
            clean_line = line
            
            # Remove Chinese translations after slashes
            if '/' in line and not line.startswith('http'):
                parts = line.split('/')
                if len(parts) >= 2:
                    clean_line = parts[0].strip()
            
            # Remove Chinese text in parentheses
            clean_line = re.sub(r'\([^)]*[\u4e00-\u9fff][^)]*\)', '', clean_line).strip()
            
            # Remove Chinese text at the end (after * or other markers)
            clean_line = re.sub(r'\*[^*]*[\u4e00-\u9fff][^*]*\*$', '', clean_line).strip()
            
            # Remove any remaining Chinese characters
            clean_line = re.sub(r'[\u4e00-\u9fff]', '', clean_line).strip()
            
            # Clean up extra spaces and punctuation
            clean_line = re.sub(r'\s+', ' ', clean_line)
            clean_line = re.sub(r'\s*-\s*$', '', clean_line)  # Remove trailing dashes
            
            if clean_line:
                english_lines.append(clean_line)
    
    # Write the English-only markdown file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write('\n'.join(english_lines))
    
    print(f"English-only markdown saved as {output_file}")

def main():
    extract_english_content('PRESENTATION.md', 'PRESENTATION_ENGLISH.md')
    print("Successfully extracted English content from PRESENTATION.md!")

if __name__ == "__main__":
    main()
