import { Client } from "@notionhq/client";

const auth = import.meta.env.NOTION_TOKEN;

export const notion = new Client({ auth });

export async function getEntries() {
  try {
    const { results: entries = [] } = await notion.databases.query({
      database_id: import.meta.env.NOTION_DATABASE_ID,
    });

    return entries;
  } catch (error) {
    console.error(error);
  }
}
