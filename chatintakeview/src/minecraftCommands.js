const commands = [
    {command: "/execute at **name** run summon minecraft:vindicator ^ ^2 ^2\n", name: "Lone Vindicator"},
    {command: "/execute at **name** run summon minecraft:elder_guardian ^ ^2 ^2\n", name: "Spawn Elder Guardian"},
    {command: "guardian", name: "GUAAARDIAN SQUAA", hoard: true},
    {command: "husk", name: "Husky Hankers", hoard: true},
    {command: "blaze", name: "Blaze Hoard", hoard: true},
    {command: "magma_cube", name: "Magma Cubed", hoard: true},
    {command: "witch", name: "Witch Wumble", hoard: true},
    {command: "boat", name: "BOATS GALORE", hoard: true},
    {command: "polar_bear\n", name: "POLAR BEARS", hoard: true},
    {command: "skeleton", name: "Gaggle Of Skeletons", hoard: true},
    //less rares 10
    {command: "/execute at **name** run summon tnt ~ ~ ~\n", name: "Beeeg Tnt"},
    {command: "/effect give **name** minecraft:poison 60\n", name: "Poison.."},
    {command: "/fill 6 63 1 6 63 1 minecraft:redstone_block\n", name: "Tnt Chase", special: true},//new
    {command: "tnt_minecart", name: "TNT Minecarts", hoard: true},
    //rares consider beacon 14
    {command: "/execute at **name** run summon minecraft:ender_dragon ^ ^2 ^2\n", name: "Spawn Ender Dragon"},
    {command: "ghast", name: "Ghasts(DO NOT TOUCH)", hoard: true},
    {command: "/tp **name** 0 117 5996\n", name: "Back to Spawn"},
    {command: "creeper", name: "Creeper Coup", hoard: true},
    {command: "tnt", name: "TNT Hoard", hoard: true},
    {command: "/execute at **name** run summon minecraft:wither ^ ^2 ^2\n", name: "Spawn Wither"},
    {command: `/execute at **name** run summon minecraft:iron_golem ^ ^2 ^2 {CustomName:'{"text":"BigBaldSK"}'}\n`, name: "BigBaldSK"},
];
module.exports = commands;