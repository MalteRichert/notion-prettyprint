import {
  BlockObjectResponse,
  Heading1BlockObjectResponse,
  ParagraphBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

function Generator(block : BlockObjectResponse) : string {
  if (block.type == "heading_1") {
    return generateH1( block )
  }
  if (block.type == "paragraph") {
    return generateParagraph( block )
  } else {
    return ''
  }
}

function generateH1(block: Heading1BlockObjectResponse) :string {
  const prefix : string = '# '
  const suffix : string = '\n'
  // @ts-ignore
  return prefix + block.heading_1.rich_text.at(0).plain_text + suffix;
}

function generateParagraph(block: ParagraphBlockObjectResponse) :string {
  const suffix :string = '  \n'
  // @ts-ignore
  return block.paragraph.rich_text.at(0).plain_text + suffix;
}

export default Generator;