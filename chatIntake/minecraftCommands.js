const commands = [
    {command: "/execute at yman234 run summon minecraft:elder_guardian ^ ^2 ^2\n", name: "Spawn Elder Guardian"},
    {command: "guardian", name: "GUAAARDIAN SQUAA", hoard: true},
    {command: "/execute at yman234 run summon minecraft:vindicator ^ ^2 ^2\n", name: "Lone Vindicator"},
    {command: "husk", name: "Husky Hankers", hoard: true},
    {command: "blaze", name: "Blaze Hoard", hoard: true},
    {command: "magma_cube", name: "Magma Cubed", hoard: true},
    {command: "witch", name: "Witch Wumble", hoard: true},
    {command: "boat", name: "BOATS GALORE", hoard: true},
    {command: "/kill @e\n", name: "Kill Everything"},
    {command: "skeleton", name: "Gaggle Of Skeletons", hoard: true},
    //less rares 10
    {command: "/execute at yman234 run summon tnt ~ ~ ~\n", name: "Beeeg Tnt"},
    {command: "/effect give yman234 minecraft:poison 60\n", name: "Poison.."},
    {command: "/fill 6 63 1 6 63 1 minecraft:redstone_block\n", name: "Tnt Chase", special: true},//new
    {command: "tnt_minecart", name: "TNT Minecarts", hoard: true},
    //rares consider beacon 14
    {command: "/execute at yman234 run summon minecraft:ender_dragon ^ ^2 ^2\n", name: "Spawn Ender Dragon"},
    {command: "ghast", name: "Ghasts(DO NOT TOUCH)", hoard: true},
    {command: "/tp yman234 0 117 5996\n", name: "Back to Spawn"},
    {command: "creeper", name: "Creeper Coup", hoard: true},
    {command: "tnt", name: "TNT Hoard", hoard: true},
    {command: "/execute at yman234 run summon minecraft:wither ^ ^2 ^2\n", name: "Spawn Wither"},
    {command: `/execute at yman234 run summon minecraft:iron_golem ^ ^2 ^2 {CustomName:'{"text":"BigBaldSK"}'}\n`, name: "BigBaldSK"},
];
module.exports = commands;