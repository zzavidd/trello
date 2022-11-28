import { config } from "https://deno.land/std/dotenv/mod.ts";

const env = await config();

const STABLE_LISTS = ['Backlog', 'To Do', 'Doing', 'Done'];

const lists = await request<List>(`/boards/${env.TRELLO_BOARD_ID}/lists`, {
  method: 'GET',
  params: {
    fields: "id,name,pos",
  },
});

const cards = await request<Card>(`/boards/${env.TRELLO_BOARD_ID}/cards`, {
  params: {
    fields: 'idList'
  }
});

const emptyLists = lists!.filter((list) => {
  if (STABLE_LISTS.includes(list.name)) return false;
  return !cards!.find((card) => card.idList === list.id);
});

if (Deno.args.includes('--dry-run')){
  console.log(emptyLists);
} else {
  await Promise.all(emptyLists.map((list) => {
    return request(`/lists/${list.id}/closed`, { method: 'PUT', params: {
      value: 'true'
    } });
  }));
  console.info('Archived all empty lists.');
}

async function request<T>(
  route: string,
  options: RequestOptions = {},
): Promise<T[] | void> {
  const { method = "GET", params = {} } = options;
  const baseUrl = "https://api.trello.com/1";
  const url = new URL(`${baseUrl}/${route}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  url.searchParams.append("key", env.TRELLO_API_KEY);
  url.searchParams.append("token", env.TRELLO_API_TOKEN);
  try {

  
    const res = await fetch(url.href, { method });
    if (!res.ok){
throw new Error(await res.text());
    }
  if (method === 'GET'){
    return res.json();
  }
} catch (e){
  console.error(e);
  Deno.exit(1);
}
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  params?: Record<string, string>;
}

interface List {
  id: string;
  name: string;
}

interface Card {
  id: string;
  idList: string;
}