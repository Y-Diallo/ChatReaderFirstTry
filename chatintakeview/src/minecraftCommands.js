const commands = [
    {command: "/execute at **name** run summon minecraft:vindicator ^ ^2 ^2\n", name: "Lone Vindicator"},
    {command: "greekfantasy:mad_cow", name: "COW BRIGADE", hoard: true},
    {command: "greekfantasy:unicorn", name: "How many horns?", hoard: true},
    {command: "/give **name** greekfantasy:dragon_tooth 20\n", name: "SOME HOMIES"},
    {command: "/effect give **name** minecraft:poison 60\n", name: "Poison.."},
    {command: "/give **name** cgm:bazooka\n", name: "Boom Boom", special: true},
    {command: "/give **name** cgm:heavy_rifle\n", name: "mfw round 3"},
    {command: "/give **name** cgm:pistol\n", name: "Gun"},
    //less rares 8
    {command: "greekfantasy:cyclops", name: "Cyclops Wumble", hoard: true},
    {command: "/effect give **name** minecraft:levitation 60\n", name: "Floaty boi"},
    {command: "/give **name** lucky:lucky_block 20\n", name: "LUCKY BLOCKS"},
    {command: "/give **name** elementalswords:air_sword\n", name: "AIR SWORD"},
    {command: "/give **name** elementalswords:fire_sword\n", name: "FIRE SWORD"},
    {command: "/give **name** elementalswords:water_sword\n", name: "WATER SWORD"},
    {command: "greekfantasy:cyprian", name: "what is that Hoard", hoard: true},
    {command: "/give **name** elementalswords:earth_sword\n", name: "EARTH SWORD"},
    {command: "/execute at **name** run summon greekfantasy:cerberus ^ ^2 ^2\n", name: "Cerberus"},
    {command: "/execute at **name** run summon greekfantasy:talos ^ ^2 ^2\n", name: "Talos Boss"},
    {command: "/execute at **name** run summon greekfantasy:hydra ^ ^2 ^2\n", name: "Hydra"},
    {command: "/execute at **name** run summon greekfantasy:bronze_bull ^ ^2 ^2\n", name: "Bronze Bull Of Legend"},
    //rares consider beacon 20
    {command: "/give **name** elementalswords:fusion_sword\n", name: "FUSION SWORD"},
    {command: "/execute in minecraft:overworld run tp **name** 61 74 -45\n", name: "Back to Spawn"},
    {command: "/execute in minecraft:the_end run tp **name** 50 62 12\n", name: "TO THE END"},
    {command: "/execute in the_bumblezone:the_bumblezone run tp **name** 64 126 67\n", name: "THE BUMBLEZONE"},
    {command: "/execute at **name** run summon minecraft:wither ^ ^2 ^2\n", name: "Wither"},

    {command: "/give **name** onepunchman:one_punch_essence\n", name: "ONE PUNCH"},
];
module.exports = commands;