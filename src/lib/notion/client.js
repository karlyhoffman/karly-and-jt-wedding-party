import { Client } from "@notionhq/client";
import { RSVP_PROPERTIES } from "./constants";

const auth = import.meta.env.NOTION_TOKEN;

export const notion = new Client({ auth });

/**
 * Fetch entries from the Notion database.
 * @returns {Promise<Array>} The list of entries.
 */
export async function getAllEntries() {
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
            /* Format response data */
            if (isValidTitleValue(property)) {
              /* Title */
              data[RSVP_PROPERTIES[title].key] = property.title[0].text.content;
            } else if (isValidTextValue(property)) {
              /* Rich Text */
              data[RSVP_PROPERTIES[title].key] =
                property.rich_text[0].text.content;
            } else if (isValidSelectValue(property)) {
              /* Select */
              data[RSVP_PROPERTIES[title].key] = property.select.name;
            } else if (property.type === "relation") {
              /* Relations */
              data[RSVP_PROPERTIES[title].key] = property.relation.map(
                (rel) => rel.id
              );
            } else {
              /* Current property is empty */
              data[RSVP_PROPERTIES[title].key] = null;
            }
          }
        });

        acc.push(data);

        return acc;
      }, []);

    return entries || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

const isValidTitleValue = (property) => {
  return property.type === "title" && property[property.type][0]?.text?.content;
};

const isValidTextValue = (property) => {
  return (
    property.type === "rich_text" && property[property.type][0]?.text?.content
  );
};

const isValidSelectValue = (property) => {
  return property.type === "select" && property[property.type]?.name;
};

/**
 * Update a single entry from the Notion database.
 * @param {string} id - The ID of the entry to update.
 * @param {Object} data - The updated entry data.
 * @returns {Promise<Object>} The updated entry data.
 */

// export async function updateEntry(id, data) {
//   try {
//     const response = await notion.pages.update({ page_id: id, properties: data });
//     return response;
//   } catch (error) {
//     console.error(error);
//   }
// }
