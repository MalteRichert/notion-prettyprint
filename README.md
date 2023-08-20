# Notion PrettyPrint
Experimenting with the new Notion API to build a LaTeX exporter for academic papers.  
Currently, content is exported to a `.tex`file. Users will need their own TeX environment to build a `.pdf` file from that. 
PDF export might be included in a post-1.0 version. 

## 🚀 Notable features
- Supported Block types:
    - Paragraph
    - Bulleted List Item
    - Numbered List Item
    - Headings 1-3
    - Image
- Text can be styled **bold**, *italic*, <ins>underlined</ins>, ~~struck-through~~, `as code` 
or <span style="color:red">with font colors.</span>
- Blocks can be nested up to 4 levels deep.
- The mapping of Notion headings to LaTeX headings can be mapped manually to allow for pages that contain only subsections or entire parts of a larger document

## 🫠 Current Limitations
Apart from the block types not supported at all yet, the following Notion features lead to unexpected behavior:
- Background color is ignored. See issue [#17](https://github.com/MalteRichert/notion-prettyprint/issues/17).
- Nesting of blocks is limited to four levels of nesting.
- Nesting of numbered lists is not styled as in Notion but in LaTeX default with labels 1., (a), i., A.
- All numbered lists currently start at 1, even if they start at some other number in Notion.
- Images are not indented. I think that's fine though.
- Tables of contents are ignored for now. LaTeX does a better job of that.