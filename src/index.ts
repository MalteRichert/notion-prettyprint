import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import {
  BlockObjectResponse,
  ListBlockChildrenResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import Generator from "./Generator";
import fs from "fs";

dotenv.config();

async function main() : Promise<void> {
  const notion: Client = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const block_id: string = "955ece1e27004d81b45c6afc5c427138";
  let content: string = await getAndHandleChildren(notion, block_id, 0);

  fs.writeFileSync("./export.md", content);
}

async function getAndHandleChildren(
  notion: Client,
  block_id: string,
  recursion_count: number
): Promise<string> {
  const response: ListBlockChildrenResponse = await notion.blocks.children.list(
    {
      block_id: block_id,
      page_size: 100,
    }
  );

  let content: string = "";
  for (let i: number = 0; i < response.results.length; i++) {
    const block_response: PartialBlockObjectResponse | BlockObjectResponse =
      response.results[i];

    if ("parent" in block_response) {
      const block: BlockObjectResponse = block_response;
      content += Generator(block, recursion_count);

      if (block.has_children) {
        content += await getAndHandleChildren(
          notion,
          block.id,
          recursion_count + 1
        );
      }
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
