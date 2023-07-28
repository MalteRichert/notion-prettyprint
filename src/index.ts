import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import Generator from "./Generator";
import fs from "fs";
import { TeXBlock } from "./TeXBlock";

dotenv.config();

async function main(): Promise<void> {
  const notion: Client = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const block_id: string = "955ece1e27004d81b45c6afc5c427138";
  let content: string = await getAndHandleChildren(notion, block_id, "", 0, 0);
  const prefix: string =
    "\\documentclass[12pt, a4paper]{article}\n" +
    "\\usepackage[normalem]{ulem}\n" +
    "\\usepackage{xcolor}\n" +
    "\\usepackage{amssymb}\n" +
    "\\begin{document}\n";
  const suffix: string = "\\end{document}";

  fs.writeFileSync("./export.tex", prefix + content + suffix);
}

async function getAndHandleChildren(
  notion: Client,
  block_id: string,
  parent_type: string,
  recursion_count: number,
  bullet_recursion_count: number,
): Promise<string> {
  const response: ListBlockChildrenResponse = await notion.blocks.children.list(
    {
      block_id: block_id,
      page_size: 100,
    },
  );

  let content: string = "";
  for (let i: number = 0; i < response.results.length; i++) {
    const block_response: PartialBlockObjectResponse | BlockObjectResponse =
      response.results[i];

    if ("parent" in block_response) {
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

      let tex_block: TeXBlock = Generator(
        block,
        recursion_count,
        bullet_recursion_count,
        parent_type,
        prev_block_type,
        next_block_type,
      );

      content += tex_block.prefix + tex_block.content;

      if (block.has_children) {
        if (
          block.type == "bulleted_list_item" ||
          block.type == "numbered_list_item"
        ) {
          bullet_recursion_count += 1;
        }
        content += await getAndHandleChildren(
          notion,
          block.id,
          block.type,
          recursion_count + 1,
          bullet_recursion_count,
        );
      }

      content += tex_block.suffix;
    } else {
      throw Error("Received partial block " + block_response.id);
    }
  }

  fs.writeFileSync("./response.json", JSON.stringify(response, null, 2));

  return content;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
