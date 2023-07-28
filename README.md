# Notion PrettyPrint
Experimenting with the new Notion API to build a LaTex exporter for academic papers.  
Currently, content is exported to a `.tex`file. Users will need their own TeX environment to build a `.pdf` file from that. 
Pdf export might be included in a post-1.0 version. 

## 🚀 Notable features
- Supported Block types:
    - Paragraph
    - Bulleted List Item
    - Headings 1-3
- Text can be styled **bold**, *italic*, <ins>underlined</ins>, ~~struck-through~~, `as code` 
or <span style="color:red">with font colors.</span>
- Blocks can be nested up to 4 levels deep.

## 😬 Current Limitations
Apart from the blocks not supported at all yet, the following Notion features lead to unexpected behavior:
- Using background color on text makes it overflow out of the right side without line break. Using background color to 
highlight just one word should work in most cases though.
- Nesting of blocks is limited to four levels of nesting.