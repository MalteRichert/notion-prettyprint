import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  PartialBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

import Generator from "./Generator";
import fs from "fs";
import { TeXBlock } from "./TeXBlock";

dotenv.config();

async function main(): Promise<void> {
  const page_ids: string[] = [
    "955ece1e27004d81b45c6afc5c427138",
    "a87a84d79c5948058abff9a046799bbb",
  ];
  const top_level_heading: number = 1; //section

  for (let i = 0; i < page_ids.length; i++) {
    await writePageFile(page_ids[i], i, top_level_heading);
  }
}

async function writePageFile(
  page_id: string,
  page_index: number,
  top_level_heading: number,
): Promise<void> {
  const notion: Client = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  let content: string = await getAndHandleChildren(
    notion,
    page_id,
    "",
    0,
    0,
    top_level_heading,
  );
  const prefix: string = getHeader();
  const suffix: string = "\\end{document}";

  fs.writeFileSync(
    "./exports/export_" + page_index + ".tex",
    prefix + content + suffix,
  );
}

async function getAndHandleChildren(
  notion: Client,
  block_id: string,
  parent_type: string,
  recursion_count: number,
  bullet_recursion_count: number,
  top_level_heading: number,
): Promise<string> {
  const response: ListBlockChildrenResponse = await notion.blocks.children.list(
    {
      block_id: block_id,
      page_size: 100,
    },
  );

  let content: string = "";
  let benched_suffix: string = "";
  for (let i: number = 0; i < response.results.length; i++) {
    const block_response: PartialBlockObjectResponse | BlockObjectResponse =
      response.results[i];

    if (!("parent" in block_response)) {
      throw Error("Received partial block " + block_response.id);
    }

    const block: BlockObjectResponse = block_response;
    let next_block_type: string = "";
    let prev_block_type: string = "";

    if (i + 1 < response.results.length) {
      const next_block_response:
        | PartialBlockObjectResponse
        | BlockObjectResponse = response.results[i + 1];
      if ("parent" in next_block_response) {
        next_block_type = next_block_response.type;
      }
    }

    if (i - 1 >= 0) {
      const prev_block_response:
        | PartialBlockObjectResponse
        | BlockObjectResponse = response.results[i - 1];
      if ("parent" in prev_block_response) {
        prev_block_type = prev_block_response.type;
      }
    }

    let tex_block: TeXBlock = await Generator(
      block,
      recursion_count,
      bullet_recursion_count,
      parent_type,
      prev_block_type,
      next_block_type,
      top_level_heading,
    );

    content += tex_block.prefix + tex_block.content;

    if (block.has_children) {
      let bullet_recursion_adder: number = 0;
      if (block.type == "bulleted_list_item") {
        bullet_recursion_adder = 1;
      }
      content += await getAndHandleChildren(
        notion,
        block.id,
        block.type,
        recursion_count + 1,
        bullet_recursion_count + bullet_recursion_adder,
        top_level_heading,
      );
    }

    if (
      next_block_type != "bulleted_list_item" &&
      next_block_type != "numbered_list_item"
    ) {
      content += tex_block.suffix + benched_suffix;
    } else if (
      block.type == "bulleted_list_item" ||
      block.type == "numbered_list_item"
    ) {
      content += tex_block.suffix;
    } else {
      benched_suffix = tex_block.suffix;
    }
  }

  fs.writeFileSync("./response.json", JSON.stringify(response, null, 2));

  return content;
}

function getHeader(): string {
  const hyper_setup: string =
    "\\hypersetup{\n" +
    "    colorlinks=true,\n" +
    "    linkcolor=blue,\n" +
    "    filecolor=blue,\n" +
    "    urlcolor=blue,\n" +
    "    pdftitle={PrettyPrint Export},\n" +
    "    pdfpagemode=FullScreen,\n" +
    "    }\n" +
    "\\urlstyle{same}\n";

  const maxwidth_command: string =
    "\\makeatletter\n" +
    "\\def\\maxwidth#1{\\ifdim\\Gin@nat@width>#1 #1\\else\\Gin@nat@width\\fi}\n" +
    "\\makeatother\n";

  return "\\documentclass[12pt, a4paper]{article}\n" +
    "\\usepackage[normalem]{ulem}\n" +
    "\\usepackage{xcolor}\n" +
    "\\usepackage{amssymb}\n" +
    "\\usepackage{graphicx}\n" + // support graphics
    "\\graphicspath{ {./images/} }\n" + // specify graphics path
    "\\usepackage{hyperref}\n" + //hyperref has to be the last package to be imported
    hyper_setup +
    maxwidth_command + // command to allow setting a maximum width for images
    "\n\\begin{document}\n";
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
