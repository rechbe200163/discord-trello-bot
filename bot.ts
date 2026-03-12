import {
  ActivityType,
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';
import { createTrelloCard } from './trello';

const TOKEN = process.env.BOT_TOKEN!;
const BOT_STATUS = process.env.BOT_STATUS as
  | 'online'
  | 'idle'
  | 'dnd'
  | 'invisible';
const BOT_ACTIVITY_TYPE = process.env.BOT_ACTIVITY_TYPE || 'playing';
const BOT_ACTIVITY_NAME = process.env.BOT_ACTIVITY_NAME || 'with code!';

function getActivityType(type: string) {
  switch (type) {
    case 'streaming':
      return ActivityType.Streaming;
    case 'listening':
      return ActivityType.Listening;
    case 'watching':
      return ActivityType.Watching;
    case 'competing':
      return ActivityType.Competing;
    default:
      return ActivityType.Playing;
  }
}

export function startBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);

    readyClient.user.setPresence({
      status: BOT_STATUS || 'online',
      activities: [
        {
          name: BOT_ACTIVITY_NAME,
          type: getActivityType(BOT_ACTIVITY_TYPE),
        },
      ],
    });
  });

  client.on(Events.ThreadCreate, async (thread) => {
    const parent = thread.parent;

    if (!parent || parent.type !== ChannelType.GuildForum) return;

    const tagNames = thread.appliedTags
      .map(
        (tagId) => parent.availableTags.find((tag) => tag.id === tagId)?.name,
      )
      .filter((tag): tag is string => !!tag);

    const message = await thread.fetchStarterMessage();
    if (!message) return;

    const card = await createTrelloCard(
      thread.name,
      message.content || '',
      tagNames,
    );

    console.log('Thread:', thread.name);
    console.log('Tags:', tagNames);
    console.log('Trello Card:', card.url);
  });

  client.login(TOKEN);
}
