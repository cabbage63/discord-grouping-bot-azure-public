import 'dotenv/config';
import { InstallGlobalCommands } from './utils.mjs';

// Grouping member command
const GROUPING_COMMAND = {
  name: 'grouping',
  description: 'メンバーをグループ分けします',
  type: 1,
  options: [
    {
      type: 4, // INTEGER
      name: 'group_num',
      description: 'グループの数',
      required: true,
    },
  ],
}

const ALL_COMMANDS = [GROUPING_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);