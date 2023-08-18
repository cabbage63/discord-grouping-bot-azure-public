export function getResult(context, group_num, user_ids){
    const copied_user_ids = [...user_ids]
    let group_index = 1
    const groups = {}
    let result = ""

    while(copied_user_ids.length > 0){
        // 配列からIDを1つランダムでとってくる
        const randomIndex = Math.floor(Math.random() * copied_user_ids.length);
        const user_id = copied_user_ids.splice(randomIndex, 1)[0];

        // オブジェクトに入れる
        groups[`group${group_index}`] = groups[`group${group_index}`] ? [...groups[`group${group_index}`], user_id] : [user_id]

        group_index = (group_index)%(group_num)+1;
    }

    Object.keys(groups).forEach(key => {
        const value = groups[key];
        const group_members_list = value.reduce((prev,cur)=>prev+`<@${cur.toString()}>`, "");
        result += `${key.replace("group","グループ")}: ${group_members_list}\n`
    });

    return result;
}