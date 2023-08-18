import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  verifyDiscordRequest,
  sendDiscordRequest,
} from "../services/utils.mjs";
import { getResult } from "../services/grouping.mjs";

export default async function (context, req) {
  await verifyDiscordRequest(context, req, process.env.PUBLIC_KEY);
  /*
   * Interaction type and data
   * See https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
   */
  const { id, type, data } = req.body;
  // context.log("[Received Interaction]");
  // context.log("Type:", type);
  // context.log("ID:", id);
  // context.log("Data:", data);
  // context.log("req.body", req.body);

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return (context.res = {
      body: JSON.stringify({
        type: InteractionResponseType.PONG,
      }),
    });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === "test") {
      // Send a message into the channel where command was triggered from
      return (context.res = {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "hello world!!",
          },
        }),
      });
    }

    // "grouping" command
    if (name === "grouping") {
      const group_num = data.options[0].value;

      if (group_num <= 1) {
        return (context.res = {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "グループの数には2以上の数字を指定してください。",
            },
          }),
        });
      }

      return (context.res = {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "グループ分けするメンバーを選択してください。",
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.USER_SELECT,
                    custom_id: `user_select_${id}_${group_num}`, // Interaction ID
                    min_values: 2,
                    max_values: 25,
                  },
                ],
              },
            ],
          },
        }),
      });
    }
  } else if (type == InteractionType.MESSAGE_COMPONENT) {
    const customId = data.custom_id;
    const user_ids = data.values;

    if (customId.startsWith("user_select_")) {
      const group_num = customId.split("_")[3];
      const grouping_result = getResult(context, group_num, user_ids);

      context.res = {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: grouping_result,
          },
        }),
      };

      // Disable original select menu after selection
      // Using this API: https://discord.com/developers/docs/resources/channel#edit-message
      const endpoint = `/channels/${req.body.channel.id}/messages/${req.body.message.id}`;
      try {
        const RESET_MESSAGE = {
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.USER_SELECT,
                  custom_id: `user_select_${id}_${group_num}`, // Interaction ID
                  min_values: 2,
                  max_values: 25,
                  disabled: true,
                },
              ],
            },
          ],
        }
        await sendDiscordRequest(endpoint, { method: "PATCH", body: RESET_MESSAGE});
      } catch (err) {
        context.log("Editing message failed");
        context.log("Error editing message:", err);
        throw err;
      }
    }
  }
}
