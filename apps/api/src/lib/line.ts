import { messagingApi } from '@line/bot-sdk';

const { MessagingApiClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

export const lineClient = new MessagingApiClient({
    channelAccessToken,
});

export const lineConfig = {
    channelAccessToken,
    channelSecret,
};
