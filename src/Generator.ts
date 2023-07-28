import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ParagraphBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { AnnotationResponse } from "./AnnotationResponse";
import { TeXBlock } from "./TeXBlock";

function Generator(
  block: BlockObjectResponse,
  indentation_level: number,
  bullet_indentation_level: number,
  parent_type: string,
  prev_block_type: string,
  next_block_type: string
): TeXBlock {
  let prefix: string = "";
  let suffix: string = "";

  if (indentation_level > 0 && block.type != "bulleted_list_item") {
    if (prev_block_type == "" && parent_type != "bulleted_list_item") {
      prefix = "\\begin{itemize}\n";
    }

    prefix += "\\item[ ] ";
  }

  if (indentation_level > 0 && next_block_type == "") {
    suffix = "\\end{itemize}\n";
  }

  let content: string;
  switch (block.type) {
    case "heading_1":
      content = generateH1(block);
      break;
    case "heading_2":
      content = generateH2(block);
      break;
    case "heading_3":
      content = generateH3(block);
      break;
    case "paragraph":
      content = generateParagraph(block);
      break;
    case "bulleted_list_item":
      let texBlock: TeXBlock = generateBullet(block, indentation_level, bullet_indentation_level, prev_block_type, next_block_type);
      content = texBlock.content;
      if (prefix == "") {
        prefix += texBlock.prefix;
      }
      if (suffix == "") {
        suffix = texBlock.suffix;
      }
      break;
    default:
      content = "Type " + block.type + " is currently not supported.\n";
  }

  return new TeXBlock(prefix, content, suffix);
}

function generateH1(block: Heading1BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_1.rich_text);
  let prefix: string = "\\section{";
  let suffix: string = "}\n";

  if (block.heading_1.color != "default") {
    prefix += getColorPrefix(block.heading_1.color);
    suffix = "}" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateH2(block: Heading2BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_2.rich_text);
  let prefix: string = "\\subsection{";
  let suffix: string = "}\n";

  if (block.heading_2.color != "default") {
    prefix += getColorPrefix(block.heading_2.color);
    suffix = "}" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateH3(block: Heading3BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_3.rich_text);
  let prefix: string = "\\subsubsection{";
  let suffix: string = "}\n";

  if (block.heading_3.color != "default") {
    prefix += getColorPrefix(block.heading_3.color);
    suffix = "}" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateParagraph(block: ParagraphBlockObjectResponse): string {
  let styled_text: string = handleRichText(block.paragraph.rich_text);
  let prefix: string = "";
  let suffix: string = "\n\n";

  if (block.paragraph.color != "default") {
    prefix += getColorPrefix(block.paragraph.color);
    suffix = "}" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateBullet(
  block: BulletedListItemBlockObjectResponse,
  block_indentation_level: number,
  bullet_indentation_level: number,
  prev_block_type: string,
  next_block_type: string
): TeXBlock {
  let styled_text: string = handleRichText(block.bulleted_list_item.rich_text);
  let global_prefix: string = "";
  let prefix: string;
  let global_suffix: string = "";
  let suffix: string = "\n";
  let label: string = "";
  switch (bullet_indentation_level % 3) {
    case 1: label = "[•]"; break;
    case 2: label = "[◦]"; break;
    case 0: label = "[$\\blacksquare$]"; break;
  }

  if (prev_block_type != "bulleted_list_item") {
    global_prefix = "\\begin{itemize}\n";
  }
  if (next_block_type != "bulleted_list_item") {
    global_suffix = "\\end{itemize}\n";
  }

  prefix = "\\item" + label + " ";

  if (block.bulleted_list_item.color != "default") {
    prefix += getColorPrefix(block.bulleted_list_item.color);
    suffix = "}" + suffix;
  }

  return new TeXBlock(global_prefix, prefix + styled_text + suffix, global_suffix);
}

function handleRichText(rich_texts: Array<RichTextItemResponse>): string {
  let result: string = "";
  for (let i = 0; i < rich_texts.length; i++) {
    let annotations: AnnotationResponse = rich_texts[i].annotations;
    let styled_text: string = applyAnnotations(
      rich_texts[i].plain_text,
      annotations
    );

    result = result + styled_text;
  }

  return result;
}

function getColorPrefix(color: string): string {
  let prefix: string = "";
  if (color.includes("_background")) {
    let c: string = color.split("_")[0];
    prefix += "\\colorbox{" + c + "}{";
  } else {
    prefix += "\\textcolor{" + color + '}{';
  }

  return prefix;
}

function applyAnnotations(
  text: string,
  annotations: AnnotationResponse
): string {
  let prefix: string = "";
  let suffix: string = "";

  if (annotations.color != "default") {
    prefix += getColorPrefix(annotations.color);
    suffix = "}" + suffix;
  }
  if (annotations.underline) {
    prefix += "\\underline{";
    suffix = "}" + suffix;
  }
  if (annotations.bold) {
    prefix += "\\textbf{";
    suffix = "}" + suffix;
  }
  if (annotations.italic) {
    prefix += "\\textit{";
    suffix = "}" + suffix;
  }
  if (annotations.code) {
    prefix += "\\texttt{";
    suffix = "}" + suffix;
  }
  if (annotations.strikethrough) {
    prefix += "\\sout{";
    suffix = "}" + suffix;
  }

  return prefix + text + suffix;
}

export default Generator;
