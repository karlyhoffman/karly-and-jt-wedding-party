import type { APIRoute } from "astro";
import { getAllEntries } from "../../../lib/notion/index.js";

// TODO: UPDATE TO POST REQUEST
export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;

  try {
    return new Response(JSON.stringify({ id, params, request }));
  } catch (error) {
    console.error({ error });

    return new Response(JSON.stringify({ error: "Notion Fetch Error" }), {
      status: 500,
    });
  }
};

export async function getStaticPaths() {
  try {
    const guestList = (await getAllEntries()) || [];

    return guestList.map(({ id }) => ({
      params: { id },
    }));
  } catch (error) {
    console.error({ error });

    return new Response(JSON.stringify({ error: "Notion Fetch Error" }), {
      status: 500,
    });
  }
}
