import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import Generator from "./Generator";

dotenv.config();

async function main() {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const blockId = "955ece1e27004d81b45c6afc5c427138";
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  });

  const fs = require("fs");
  let content: string = "";
  for (let i = 0; i < response.results.length; i++) {
    const block: PartialBlockObjectResponse | BlockObjectResponse | undefined =
      response.results.at(i);
    // @ts-ignore
    content = content.concat(Generator(block));
  }

  fs.writeFileSync("./export.md", content);
  fs.writeFileSync("./response.json", JSON.stringify(response, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
