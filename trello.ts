import axios from 'axios';

const BOARD_ID = process.env.TRELLO_BOARD_ID!;
const KEY = process.env.TRELLO_KEY!;
const TOKEN = process.env.TRELLO_TOKEN!;
const BACKLOG_LIST_ID = process.env.TRELLO_BACKLOG_LIST_ID!;

export async function createTrelloCard(
  title: string,
  description: string,
  tags: string[],
) {
  const customFieldsRes = await axios.get(
    `https://api.trello.com/1/boards/${BOARD_ID}/customFields`,
    {
      params: { key: KEY, token: TOKEN },
    },
  );

  const codebaseField = customFieldsRes.data.find(
    (field: any) => field.name === 'CodeBase',
  );

  const matchedOption = codebaseField?.options?.find((option: any) =>
    tags.includes(option.value?.text),
  );

  const cardRes = await axios.post('https://api.trello.com/1/cards', null, {
    params: {
      key: KEY,
      token: TOKEN,
      idList: BACKLOG_LIST_ID,
      name: title,
      desc: description,
    },
  });

  if (codebaseField && matchedOption) {
    await axios.put(
      `https://api.trello.com/1/cards/${cardRes.data.id}/customField/${codebaseField.id}/item`,
      {
        idValue: matchedOption.id,
      },
      {
        params: { key: KEY, token: TOKEN },
      },
    );
  }

  return cardRes.data;
}
