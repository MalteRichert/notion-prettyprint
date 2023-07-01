import {
  BlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ParagraphBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { AnnotationResponse } from "./AnnotationResponse";

function Generator(block: BlockObjectResponse): string {
  switch (block.type) {
    case "heading_1":
      return generateH1(block);
    case "heading_2":
      return generateH2(block);
    case "heading_3":
      return generateH3(block);
    case "paragraph":
      return generateParagraph(block);
  }
  return "Type " + block.type + " is currently not supported.  \n";
}

function generateH1(block: Heading1BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_1.rich_text);
  let prefix: string = "# ";
  let suffix: string = "\n";

  if (block.heading_1.color != "default") {
    prefix += getColorPrefix(block.heading_1.color);
    suffix = "</span>" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateH2(block: Heading2BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_2.rich_text);
  let prefix: string = "## ";
  let suffix: string = "\n";

  if (block.heading_2.color != "default") {
    prefix += getColorPrefix(block.heading_2.color);
    suffix = "</span>" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateH3(block: Heading3BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_3.rich_text);
  let prefix: string = "### ";
  let suffix: string = "\n";

  if (block.heading_3.color != "default") {
    prefix += getColorPrefix(block.heading_3.color);
    suffix = "</span>" + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateParagraph(block: ParagraphBlockObjectResponse): string {
  let styled_text: string = handleRichText(block.paragraph.rich_text);
  let prefix: string = "";
  let suffix: string = "  \n";

  if (block.paragraph.color != "default") {
    prefix += getColorPrefix(block.paragraph.color);
    suffix = "</span>" + suffix;
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
    prefix += '<span style="background-color:' + c + '">';
  } else {
    prefix += '<span style="color:' + color + '">';
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
    suffix = "</span>" + suffix;
  }
  if (annotations.underline) {
    prefix += "<ins>";
    suffix = "</ins>" + suffix;
  }
  if (annotations.bold) {
    prefix += "**";
    suffix = "**" + suffix;
  }
  if (annotations.italic) {
    prefix += "*";
    suffix = "*" + suffix;
  }
  if (annotations.code) {
    prefix += "`";
    suffix = "`" + suffix;
  }
  if (annotations.strikethrough) {
    prefix += "~~";
    suffix = "~~" + suffix;
  }

  return prefix + text + suffix;
}

export default Generator;
