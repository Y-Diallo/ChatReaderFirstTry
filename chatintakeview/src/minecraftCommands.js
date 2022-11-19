const commands = [
    {command: "/execute at **name** run summon minecraft:vindicator ^ ^2 ^2\n", name: "Lone Vindicator"},
    {command: "husk", name: "Husky Hankers", hoard: true},
    {command: "blaze", name: "Blaze Hoard", hoard: true},
    {command: "witch", name: "Witch Wumble", hoard: true},
    {command: "boat", name: "BOATS GALORE", hoard: true},
    //less rares 10
    {command: "/effect give **name** minecraft:poison 60\n", name: "Poison.."},
    {command: "/effect give **name** minecraft:poison 60\n", name: "PACKWATCH RIPBOZO"},
    //rares consider beacon 14
    {command: "/tp **name** 0 117 5996\n", name: "Back to Spawn"},
    {command: "/tp **name** 0 117 5996\n", name: "Beacon"},
    {command: "/execute at **name** run summon minecraft:wither ^ ^2 ^2\n", name: "Wither"},
];
module.exports = commands;