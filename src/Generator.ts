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

function Generator(
  block: BlockObjectResponse,
  indentation_level: number,
  prev_block_type: string,
  next_block_type: string
): string {
  let tabs: string = "";
  for (let i: number = 0; i < indentation_level; i++) {
    tabs += "\t";
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
      content = generateBullet(block, prev_block_type, next_block_type);
      break;
    default:
      content = "Type " + block.type + " is currently not supported.\n";
  }

  return tabs + content;
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

function generateBullet(block: BulletedListItemBlockObjectResponse, prev_block_type: string, next_block_type: string): string {
  let styled_text: string = handleRichText(block.bulleted_list_item.rich_text);
  let prefix: string = "";
  let suffix: string = "";

  if (prev_block_type != "bulleted_list_item") {
    prefix += "\\begin{itemize}\n"
  }
  if (next_block_type != "bulleted_list_item") {
    suffix = "\\end{itemize}\n" + suffix;
  }

  prefix += "\t\\item ";
  suffix = "\n" + suffix;

  if (block.bulleted_list_item.color != "default") {
    prefix += getColorPrefix(block.bulleted_list_item.color);
    suffix = "}" + suffix;
  }

  return prefix + styled_text + suffix;
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
