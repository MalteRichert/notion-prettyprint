import {
  BlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ParagraphBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

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
  const prefix: string = "# ";
  const suffix: string = "\n";
  // @ts-ignore
  return prefix + block.heading_1.rich_text.at(0).plain_text + suffix;
}

function generateH2(block: Heading2BlockObjectResponse): string {
  const prefix: string = "## ";
  const suffix: string = "\n";
  // @ts-ignore
  return prefix + block.heading_2.rich_text.at(0).plain_text + suffix;
}

function generateH3(block: Heading3BlockObjectResponse): string {
  const prefix: string = "### ";
  const suffix: string = "\n";
  // @ts-ignore
  return prefix + block.heading_3.rich_text.at(0).plain_text + suffix;
}

function generateParagraph(block: ParagraphBlockObjectResponse): string {
  let result: string = "";
  for (let i = 0; i < block.paragraph.rich_text.length; i++) {
    let prefix: string = "";
    let suffix: string = "";
    // @ts-ignore
    if (block.paragraph.rich_text.at(i).annotations.underline) {
      prefix = "<ins>";
      suffix = "</ins>";
    }
    // @ts-ignore
    if (block.paragraph.rich_text.at(i).annotations.bold) {
      prefix = prefix.concat("**");
      suffix = "**".concat(suffix);
    }
    // @ts-ignore
    if (block.paragraph.rich_text.at(i).annotations.italic) {
      prefix = prefix.concat("*");
      suffix = "*".concat(suffix);
    }
    // @ts-ignore
    if (block.paragraph.rich_text.at(i).annotations.code) {
      prefix = prefix.concat("`");
      suffix = "`".concat(suffix);
    }
    // @ts-ignore
    if (block.paragraph.rich_text.at(i).annotations.strikethrough) {
      prefix = prefix.concat("~~");
      suffix = "~~".concat(suffix);
    }
    // @ts-ignore
    result = result.concat(prefix, block.paragraph.rich_text.at(i).plain_text, suffix);
  }

  const suffix: string = "  \n";
  // @ts-ignore
  return result + suffix;
}

export default Generator;
