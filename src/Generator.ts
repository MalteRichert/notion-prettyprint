import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ImageBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ParagraphBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { AnnotationResponse } from "./AnnotationResponse";
import { TeXBlock } from "./TeXBlock";
import { promises as fs } from "fs";

async function Generator(
  block: BlockObjectResponse,
  indentation_level: number,
  bullet_indentation_level: number,
  parent_type: string,
  prev_block_type: string,
  next_block_type: string,
): Promise<TeXBlock> {
  let tex_block: TeXBlock = new TeXBlock("", "", "");

  if (
    indentation_level > 0 &&
    block.type != "bulleted_list_item" &&
    block.type != "numbered_list_item"
  ) {
    if (
      (prev_block_type == "" ||
        prev_block_type == "bulleted_list_item" ||
        prev_block_type == "numbered_list_item") &&
      parent_type != "bulleted_list_item" &&
      parent_type != "numbered_list_item"
    ) {
      tex_block.prefix = "\\begin{itemize}\n";
    }

    tex_block.prefix += "\\item[ ] ";

    if (
      (next_block_type == "" ||
        next_block_type == "bulleted_list_item" ||
        next_block_type == "numbered_list_item") &&
      parent_type != "bulleted_list_item" &&
      parent_type != "numbered_list_item"
    ) {
      tex_block.suffix = "\\end{itemize}\n";
    }
  }

  switch (block.type) {
    case "heading_1":
      tex_block.content = generateH1(block);
      break;
    case "heading_2":
      tex_block.content = generateH2(block);
      break;
    case "heading_3":
      tex_block.content = generateH3(block);
      break;
    case "paragraph":
      tex_block.content = generateParagraph(block);
      break;
    case "bulleted_list_item":
      tex_block = generateBullet(
        block,
        bullet_indentation_level,
        prev_block_type,
        next_block_type,
      );
      break;
    case "numbered_list_item":
      tex_block = generateNumberedListItem(
        block,
        prev_block_type,
        next_block_type,
      );
      break;
    case "image":
      tex_block.content = await generateImage(block);
      break;
    default:
      tex_block.content =
        "Type " + block.type + " is currently not supported.\n\n";
  }

  return tex_block;
}

function generateH1(block: Heading1BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_1.rich_text);
  let prefix: string = "\\section{";
  let suffix: string = "}\n";

  if (block.heading_1.color != "default") {
    const color: TeXBlock = getColorPrefix(block.heading_1.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateH2(block: Heading2BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_2.rich_text);
  let prefix: string = "\\subsection{";
  let suffix: string = "}\n";

  if (block.heading_2.color != "default") {
    const color: TeXBlock = getColorPrefix(block.heading_2.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateH3(block: Heading3BlockObjectResponse): string {
  let styled_text: string = handleRichText(block.heading_3.rich_text);
  let prefix: string = "\\subsubsection{";
  let suffix: string = "}\n";

  if (block.heading_3.color != "default") {
    const color: TeXBlock = getColorPrefix(block.heading_3.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateParagraph(block: ParagraphBlockObjectResponse): string {
  let styled_text: string = handleRichText(block.paragraph.rich_text);
  let prefix: string = "";
  let suffix: string = "\n\n";

  if (block.paragraph.color != "default") {
    const color: TeXBlock = getColorPrefix(block.paragraph.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
  }

  return prefix + styled_text + suffix;
}

function generateBullet(
  block: BulletedListItemBlockObjectResponse,
  bullet_indentation_level: number,
  prev_block_type: string,
  next_block_type: string,
): TeXBlock {
  let styled_text: string = handleRichText(block.bulleted_list_item.rich_text);
  let tex_block: TeXBlock = new TeXBlock("", "", "");
  let prefix: string;
  let suffix: string = "\n";
  let label: string = "";

  switch (bullet_indentation_level % 3) {
    case 0:
      label = "[•]";
      break;
    case 1:
      label = "[◦]";
      break;
    case 2:
      label = "[$\\blacksquare$]";
      break;
  }

  if (prev_block_type != "bulleted_list_item") {
    tex_block.prefix = "\\begin{itemize}\n";
  }
  if (next_block_type != "bulleted_list_item") {
    tex_block.suffix = "\\end{itemize}\n";
  }

  prefix = "\\item" + label + " ";

  if (block.bulleted_list_item.color != "default") {
    const color: TeXBlock = getColorPrefix(block.bulleted_list_item.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
  }

  tex_block.content = prefix + styled_text + suffix;
  return tex_block;
}

function generateNumberedListItem(
  block: NumberedListItemBlockObjectResponse,
  prev_block_type: string,
  next_block_type: string,
): TeXBlock {
  let styled_text: string = handleRichText(block.numbered_list_item.rich_text);
  let tex_block: TeXBlock = new TeXBlock("", "", "");
  let prefix: string = "\\item ";
  let suffix: string = "\n";

  if (prev_block_type != "numbered_list_item") {
    tex_block.prefix = "\\begin{enumerate}\n";
  }
  if (next_block_type != "numbered_list_item") {
    tex_block.suffix = "\\end{enumerate}\n";
  }

  if (block.numbered_list_item.color != "default") {
    const color: TeXBlock = getColorPrefix(block.numbered_list_item.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
  }

  tex_block.content = prefix + styled_text + suffix;
  return tex_block;
}

async function generateImage(block: ImageBlockObjectResponse): Promise<string> {
  let url: string;
  if (block.image.type == "external") {
    url = block.image.external.url;
  } else {
    url = block.image.file.url;
  }

  const file_name: string = getNameFromUrl(url, block.image.type);
  const file_path: string = "./exports/images/" + file_name;
  await downloadFile(file_path, url);

  let caption: string = "";
  if (block.image.caption.length > 0) {
    caption = "\\caption{" + handleRichText(block.image.caption) + "}\n";
  }
  let prefix: string =
    "\\begin{figure}[h]\n" +
    "\\includegraphics[width=\\maxwidth{\\linewidth}]{";
  let suffix: string = "}\n" + "\\centering\n" + caption + "\\end{figure}\n";

  return prefix + file_name + suffix;
}

function getNameFromUrl(url: string, url_type: string): string {
  let file_name: string;
  if (url_type == "external") {
    const url_parts: string[] = url.split("/");
    file_name = url_parts[url_parts.length - 1];
  } else {
    const url_without_parameters: string = url.split("?")[0];
    const url_parts: string[] = url_without_parameters.split("/");
    file_name = url_parts[url_parts.length - 1];
  }
  const name_parts: string[] = file_name.split(".");
  return name_parts[0] + "." + name_parts[name_parts.length - 1];
}

async function downloadFile(path: string, url: string) {
  const response: Response = await fetch(url);
  const blob: Blob = await response.blob();
  const arr_buffer: ArrayBuffer = await blob.arrayBuffer();
  const buffer: Buffer = Buffer.from(arr_buffer);
  await fs.writeFile(path, buffer);
}

function handleRichText(rich_texts: Array<RichTextItemResponse>): string {
  let result: string = "";
  for (const richText of rich_texts) {
    let prefix: string = "";
    let suffix: string = "";
    if (richText.href != null) {
      prefix = "\\href{" + richText.href + "}{";
      suffix = "}";
    }

    let styled_text: string = applyAnnotations(
      richText.plain_text,
      richText.annotations,
    );

    styled_text = formatTexString(styled_text);

    result += prefix + styled_text + suffix;
  }

  return result;
}

function getColorPrefix(color: string): TeXBlock {
  if (color.includes("_background")) {
    return new TeXBlock("", "", "");
  }
  return new TeXBlock("\\textcolor{" + color + "}{", "", "}");
}

function applyAnnotations(
  text: string,
  annotations: AnnotationResponse,
): string {
  let prefix: string = "";
  let suffix: string = "";

  if (annotations.color != "default") {
    const color: TeXBlock = getColorPrefix(annotations.color);
    prefix += color.prefix;
    suffix = color.suffix + suffix;
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

function formatTexString(input: string): string {
  let output: string = "";
  for (let i = 0; i < input.length; i++) {
    if (
      (input[i] == "." || input[i] == "!" || input[i] == "?") &&
      input[i + 1] == " "
    ) {
      //insert line break after each sentence to avoid too long lines in LateX code.
      //This does not affect the pdf output.
      output += input[i] + "\n";
      continue;
    }
    if (
      input[i] == "%" ||
      input[i] == "&" ||
      input[i] == "$" ||
      input[i] == "_" ||
      input[i] == "#"
    ) {
      //escape LaTeX special characters
      output += "\\" + input[i];
      continue;
    }

    output += input[i];
  }
  return output;
}

export default Generator;
