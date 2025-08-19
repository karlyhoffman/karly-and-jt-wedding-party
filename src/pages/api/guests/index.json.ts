import type { APIRoute } from "astro";
import { getAllEntries } from "../../../lib/notion/index.js";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const guestList = (await getAllEntries()) || [];

    return new Response(JSON.stringify(guestList));
  } catch (error) {
    console.error({ error });

    return new Response(
      JSON.stringify({
        error: "Notion API: A fetching error occurred.",
      }),
      { status: 500 }
    );
  }
};
