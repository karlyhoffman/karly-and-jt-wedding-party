import { Client } from "@notionhq/client";
import { RSVP_PROPERTIES } from "./constants";

const auth = import.meta.env.NOTION_TOKEN;

export const notion = new Client({ auth });

export async function getEntries() {
  try {
    const { results = [] } = await notion.databases.query({
      database_id: import.meta.env.NOTION_DATABASE_ID,
    });

    const entries = results
      .filter((entry) => "properties" in entry)
      .reduce((acc, entry) => {
        const { properties, id } = entry;
        const data = { id };

        Object.entries(properties).forEach((p) => {
          const [title, property] = p;

          if (RSVP_PROPERTIES[title]) {
            /* Title */
            if (property.type === "title" && property.title[0]?.text?.content) {
              data[RSVP_PROPERTIES[title].key] = property.title[0].text.content;
            }

            /* Rich Text */
            if (
              property.type === "rich_text" &&
              property.rich_text[0]?.text?.content
            ) {
              data[RSVP_PROPERTIES[title].key] =
                property.rich_text[0].text.content;
            }

            /* Select */
            if (property.type === "select" && property.select?.name) {
              data[RSVP_PROPERTIES[title].key] = property.select.name;
            }

            /* Relation */
            if (property.type === "relation") {
              data[RSVP_PROPERTIES[title].key] = property.relation.map(
                (rel) => rel.id
              );
            }
          }
        });

        acc.push(data);

        return acc;
      }, []);

    return entries || [];
  } catch (error) {
    console.error(error);
  }
}
