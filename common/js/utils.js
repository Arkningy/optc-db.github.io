(function () {

    var FODDER_REGEX = new RegExp('(' + [
        'Group', 'Ensign Navy HQ', 'Armed \\w+ Unit', '[BM]illions Baroque', 'Eneru\'s Elect',
        'Skypiea (Guard|Enforcer)', '(Adept|Nomad|Hunter), Shandian',
        '(Seaman|Major|Corporal) Navy', 'Hoodlum.+Bounty Hunter', 'Punk Black Cat Pirates',
        'Arlong crewmember', 'Gunner|Cannoneer|Assassin Master', '^(Female|Giant).*(Red|Blue|Green|Yellow|Black) Pirates',
        '(Soldier|General) Zombie.*Shadow', 'Wild Zombie', 'Street Punk', 'Kuja Warriors', '(Naginata|Rifle|Saber|Bazooka|Knuckle) (Corporal|Major)', '(Strong|Speedy|Crafty|Hate-Filled|Egotistical) Soldier Zombie', '(Powerful|Sneaky|Blazing) General Zombie', '(Quick-Draw|Scheming|Technical|Quick-Strike|Strong-Arm|Bold) Gunman', '(Suppressor|Emergency|Perimeter) Jailer', '(Contemplative|All-Action) Guard', 'Fishman (Guard|Outlaw)', 'Punk Hazard Gas Mask Patrol Soldier', 'Punk Hazard Patrol Troop Corps', 'Donquixote Pirates Member', '(Tactical|Elite) Musketeers', '(Fighter Group|Reconnaissance Group|Electro Group), Guardians', 'Germa Kingdom Clone Soldier', 'Soul Homie', 'Chess Mercenaries', 'Wano Country Official'
    ].join(')|(') + ')', 'i');

    var utils = {};

    var fullNames = null, reverseEvoMap = null, reverseFamilyMap = null;

    /* * * * * Unit control * * * * */

    var parseUnit = function (element, n) {
        var piratefest = window.festival[n];

        // If multi-dimensional array (i.e. VS units), split into two
        if (piratefest && Array.isArray(piratefest[0])){
            var piratefest2 = piratefest[1];
            piratefest = piratefest[0]
        }
        if (element.length === 0)
            return [];
        if (element[15] && element[15].constructor != Array)
            element[15] = [element[15], element[15], element[15]];
        var limitHealth = element[12], limitAttack = element[13], limitRecovery = element[14], limitCooldown = 0, limitSlots = element[6];
        var limitexHealth = element[12], limitexAttack = element[13], limitexRecovery = element[14], limitexCooldown = 0, limitexSlots = element[6];
        var keylevel = 0;
        var LBhp = [], LBatk = [], LBrcv = [], LBsailor = [ 0 ], LBcaptain = [ 0 ];
        var LBhptotal = 0, LBatktotal = 0, LBrcvtotal = 0, LBsailors = 0, LBcaptains = 0;
        if (window.details) if(window.details[n + 1]) if(window.details[n + 1].limit){
            keylevel = Object.keys(window.details[n + 1].limit).length;
            for(var x in window.details[n + 1].limit) if (window.details[n + 1].limit[x].description.includes("LOCKED WITH KEY")) keylevel = x;
            //console.log(keylevel, n+1);
            for(var x in window.details[n + 1].limit){
                if (parseInt(x) < keylevel){
                    if (window.details[n + 1].limit[x].description.includes("Boosts base HP by ")) limitHealth += parseInt(window.details[n + 1].limit[x].description.substring(18), 10);
                    if (window.details[n + 1].limit[x].description.includes("Boosts base ATK by ")) limitAttack += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    if (window.details[n + 1].limit[x].description.includes("Boosts base RCV by ")) limitRecovery += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    if (window.details[n + 1].limit[x].description.includes("Reduce base Special Cooldown by ")) limitCooldown += parseInt(window.details[n + 1].limit[x].description.substring(32, 33), 10);
                    if (window.details[n + 1].limit[x].description.includes("additional Socket slot")) limitSlots += parseInt(window.details[n + 1].limit[x].description.substring(8, 9), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Boosts base HP by ")) {
                    limitexHealth += parseInt(window.details[n + 1].limit[x].description.substring(18), 10);
                    LBhptotal += parseInt(window.details[n + 1].limit[x].description.substring(18), 10)
                }
                if (window.details[n + 1].limit[x].description.includes("Boosts base ATK by ")){
                    limitexAttack += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    LBatktotal += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Boosts base RCV by ")){
                    limitexRecovery += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                    LBrcvtotal += parseInt(window.details[n + 1].limit[x].description.substring(19), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Reduce base Special Cooldown by ")){
                    limitexCooldown += parseInt(window.details[n + 1].limit[x].description.substring(32, 33), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("additional Socket slot")){
                    limitexSlots += parseInt(window.details[n + 1].limit[x].description.substring(8, 9), 10);
                }
                if (window.details[n + 1].limit[x].description.includes("Acquire Sailor Ability")){
                    LBsailors++;
                }
                if (window.details[n + 1].limit[x].description.includes("Acquire new Captain Ability")){
                    LBcaptains++;
                }
                LBhp.push(LBhptotal);
                LBatk.push(LBatktotal);
                LBrcv.push(LBrcvtotal);
                LBsailor.push(LBsailors);
                LBcaptain.push(LBcaptains);
            }
        }
        var result = {
            name: element[0], type: element[1],
            class: element[2], stars: element[3],
            cost: element[4], combo: element[5],
            slots: element[6], maxLevel: element[7],
            maxEXP: element[8], minHP: element[9],
            minATK: element[10], minRCV: element[11],
            maxHP: element[12], maxATK: element[13],
            maxRCV: element[14], limitHP: limitHealth, 
            limitATK: limitAttack, limitRCV: limitRecovery,
            limitSlot: limitSlots, limitCD: limitCooldown,
            limitexHP: limitexHealth, 
            limitexATK: limitexAttack, limitexRCV: limitexRecovery,
            limitexSlot: limitexSlots, limitexCD: limitexCooldown,
            growth: {
                hp: element[15] ? element[15][0] : 0,
                atk: element[15] ? element[15][1] : 0,
                rcv: element[15] ? element[15][2] : 0
            },
            number: n,
            limitStats: {
                hp: LBhp, atk: LBatk, rcv: LBrcv,
                sailors: LBsailor, captains: LBcaptain
            },
            pirateFest: {
                class: piratefest ? piratefest[0] : "",
                DEF: piratefest ? piratefest[1] : null,
                SPD: piratefest ? piratefest[2] : null,
                minCP: piratefest ? piratefest[3] : null,
                maxCP: piratefest ? piratefest[4] : null,
            },
            pirateFest2: (!piratefest2) ? null : {
                class: piratefest2 ? piratefest2[0] : "",
                DEF: piratefest2 ? piratefest2[1] : null,
                SPD: piratefest2 ? piratefest2[2] : null,
                minCP: piratefest2 ? piratefest2[3] : null,
                maxCP: piratefest2 ? piratefest2[4] : null,
            },
            aliases: window.aliases[n + 1] ? window.aliases[n + 1].join(' ') : '',
            families: (
                window.families
                && window.families[n + 1]
                && window.families[n + 1].map(utils.normalizeText)
            ) || null,
        };
        if (element.indexOf(null) != -1)
            result.incomplete = true;
        if (result.combo === null)
            result.preview = true;
        return result;
    };

    utils.parseUnits = function (skipIncomplete) {
        if (skipIncomplete) {
            window.units = window.units.map(function (x, n) {
                if (x.indexOf(null) == -1)
                    return x;
                var viable = x[9] && x[10] && x[11] && x[12] && x[13] && x[14];
                return viable ? x : [];
            });
        }
        window.units = window.units.map(parseUnit);
    };

    utils.getFullUnitName = function (id) {
        if (fullNames === null) {
            fullNames = units.map(function (x, n) {
                if (!x.name)
                    return null;
                let fullName = x.name;
                if (window.aliases && window.aliases[n + 1])
                    fullName += ', ' + window.aliases[n + 1].join(', ');
                if (window.families && window.families[n + 1])
                    fullName += ', ' + window.families[n + 1].join(', ');
                return fullName;
            });
        }
        return fullNames[id - 1] && utils.normalizeText(fullNames[id - 1]);
    };

    /**
     * Transforms a list of characters or types and classes from supported
     * characters or super special criteria into a query using family, type,
     * class, and cost operators.
     */
     utils.generateCriteriaQuery = function (criteria) {
        let families = [];
        let types = [];
        let classes = [];
        let matchers = [];
        let whitespaceRegex = /\s+/g;
        let aliasesRegex = /\s+\(.*?\)/g; // Denjiro (Kyoshiro)
        let specialCharactersRegex = /[*+?^${}()|[\]\\]/g; //except dot, no need to escape
        let costRegex = /characters with cost (\d+) or (less|higher)/i;
        let classRegex = /^(?:Fighter|Slasher|Striker|Shooter|Free Spirit|Powerhouse|Cerebral|Driven)$/i;

        // "[STR] Free Spirit", we can't just split all by spaces
        let typeRegex = /\[(.*?)\](?:\s+([\w ]+))?/i;

        // may be "and" or ", and" or ", " even with extra whitespace
        // if using .split(), you should use non-capturing groups (?:)
        let separatorRegex = /(?:\s*,\s*|\s+)(?:and|or)\s+|\s*,\s*/g;

        let costMatch = criteria.match(costRegex);
        if (costMatch){
            return 'cost' + (costMatch[2] == 'less' ? '<=' : '>=') + costMatch[1];
        } else {
            criteria = criteria.replace(aliasesRegex, '');
            let terms = criteria.split(separatorRegex);
            for (let term of terms) {
                let typeMatch = term.match(typeRegex);
                if (typeMatch) {
                    types.push(typeMatch[1]);
                    if (typeMatch[2])
                        classes.push(typeMatch[2]);
                } else if (classRegex.test(term)) {
                    classes.push(term);
                } else {
                    // escape special characters before pushing (except dot)
                    families.push(term.replace(specialCharactersRegex, '\\$&'));
                }
            }
        }

        // Create matchers
        if (families.length > 0) { // family should be exact match
            matchers.push('family:^(' + families.join('|').replace(whitespaceRegex, '_') + ')$');
        }
        if (types.length > 0) {
            matchers.push('type:' + types.join('|').replace(whitespaceRegex, '_'));
        }
        if (classes.length > 0) {
            matchers.push('class:' + classes.join('|').replace(whitespaceRegex, '_'));
        }
        return matchers.join(' ');
    }

    utils.generateSupportedCharactersQuery = function (criteria) {
        if (/All characters?/i.test(criteria))
            return null;
        return utils.generateCriteriaQuery(criteria.replace(/ characters?$/i, ''));
    }

    utils.generateSuperSpecialQuery = function (criteria) {
        let charactersRegex = /must consist of(?: \d)? (.*), excluding Support members/i;
        let match = criteria.match(charactersRegex);
        if (!match)
            return null;
        match[1] = match[1].replace(/ characters?$/i, '');
        return utils.generateCriteriaQuery(match[1]);
    }

    utils.generateFamilyExclusionQuery = function (families) {
        if (!families)
            return null;
        let specialCharactersRegex = /[*+?^${}()[\]\\]/g // except dot and pipe "|"
        let query = 'notFamily:^(' + families.join('|')
                .replace(/\s+/g, '_')
                .replace(specialCharactersRegex, '\\$&') + ')$';
        return query;
    }

    utils.normalizeText = function (str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    /**
     * @param {string} family Family name used in window.families.
     * @returns {Array|null} Array of unit ids that has the given family, or null if the family is not found.
     */
    utils.getUnitsInFamily = function (family) {
        return utils.getReverseFamilyMap()[family] || null;
    }

    /* * * * * Thumbnail control * * * * */
    
    utils.getGlobalThumbnailUrl = function (n) {
        if (n === null || n === undefined || (window.units && window.units[n - 1].incomplete))
            return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png';
        var id = ('0000' + n).slice(-4).replace(/(057[54])/, '0$1');
        return 'https://onepiece-treasurecruise.com/wp-content/uploads/sites/2/f' + id + '.png';
    };

    utils.getThumbnailUrl = function (n) {
        switch (n){
            case 'skullLuffy':
            case 9001: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_luffy.png'; break;
            case 'skullZoro':
            case 9002: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_zoro.png'; break;
            case 'skullNami':
            case 9003: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_nami.png'; break;
            case 'skullUsopp':
            case 9004: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_usopp_f.png'; break;
            case 'skullSanji':
            case 9005: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_sanji_f.png'; break;
            case 'skullChopper':
            case 9006: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_chopper_f.png'; break;
            case 'skullRobin':
            case 9007: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_robin_f.png'; break;
            case 'skullFranky':
            case 9008: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_franky_f.png'; break;
            case 'skullBrook':
            case 9009: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_brook_f.png'; break;
            case 'skullSTR':
            case 9010: return 'https://onepiece-treasurecruise.com/wp-content/uploads/red_skull_f.png'; break;
            case 'skullQCK':
            case 9011: return 'https://onepiece-treasurecruise.com/wp-content/uploads/blue_skull_f.png'; break;
            case 'skullPSY':
            case 9012: return 'https://onepiece-treasurecruise.com/wp-content/uploads/yellow_skull2_f.png'; break;
            case 'skullDEX':
            case 9013: return 'https://onepiece-treasurecruise.com/wp-content/uploads/green_skull2_f.png'; break;
            case 'skullINT':
            case 9014: return 'https://onepiece-treasurecruise.com/wp-content/uploads/black_skull_f.png'; break;
            case 'skullJudge':
            case 9015: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f1.png'; break;
            case 'skullReiju':
            case 9016: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f2.png'; break;
            case 'skullIchiji':
            case 9017: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f3.png'; break;
            case 'skullNiji':
            case 9018: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f4.png'; break;
            case 'skullYonji':
            case 9019: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f5.png'; break;
            case 'skullDoffy':
            case 9020: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_f.png'; break;
            case 'skullEnel':
            case 9021: return 'https://onepiece-treasurecruise.com/wp-content/uploads/enel_skull_f.png'; break;
            case 'skullHiguma':
            case 9022: return 'https://onepiece-treasurecruise.com/wp-content/uploads/higuma_skull_f.png'; break;
            case 'skullSanji2':
            case 9023: return 'https://onepiece-treasurecruise.com/wp-content/uploads/sanji_skull_f.png'; break;
            case 'skullFrankie':
            case 9024: return 'https://onepiece-treasurecruise.com/wp-content/uploads/frankie_skull_f.png'; break;
            case 'skullCavendish':
            case 9025: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Cavendish_skull_f.png'; break;
            case 'skullDoflamingo':
            case 9026: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_f2.png'; break;
            case 'skullIchiji2':
            case 9027: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f6.png'; break;
            case 'skullNiji2':
            case 9028: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f7.png'; break;
            case 'skullYonji2':
            case 9029: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f8.png'; break;
            case 'skullReiju2':
            case 9030: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_f9.png'; break;
            case 'skullHancock':
            case 9031: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Hancock_skull_f.png'; break;
            case 'skullNami2':
            case 9032: return 'https://onepiece-treasurecruise.com/wp-content/uploads/nami_skull_f.png'; break;
            case 'skullBullet':
            case 9033: return '../res/skullBullet.png'; break;
            case 'skullKatakuri':
            case 9034: return '../res/skullKatakuri.png'; break;
            case 'skullWhitebeard':
            case 9035: return '../res/skullWhitebeard.png'; break;
            case 'skullCP9':
            case 9036: return '../res/skullCP9.png'; break;
            case 'skullRaidKaido':
            case 9037: return '../res/skullKaidoRaid.png'; break;
            case 'skullBlackbeard':
            case 9038: return '../res/skullBlackbeard.png'; break;
            case 'skullZoro2':
            case 9039: return '../res/skullZoro2.png'; break;
            case 'skullSanji3':
            case 9040: return '../res/skullSanji2.png'; break;
            case 'skullMihawk':
            case 9041: return '../res/skullMihawk.png'; break;
            case 'skullNami3':
            case 9042: return '../res/skullNamiv2.png'; break;
            case 'skullCracker':
            case 9043: return '../res/skullCracker.png'; break;
            case 'skullKomurasaki':
            case 9044: return '../res/skullKomurasaki.png'; break;
            case 'skullKuja':
            case 9045: return '../res/skullKuja.png'; break;
            case 'skullGerma':
            case 9046: return '../res/skullGerma.png'; break;
            case 'skullSabo':
            case 9047: return '../res/skullSabo.png'; break;
            case 'skullJack':
            case 9048: return '../res/skullJack.png'; break;
            case 'skullCarrot':
            case 9049: return '../res/skullCarrot.png'; break;
            case 'skullJack2':
            case 9050: return '../res/skullJack2.png'; break;
            case 'skullLinlin':
            case 9051: return '../res/skullLinlin.png'; break;
            case 'skullYamato':
            case 9052: return '../res/skullYamato.png'; break;
            case 'skullPudding':
            case 9053: return '../res/skullPudding.png'; break;
            case 'skullKrieg':
            case 9054: return '../res/skullKrieg.png'; break;
            case 'skullBrook2':
            case 9055: return '../res/skullBrook2.png'; break;
            case 'skullOden':
            case 9056: return '../res/skullOden.png'; break;
        }
        if (n === null || n === undefined)
            return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png';
        if ((window.units && window.units[n - 1].incomplete)){
            switch (window.units[n - 1].type){
                case 'STR': return '../res/blank_str.png'; break;
                case 'DEX': return '../res/blank_dex.png'; break;
                case 'QCK': return '../res/blank_qck.png'; break;
                case 'PSY': return '../res/blank_psy.png'; break;
                case 'INT': return '../res/blank_int.png'; break;
                default: return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png'; break;
            }
        }
        var id = ('0000' + n).slice(-4).replace(/(057[54])/, '0$1'); // missing aokiji image
        var ghostPoint = 5000;
        switch(id){
            case '0742': return 'https://onepiece-treasurecruise.com/wp-content/uploads/f0742-2.png'; break;
            //case '2262': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5011.png'; break;
            //case '2263': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5012.png'; break;
            //case '2399': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5015.png'; break;
            //case '2440': return '../res/character_10643_t1.png'; break;
            //case '2441': return '../res/character_10644_t1.png'; break;
            //case '2500': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f2500.png'; break;
            //case '2663': return '../res/character_10713_t1.png'; break;
            //case '2664': return '../res/character_10714_t1.png'; break;
            //case '2685': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5025.png'; break;
            //case '2686': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5026.png'; break;
            //case '2768': return '../res/character_10258_t1.png'; break;
            //case '2769': return '../res/character_10259_t1.png'; break;
            //case '2770': return '../res/character_10262_t1.png'; break;
            //case '2771': return '../res/character_10263_t1.png'; break;
            //case '2772': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5037.png'; break;
            //case '2784': return '../res/character_10642_t1.png'; break;
            //case '2818': return '../res/character_10707_t1.png'; break;
            //case '2819': return '../res/character_10708_t1.png'; break;
            //case '2909': return '../res/character_11173_t1.png'; break;
            //case '2919': return '../res/character_10891_t1.png'; break;
            //case '2929': return '../res/character_11221_t1.png'; break;
            //case '2930': return '../res/character_11199_t1.png'; break;
            case '3000': return 'https://onepiece-treasurecruise.com/wp-content/uploads/f3000_1.png'; break;
            //case '3080': return '../res/sadBandai/character_11669_t1.png'; break;
            //case '3081': return '../res/sadBandai/character_11506_t1.png'; break;
            //case '3085': return '../res/sadBandai/character_11668_t1.png'; break;
            //case '3086': return '../res/sadBandai/character_11505_t1.png'; break;
            //case '3087': return '../res/sadBandai/character_11707_t1.png'; break;
            //case '3088': return '../res/sadBandai/character_11708_t1.png'; break;
            //case '3089': return '../res/sadBandai/character_11709_t1.png'; break;
            //case '3090': return '../res/sadBandai/character_11086_t1.png'; break;
            //case '3091': return '../res/sadBandai/character_11087_t1.png'; break;
            //case '3092': return '../res/sadBandai/character_11088_t1.png'; break;
            //case '3093': return '../res/sadBandai/character_11089_t1.png'; break;
            //case '3094': return '../res/sadBandai/character_11710_t1.png'; break;
            //case '3095': return '../res/sadBandai/character_11409_t1.png'; break;
            //case '3096': return '../res/sadBandai/character_11705_t1.png'; break;
            //case '3097': return '../res/sadBandai/character_11711_t1.png'; break;
            //case '3098': return '../res/sadBandai/character_11714_t1.png'; break;
            //case '3099': return '../res/sadBandai/character_11715_t1.png'; break;
            //case '3100': return '../res/sadBandai/character_11716_t1.png'; break;
            //case '3101': return '../res/sadBandai/character_11717_t1.png'; break;
            //case '3102': return '../res/sadBandai/character_11718_t1.png'; break;
            //case '3103': return '../res/sadBandai/character_11719_t1.png'; break;
            //case '3104': return '../res/sadBandai/character_11720_t1.png'; break;
            //case '3105': return '../res/sadBandai/character_11721_t1.png'; break;
            //case '3106': return '../res/sadBandai/character_11722_t1.png'; break;
            //case '3107': return '../res/sadBandai/character_11727_t1.png'; break;
            //case '3108': return '../res/sadBandai/character_11724_t1.png'; break;
            //case '3109': return '../res/sadBandai/character_11725_t1.png'; break;
            //case '3110': return '../res/sadBandai/character_11728_t1.png'; break;
            case '3111': return '../res/sadBandai/character_11762_t1.png'; break;
            //case '3112': return '../res/sadBandai/character_11800_t1.png'; break;
            //case '3113': return '../res/sadBandai/character_11801_t1.png'; break;
            //case '3114': return '../res/sadBandai/character_11802_t1.png'; break;
            //case '3115': return '../res/sadBandai/character_11803_t1.png'; break;
            //case '3116': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3117': return '../res/sadBandai/character_11804_t1.png'; break;
            //case '3118': return '../res/sadBandai/character_11805_t1.png'; break;
            //case '3119': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3120': return '../res/sadBandai/character_11806_t1.png'; break;
            //case '3121': return '../res/sadBandai/character_11807_t1.png'; break;
            //case '3122': return '../res/sadBandai/character_11334_t1.png'; break;
            //case '3123': return '../res/sadBandai/character_11335_t1.png'; break;
            //case '3124': return '../res/sadBandai/character_11808_t1.png'; break;
            //case '3125': return '../res/sadBandai/character_11726_t1.png'; break;
            //case '3126': return '../res/sadBandai/character_11580_t1.png'; break;
            //case '3127': return '../res/sadBandai/character_11581_t1.png'; break;
            //case '3128': return '../res/sadBandai/character_11569_t1.png'; break;
            //case '3129': return '../res/sadBandai/character_11570_t1.png'; break;
            //case '3130': return '../res/sadBandai/character_11911_t1.png'; break;
            //case '3131': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3132': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3133': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3134': return '../res/sadBandai/character_11809_t1.png'; break;
            //case '3135': return '../res/sadBandai/character_11678_t1.png'; break;
            //case '3136': return '../res/sadBandai/character_11679_t1.png'; break;
            //case '3137': return '../res/sadBandai/character_11680_t1.png'; break;
            //case '3138': return '../res/sadBandai/character_11681_t1.png'; break;
            //case '3139': return '../res/sadBandai/character_11682_t1.png'; break;
            //case '3140': return '../res/sadBandai/character_11683_t1.png'; break;
            //case '3141': return '../res/sadBandai/character_11684_t1.png'; break;
            //case '3142': return '../res/sadBandai/character_11811_t1.png'; break;
            //case '3143': return '../res/sadBandai/character_11813_t1.png'; break;
            //case '3144': return '../res/sadBandai/character_11810_t1.png'; break;
            //case '3145': return '../res/sadBandai/character_11518_t1.png'; break;
            //case '3146': return '../res/sadBandai/character_11815_t1.png'; break;
            //case '3147': return '../res/sadBandai/character_11816_t1.png'; break;
            //case '3148': return '../res/sadBandai/character_11817_t1.png'; break;
            //case '3149': return '../res/sadBandai/character_11406_t1.png'; break;
            //case '3150': return '../res/sadBandai/character_11814_t1.png'; break;
            //case '3151': return '../res/sadBandai/character_11217_t1.png'; break;
            //case '3152': return '../res/sadBandai/character_11819_t1.png'; break;
            //case '3153': return '../res/sadBandai/character_11818_t1.png'; break;
            //case '3154': return '../res/sadBandai/character_11407_t1.png'; break;
            //case '3155': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3156': return '../res/sadBandai/character_11400_t1.png'; break;
            //case '3156': return '../res/character_11400_t1.png'; break;
            //case '3157': return '../res/character_11338_t1.png'; break;
            //case '3157': return '../res/sadBandai/character_11338_t1.png'; break;
            //case '3158': return '../res/sadBandai/character_11812_t1.png'; break;
            //case '3159': return '../res/sadBandai/character_10768_t1.png'; break;
            //case '3160': return '../res/sadBandai/character_10484_t1.png'; break;
            //case '3161': return '../res/sadBandai/character_11112_t1.png'; break;
            //case '3162': return '../res/sadBandai/character_11556_t1.png'; break;
            //case '3163': return '../res/sadBandai/character_11855_t1.png'; break;
            //case '3164': return '../res/sadBandai/character_11856_t1.png'; break;
            //case '3165': return '../res/sadBandai/character_11861_t1.png'; break;
            //case '3166': return '../res/sadBandai/character_11862_t1.png'; break;
            //case '3167': return '../res/sadBandai/character_11863_t1.png'; break;
            //case '3168': return '../res/sadBandai/character_11864_t1.png'; break;
            //case '3169': return '../res/sadBandai/character_11865_t1.png'; break;
            //case '3170': return '../res/sadBandai/character_11866_t1.png'; break;
            //case '3171': return '../res/sadBandai/character_11867_t1.png'; break;
            //case '3172': return '../res/sadBandai/character_11868_t1.png'; break;
            //case '3173': return '../res/sadBandai/character_11821_t1.png'; break;
            //case '3174': return '../res/sadBandai/character_11824_t1.png'; break;
            //case '3175': return '../res/sadBandai/character_11825_t1.png'; break;
            //case '3176': return '../res/sadBandai/character_11826_t1.png'; break;
            //case '3177': return '../res/sadBandai/character_11827_t1.png'; break;
            //case '3178': return '../res/sadBandai/character_11873_t1.png'; break;
            //case '3179': return '../res/sadBandai/character_11874_t1.png'; break;
            //case '3180': return '../res/sadBandai/character_11875_t1.png'; break;
            //case '3181': return '../res/sadBandai/character_11876_t1.png'; break;
            //case '3182': return '../res/sadBandai/character_11877_t1.png'; break;
            //case '3183': return '../res/sadBandai/character_11878_t1.png'; break;
            //case '3184': return '../res/sadBandai/character_11879_t1.png'; break;
            //case '3185': return '../res/sadBandai/character_11880_t1.png'; break;
            //case '3186': return '../res/sadBandai/character_11881_t1.png'; break;
            //case '3187': return '../res/sadBandai/character_11883_t1.png'; break;
            //case '3188': return '../res/sadBandai/character_11882_t1.png'; break;
            //case '3189': return '../res/sadBandai/character_11823_t1.png'; break;
            //case '3190': return '../res/sadBandai/character_11870_t1.png'; break;
            //case '3191': return '../res/sadBandai/character_11871_t1.png'; break;
            //case '3192': return '../res/sadBandai/character_11872_t1.png'; break;
            //case '3193': return '../res/sadBandai/character_11200_t1.png'; break;
            //case '3194': return '../res/sadBandai/character_11201_t1.png'; break;
            //case '3195': return '../res/sadBandai/character_11202_t1.png'; break;
            //case '3196': return '../res/sadBandai/character_11203_t1.png'; break;
            //case '3197': return '../res/sadBandai/character_11869_t1.png'; break;
            //case '3198': return '../res/sadBandai/character_11602_t1.png'; break;
            //case '3199': return '../res/sadBandai/character_11603_t1.png'; break;
            //case '3200': return '../res/sadBandai/character_11450_t1.png'; break;
            //case '3201': return '../res/sadBandai/character_11352_t1.png'; break;
            //case '3202': return '../res/sadBandai/character_11822_t1.png'; break;
            //case '3203': return '../res/sadBandai/character_11908_t1.png'; break;
            //case '3204': return '../res/sadBandai/character_11909_t1.png'; break;
            //case '3205': return '../res/sadBandai/character_11910_t1.png'; break;
            //case '3206': return '../res/sadBandai/character_11820_t1.png'; break;
            //case '3207': return '../res/sadBandai/character_11903_t1.png'; break;
            //case '3208': return '../res/sadBandai/character_11902_t1.png'; break;
            //case '3209': return '../res/sadBandai/character_11901_t1.png'; break;
            //case '3210': return '../res/sadBandai/character_11912_t1.png'; break;
            //case '3211': return '../res/sadBandai/character_11927_t1.png'; break;
            //case '3212': return '../res/sadBandai/character_11913_t1.png'; break;
            //case '3213': return '../res/sadBandai/character_11914_t1.png'; break;
            //case '3214': return '../res/sadBandai/character_11916_t1.png'; break;
            //case '3215': return '../res/sadBandai/character_11917_t1.png'; break;
            //case '3216': return '../res/sadBandai/character_11918_t1.png'; break;
            //case '3217': return '../res/sadBandai/character_11915_t1.png'; break;
            //case '3218': return '../res/sadBandai/character_11919_t1.png'; break;
            //case '3219': return '../res/sadBandai/character_11920_t1.png'; break;
            //case '3220': return '../res/sadBandai/character_11921_t1.png'; break;
            //case '3221': return '../res/sadBandai/character_11922_t1.png'; break;
            //case '3222': return '../res/sadBandai/character_11951_t1.png'; break;
            //case '3223': return '../res/sadBandai/character_11952_t1.png'; break;
            //case '3224': return '../res/sadBandai/character_11923_t1.png'; break;
            //case '3225': return '../res/sadBandai/character_11924_t1.png'; break;
            //case '3226': return '../res/sadBandai/character_11926_t1.png'; break;
            //case '3227': return '../res/sadBandai/character_11174_t1.png'; break;
            //case '3228': return '../res/sadBandai/character_11517_t1.png'; break;
            //case '3229': return '../res/sadBandai/character_11954_t1.png'; break;
            //case '3230': return '../res/sadBandai/character_11955_t1.png'; break;
            //case '3231': return '../res/sadBandai/character_11956_t1.png'; break;
            //case '3232': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3233': return '../res/sadBandai/character_11617_t1.png'; break;
            //case '3234': return '../res/sadBandai/character_12077_t1.png'; break;
            //case '3235': return '../res/sadBandai/character_11953_t1.png'; break;
            //case '3236': return '../res/sadBandai/character_11186_t1.png'; break;
            //case '3237': return '../res/sadBandai/character_11958_t1.png'; break;
            //case '3238': return '../res/sadBandai/character_11959_t1.png'; break;
            //case '3239': return '../res/sadBandai/character_11960_t1.png'; break;
            //case '3240': return '../res/sadBandai/character_11957_t1.png'; break;
            //case '3241': return '../res/sadBandai/character_11961_t1.png'; break;
            //case '3242': return '../res/sadBandai/character_11962_t1.png'; break;
            //case '3243': return '../res/sadBandai/character_11623_t1.png'; break;
            //case '3244': return '../res/sadBandai/character_11078_t1.png'; break;
            //case '3245': return '../res/sadBandai/character_11079_t1.png'; break;
            //case '3246': return '../res/sadBandai/character_11963_t1.png'; break;
            //case '3247': return '../res/sadBandai/character_11964_t1.png'; break;
            //case '3248': return '../res/sadBandai/character_11965_t1.png'; break;
            //case '3249': return '../res/sadBandai/character_11966_t1.png'; break;
            //case '3250': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3251': return '../res/sadBandai/character_11369_t1.png'; break;
            //case '3252': return '../res/sadBandai/character_11971_t1.png'; break;
            //case '3253': return '../res/sadBandai/character_11972_t1.png'; break;
            //case '3254': return '../res/sadBandai/character_12001_t1.png'; break;
            //case '3255': return '../res/sadBandai/character_11225_t1.png'; break;
            //case '3256': return '../res/sadBandai/character_11973_t1.png'; break;
            //case '3257': return '../res/sadBandai/character_11974_t1.png'; break;
            //case '3258': return '../res/sadBandai/character_11975_t1.png'; break;
            //case '3259': return '../res/sadBandai/character_11976_t1.png'; break;
            //case '3260': return '../res/sadBandai/character_11977_t1.png'; break;
            //case '3261': return '../res/sadBandai/character_11978_t1.png'; break;
            //case '3262': return '../res/sadBandai/character_11979_t1.png'; break;
            //case '3263': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3264': return '../res/sadBandai/character_12131_t1.png'; break;
            //case '3265': return '../res/sadBandai/character_11355_t1.png'; break;
            //case '3266': return '../res/sadBandai/character_11357_t1.png'; break;
            //case '3267': return '../res/sadBandai/character_11358_t1.png'; break;
            //case '3268': return '../res/sadBandai/character_11359_t1.png'; break;
            //case '3269': return '../res/sadBandai/character_11925_t1.png'; break;
            //case '3270': return '../res/sadBandai/character_12002_t1.png'; break;
            //case '3271': return '../res/sadBandai/character_12003_t1.png'; break;
            //case '3272': return '../res/sadBandai/character_12004_t1.png'; break;
            //case '3273': return '../res/sadBandai/character_11980_t1.png'; break;
            //case '3276': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3277': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3278': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3279': return '../res/sadBandai/character_11_t1.png'; break;
            //case '3312': return '../res/character_10852_t1.png'; break;
            //case '3313': return '../res/character_10853_t1.png'; break;
            //case '3314': return '../res/character_10861_t1.png'; break;
            //case '3315': return '../res/character_10862_t1.png'; break;
            //case '3316': return '../res/character_10994_t1.png'; break;
            //case '3317': return '../res/character_10995_t1.png'; break;
            //case '3318': return '../res/character_10858_t1.png'; break;
            //case '3319': return '../res/character_10859_t1.png'; break;
            //case '3320': return '../res/character_10860_t1.png'; break;
            //case '3321': return '../res/character_10869_t1.png'; break;
            //case '3322': return '../res/character_10870_t1.png'; break;
            //case '3323': return '../res/character_10867_t1.png'; break;
            //case '3324': return '../res/character_10868_t1.png'; break;
            //case '3325': return '../res/character_10863_t.png'; break;
            //case '3326': return '../res/character_10864_t.png'; break;
            //case '3327': return '../res/character_11333_t1.png'; break;
            //case '3327': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5059.png'; break;
            //case '3330': return '../res/KDugejE.png'; break;
            //case '3331': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5052.png'; break;
            //case '3333': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5013.png'; break;
            //case '3334': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5014.png'; break;
            //case '3347': return '../res/character_1508_t1.png'; break;
            //case '3348': return '../res/character_1509_t1.png'; break;
            //case '3349': return '../res/character_1510_t1.png'; break;
            //case '3350': return '../res/character_1511_t1.png'; break;
            //case '3360': return '../res/character_11037_t1.png'; break;
            //case '3361': return '../res/character_11038_t1.png'; break;
            //case '3371': return '../res/character_11243_t.png'; break;
            //case '3372': return '../res/character_11244_t.png'; break;
            //case '3373': return '../res/character_11245_t.png'; break;
            //case '3374': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5053.png'; break;
            //case '3382': return '../res/character_11615_t1.png'; break;
            //case '3383': return '../res/character_11760_t.png'; break;
            //case '3384': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5053.png'; break;
            case '4986': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5013.png'; break;
            case '4987': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/f5014.png'; break;
            case '4988': return '../res/character_1508_t1.png'; break;
            case '4989': return '../res/character_1509_t1.png'; break;
            case '4990': return '../res/character_1510_t1.png'; break;
            case '4991': return '../res/character_1511_t1.png'; break;
            case '4992': return '../res/character_11037_t1.png'; break;
            case '4993': return '../res/character_11038_t1.png'; break;
            case '4994': return '../res/character_11243_t.png'; break;
            case '4995': return '../res/character_11244_t.png'; break;
            case '4996': return '../res/character_11245_t.png'; break;
            case '3383': return '../res/character_11615_t1.png'; break;
            case '3478': return '../res/character_11760_t.png'; break;
            case (ghostPoint+0).toString(): return '../res/character_10185_t1.png'; break;
            case (ghostPoint+1).toString(): return '../res/character_10186_t1.png'; break;
            case (ghostPoint+2).toString(): return '../res/character_10187_t1_int.png'; break;
            case (ghostPoint+3).toString(): return '../res/character_10187_t1_psy.png'; break;
            case (ghostPoint+4).toString(): return '../res/character_10173_t1.png'; break;
            case (ghostPoint+5).toString(): return '../res/character_10174_t1.png'; break;
            case (ghostPoint+6).toString(): return '../res/character_10177_t1_qck.png'; break;
            case (ghostPoint+7).toString(): return '../res/character_10177_t1_str.png'; break;
            case (ghostPoint+8).toString(): return '../res/character_10175_t1.png'; break;
            case (ghostPoint+9).toString(): return '../res/character_10176_t1.png'; break;
            case (ghostPoint+10).toString(): return '../res/character_10178_t1_qck.png'; break;
            case (ghostPoint+11).toString(): return '../res/character_10178_t1_str.png'; break;
            case (ghostPoint+12).toString(): return '../res/character_10181_t1.png'; break;
            case (ghostPoint+13).toString(): return '../res/character_10182_t1.png'; break;
            case (ghostPoint+14).toString(): return '../res/character_10183_t1_psy.png'; break;
            case (ghostPoint+15).toString(): return '../res/character_10183_t1_dex.png'; break;
            case (ghostPoint+16).toString(): return '../res/character_10344_t1.png'; break;
            case (ghostPoint+17).toString(): return '../res/character_10345_t1.png'; break;
            case (ghostPoint+18).toString(): return '../res/character_10348_t1_psy.png'; break;
            case (ghostPoint+19).toString(): return '../res/character_10348_t1_int.png'; break;
            case (ghostPoint+20).toString(): return '../res/character_10346_t1.png'; break;
            case (ghostPoint+21).toString(): return '../res/character_10347_t1.png'; break;
            case (ghostPoint+22).toString(): return '../res/character_10349_t1_psy.png'; break;
            case (ghostPoint+23).toString(): return '../res/character_10349_t1_int.png'; break;
            case (ghostPoint+24).toString(): return '../res/character_10496_t1.png'; break;
            case (ghostPoint+25).toString(): return '../res/character_10497_t1.png'; break;
            case (ghostPoint+26).toString(): return '../res/character_10498_t1_dex.png'; break;
            case (ghostPoint+27).toString(): return '../res/character_10498_t1_str.png'; break;
            case (ghostPoint+28).toString(): return '../res/character_10649_t1.png'; break;
            case (ghostPoint+29).toString(): return '../res/character_10650_t1.png'; break;
            case (ghostPoint+30).toString(): return '../res/character_10653_t1_dex.png'; break;
            case (ghostPoint+31).toString(): return '../res/character_10653_t1_qck.png'; break;
            case (ghostPoint+32).toString(): return '../res/character_10651_t1.png'; break;
            case (ghostPoint+33).toString(): return '../res/character_10652_t1.png'; break;
            case (ghostPoint+34).toString(): return '../res/character_10654_t1_dex.png'; break;
            case (ghostPoint+35).toString(): return '../res/character_10654_t1_qck.png'; break;
            case (ghostPoint+36).toString(): return '../res/character_10720_t1.png'; break;
            case (ghostPoint+37).toString(): return '../res/character_10721_t1.png'; break;
            case (ghostPoint+38).toString(): return '../res/character_10724_t1_psy.png'; break;
            case (ghostPoint+39).toString(): return '../res/character_10722_t1.png'; break;
            case (ghostPoint+40).toString(): return '../res/character_10723_t1.png'; break;
            case (ghostPoint+41).toString(): return '../res/character_10725_t1_psy.png'; break;
            case (ghostPoint+42).toString(): return '../res/character_10735_t1.png'; break;
            case (ghostPoint+43).toString(): return '../res/character_10736_t1.png'; break;
            case (ghostPoint+44).toString(): return '../res/character_10739_t1_psy.png'; break;
            case (ghostPoint+45).toString(): return '../res/character_10739_t1_qck.png'; break;
            case (ghostPoint+46).toString(): return '../res/character_10737_t1.png'; break;
            case (ghostPoint+47).toString(): return '../res/character_10738_t1.png'; break;
            case (ghostPoint+48).toString(): return '../res/character_10740_t1_psy.png'; break;
            case (ghostPoint+49).toString(): return '../res/character_10740_t1_qck.png'; break;
            case (ghostPoint+50).toString(): return '../res/character_10832_t1.png'; break;
            case (ghostPoint+51).toString(): return '../res/character_10833_t1.png'; break;
            case (ghostPoint+52).toString(): return '../res/character_10836_t1_int.png'; break;
            case (ghostPoint+53).toString(): return '../res/character_10836_t1_qck.png'; break;
            case (ghostPoint+54).toString(): return '../res/character_10834_t1.png'; break;
            case (ghostPoint+55).toString(): return '../res/character_10835_t1.png'; break;
            case (ghostPoint+56).toString(): return '../res/character_10837_t1_int.png'; break;
            case (ghostPoint+57).toString(): return '../res/character_10837_t1_qck.png'; break;
            case (ghostPoint+58).toString(): return '../res/character_10950_t1.png'; break;
            case (ghostPoint+59).toString(): return '../res/character_10951_t1.png'; break;
            case (ghostPoint+60).toString(): return '../res/character_10952_t1_dex.png'; break;
            case (ghostPoint+61).toString(): return '../res/character_10952_t1_qck.png'; break;
            case (ghostPoint+62).toString(): return '../res/character_10773_t1.png'; break;
            case (ghostPoint+63).toString(): return '../res/character_10774_t1.png'; break;
            case (ghostPoint+64).toString(): return '../res/character_10775_t1_int.png'; break;
            case (ghostPoint+65).toString(): return '../res/character_10775_t1_qck.png'; break;
            case (ghostPoint+66).toString(): return '../res/character_10784_t1.png'; break;
            case (ghostPoint+67).toString(): return '../res/character_10785_t1.png'; break;
            case (ghostPoint+68).toString(): return '../res/character_10788_t1_dex.png'; break;
            case (ghostPoint+69).toString(): return '../res/character_10788_t1_qck.png'; break;
            case (ghostPoint+70).toString(): return '../res/character_10786_t1.png'; break;
            case (ghostPoint+71).toString(): return '../res/character_10787_t1.png'; break;
            case (ghostPoint+72).toString(): return '../res/character_10789_t1_dex.png'; break;
            case (ghostPoint+73).toString(): return '../res/character_10789_t1_qck.png'; break;
            case (ghostPoint+74).toString(): return '../res/character_10816_t1.png'; break;
            case (ghostPoint+75).toString(): return '../res/character_10817_t1.png'; break;
            case (ghostPoint+76).toString(): return '../res/character_10820_t1_int.png'; break;
            case (ghostPoint+77).toString(): return '../res/character_10818_t1.png'; break;
            case (ghostPoint+78).toString(): return '../res/character_10819_t1.png'; break;
            case (ghostPoint+79).toString(): return '../res/character_10821_t1_int.png'; break;
            case (ghostPoint+80).toString(): return '../res/character_10871_t1.png'; break;
            case (ghostPoint+81).toString(): return '../res/character_10872_t1.png'; break;
            case (ghostPoint+82).toString(): return '../res/character_10875_t1_str.png'; break;
            case (ghostPoint+83).toString(): return '../res/character_10875_t1_dex.png'; break;
            case (ghostPoint+84).toString(): return '../res/character_10873_t1.png'; break;
            case (ghostPoint+85).toString(): return '../res/character_10874_t1.png'; break;
            case (ghostPoint+86).toString(): return '../res/character_10876_t1_str.png'; break;
            case (ghostPoint+87).toString(): return '../res/character_10876_t1_dex.png'; break;
            case (ghostPoint+88).toString(): return '../res/character_10877_t1.png'; break;
            case (ghostPoint+89).toString(): return '../res/character_10878_t1.png'; break;
            case (ghostPoint+90).toString(): return '../res/character_10881_t1_psy.png'; break;
            case (ghostPoint+91).toString(): return '../res/character_10881_t1_str.png'; break;
            case (ghostPoint+92).toString(): return '../res/character_10879_t1.png'; break;
            case (ghostPoint+93).toString(): return '../res/character_10880_t1.png'; break;
            case (ghostPoint+94).toString(): return '../res/character_10882_t1_psy.png'; break;
            case (ghostPoint+95).toString(): return '../res/character_10882_t1_str.png'; break;
            case (ghostPoint+96).toString(): return '../res/character_10883_t1.png'; break;
            case (ghostPoint+97).toString(): return '../res/character_10884_t1.png'; break;
            case (ghostPoint+98).toString(): return '../res/character_10887_t1_qck.png'; break;
            case (ghostPoint+99).toString(): return '../res/character_10887_t1_psy.png'; break;
            case (ghostPoint+100).toString(): return '../res/character_10885_t1.png'; break;
            case (ghostPoint+101).toString(): return '../res/character_10886_t1.png'; break;
            case (ghostPoint+102).toString(): return '../res/character_10888_t1_qck.png'; break;
            case (ghostPoint+103).toString(): return '../res/character_10888_t1_psy.png'; break;
            case (ghostPoint+104).toString(): return '../res/character_10826_t1.png'; break;
            case (ghostPoint+105).toString(): return '../res/character_10827_t1.png'; break;
            case (ghostPoint+106).toString(): return '../res/character_10830_t1_dex.png'; break;
            case (ghostPoint+107).toString(): return '../res/character_10830_t1_int.png'; break;
            case (ghostPoint+108).toString(): return '../res/character_10828_t1.png'; break;
            case (ghostPoint+109).toString(): return '../res/character_10829_t1.png'; break;
            case (ghostPoint+110).toString(): return '../res/character_10831_t1_dex.png'; break;
            case (ghostPoint+111).toString(): return '../res/character_10831_t1_int.png'; break;
            case (ghostPoint+112).toString(): return '../res/character_10778_t1.png'; break;
            case (ghostPoint+113).toString(): return '../res/character_10779_t1.png'; break;
            case (ghostPoint+114).toString(): return '../res/character_10782_t1_str.png'; break;
            case (ghostPoint+115).toString(): return '../res/character_10782_t1_dex.png'; break;
            case (ghostPoint+116).toString(): return '../res/character_10780_t1.png'; break;
            case (ghostPoint+117).toString(): return '../res/character_10781_t1.png'; break;
            case (ghostPoint+118).toString(): return '../res/character_10783_t1_str.png'; break;
            case (ghostPoint+119).toString(): return '../res/character_10783_t1_dex.png'; break;
            case (ghostPoint+120).toString(): return '../res/character_10636_t1.png'; break;
            case (ghostPoint+121).toString(): return '../res/character_10637_t1.png'; break;
            case (ghostPoint+122).toString(): return '../res/character_10640_t1_int.png'; break;
            case (ghostPoint+123).toString(): return '../res/character_10640_t1_dex.png'; break;
            case (ghostPoint+124).toString(): return '../res/character_10638_t1.png'; break;
            case (ghostPoint+125).toString(): return '../res/character_10639_t1.png'; break;
            case (ghostPoint+126).toString(): return '../res/character_10641_t1_int.png'; break;
            case (ghostPoint+127).toString(): return '../res/character_10641_t1_dex.png'; break;
            case (ghostPoint+128).toString(): return '../res/character_10895_t1.png'; break;
            case (ghostPoint+129).toString(): return '../res/character_10896_t1.png'; break;
            case (ghostPoint+130).toString(): return '../res/character_10899_t1_int.png'; break;
            case (ghostPoint+131).toString(): return '../res/character_10899_t1_dex.png'; break;
            case (ghostPoint+132).toString(): return '../res/character_10897_t1.png'; break;
            case (ghostPoint+133).toString(): return '../res/character_10898_t1.png'; break;
            case (ghostPoint+134).toString(): return '../res/character_10900_t1_int.png'; break;
            case (ghostPoint+135).toString(): return '../res/character_10900_t1_dex.png'; break;
            case (ghostPoint+136).toString(): return '../res/character_10910_t1.png'; break;
            case (ghostPoint+137).toString(): return '../res/character_10911_t1.png'; break;
            case (ghostPoint+138).toString(): return '../res/character_10914_t1_str.png'; break;
            case (ghostPoint+139).toString(): return '../res/character_10914_t1_int.png'; break;
            case (ghostPoint+140).toString(): return '../res/character_10912_t1.png'; break;
            case (ghostPoint+141).toString(): return '../res/character_10913_t1.png'; break;
            case (ghostPoint+142).toString(): return '../res/character_10915_t1_str.png'; break;
            case (ghostPoint+143).toString(): return '../res/character_10915_t1_int.png'; break;
            case (ghostPoint+144).toString(): return '../res/character_10916_t1.png'; break;
            case (ghostPoint+145).toString(): return '../res/character_10917_t1.png'; break;
            case (ghostPoint+146).toString(): return '../res/character_10920_t1_str.png'; break;
            case (ghostPoint+147).toString(): return '../res/character_10920_t1_psy.png'; break;
            case (ghostPoint+148).toString(): return '../res/character_10918_t1.png'; break;
            case (ghostPoint+149).toString(): return '../res/character_10919_t1.png'; break;
            case (ghostPoint+150).toString(): return '../res/character_10921_t1_str.png'; break;
            case (ghostPoint+151).toString(): return '../res/character_10921_t1_psy.png'; break;
            case (ghostPoint+152).toString(): return '../res/character_10954_t1.png'; break;
            case (ghostPoint+153).toString(): return '../res/character_10955_t1.png'; break;
            case (ghostPoint+154).toString(): return '../res/character_10958_t1_dex.png'; break;
            case (ghostPoint+155).toString(): return '../res/character_10958_t1_str.png'; break;
            case (ghostPoint+156).toString(): return '../res/character_10956_t1.png'; break;
            case (ghostPoint+157).toString(): return '../res/character_10957_t1.png'; break;
            case (ghostPoint+158).toString(): return '../res/character_10959_t1_dex.png'; break;
            case (ghostPoint+159).toString(): return '../res/character_10959_t1_str.png'; break;
            case (ghostPoint+160).toString(): return '../res/character_10960_t1.png'; break;
            case (ghostPoint+161).toString(): return '../res/character_10961_t1.png'; break;
            case (ghostPoint+162).toString(): return '../res/character_10964_t1_int.png'; break;
            case (ghostPoint+163).toString(): return '../res/character_10964_t1_psy.png'; break;
            case (ghostPoint+164).toString(): return '../res/character_10962_t1.png'; break;
            case (ghostPoint+165).toString(): return '../res/character_10963_t1.png'; break;
            case (ghostPoint+166).toString(): return '../res/character_10965_t1_int.png'; break;
            case (ghostPoint+167).toString(): return '../res/character_10965_t1_psy.png'; break;
            case (ghostPoint+168).toString(): return '../res/character_10803_t1.png'; break;
            case (ghostPoint+169).toString(): return '../res/character_10804_t1.png'; break;
            case (ghostPoint+170).toString(): return '../res/character_10805_t1_str.png'; break;
            case (ghostPoint+171).toString(): return '../res/character_10805_t1_int.png'; break;
            case (ghostPoint+172).toString(): return '../res/character_11166_t1.png'; break;
            case (ghostPoint+173).toString(): return '../res/character_11167_t1.png'; break;
            case (ghostPoint+174).toString(): return '../res/character_11168_t1_psy.png'; break;
            case (ghostPoint+175).toString(): return '../res/character_11168_t1_int.png'; break;
            case (ghostPoint+176).toString(): return '../res/character_11187_t1.png'; break;
            case (ghostPoint+177).toString(): return '../res/character_11188_t1.png'; break;
            case (ghostPoint+178).toString(): return '../res/character_11191_t1_str.png'; break;
            case (ghostPoint+179).toString(): return '../res/character_11191_t1_dex.png'; break;
            case (ghostPoint+180).toString(): return '../res/character_11189_t1.png'; break;
            case (ghostPoint+181).toString(): return '../res/character_11190_t1.png'; break;
            case (ghostPoint+182).toString(): return '../res/character_11192_t1_str.png'; break;
            case (ghostPoint+183).toString(): return '../res/character_11192_t1_dex.png'; break;
            case (ghostPoint+184).toString(): return '../res/character_10703_t.png'; break;
            case (ghostPoint+185).toString(): return '../res/character_10704_t.png'; break;
            case (ghostPoint+186).toString(): return '../res/character_10707_t1_qck.png'; break;
            case (ghostPoint+187).toString(): return '../res/character_10707_t1_int.png'; break;
            case (ghostPoint+188).toString(): return '../res/character_10705_t.png'; break;
            case (ghostPoint+189).toString(): return '../res/character_10706_t.png'; break;
            case (ghostPoint+190).toString(): return '../res/character_10708_t1_qck.png'; break;
            case (ghostPoint+191).toString(): return '../res/character_10708_t1_int.png'; break;
            case (ghostPoint+192).toString(): return '../res/character_11129_t1.png'; break;
            case (ghostPoint+193).toString(): return '../res/character_11130_t1.png'; break;
            case (ghostPoint+194).toString(): return '../res/character_11131_t1_str.png'; break;
            case (ghostPoint+195).toString(): return '../res/character_11227_t1.png'; break;
            case (ghostPoint+196).toString(): return '../res/character_11228_t1.png'; break;
            case (ghostPoint+197).toString(): return '../res/character_11231_t1_dex.png'; break;
            case (ghostPoint+198).toString(): return '../res/character_11231_t1_int.png'; break;
            case (ghostPoint+199).toString(): return '../res/character_11229_t1.png'; break;
            case (ghostPoint+200).toString(): return '../res/character_11230_t1.png'; break;
            case (ghostPoint+201).toString(): return '../res/character_11232_t1_dex.png'; break;
            case (ghostPoint+202).toString(): return '../res/character_11232_t1_int.png'; break;
            case (ghostPoint+203).toString(): return '../res/character_11260_t1.png'; break;
            case (ghostPoint+204).toString(): return '../res/character_11261_t1.png'; break;
            case (ghostPoint+205).toString(): return '../res/character_11262_t1_dex.png'; break;
            case (ghostPoint+206).toString(): return '../res/character_11262_t1_int.png'; break;
            case (ghostPoint+207).toString(): return '../res/character_11254_t1.png'; break;
            case (ghostPoint+208).toString(): return '../res/character_11255_t1.png'; break;
            case (ghostPoint+209).toString(): return '../res/character_11258_t1_str.png'; break;
            case (ghostPoint+210).toString(): return '../res/character_11256_t1.png'; break;
            case (ghostPoint+211).toString(): return '../res/character_11257_t1.png'; break;
            case (ghostPoint+212).toString(): return '../res/character_11259_t1_str.png'; break;
            case (ghostPoint+213).toString(): return '../res/character_11306_t1.png'; break;
            case (ghostPoint+214).toString(): return '../res/character_11307_t1.png'; break;
            case (ghostPoint+215).toString(): return '../res/character_11310_t1_psy.png'; break;
            case (ghostPoint+216).toString(): return '../res/character_11310_t1_qck.png'; break;
            case (ghostPoint+217).toString(): return '../res/character_11308_t1.png'; break;
            case (ghostPoint+218).toString(): return '../res/character_11309_t1.png'; break;
            case (ghostPoint+219).toString(): return '../res/character_11311_t1_psy.png'; break;
            case (ghostPoint+220).toString(): return '../res/character_11311_t1_qck.png'; break;
            case (ghostPoint+221).toString(): return '../res/character_11318_t1.png'; break;
            case (ghostPoint+222).toString(): return '../res/character_11319_t1.png'; break;
            case (ghostPoint+223).toString(): return '../res/character_11322_t1_str.png'; break;
            case (ghostPoint+224).toString(): return '../res/character_11322_t1_qck.png'; break;
            case (ghostPoint+225).toString(): return '../res/character_11320_t1.png'; break;
            case (ghostPoint+226).toString(): return '../res/character_11321_t1.png'; break;
            case (ghostPoint+227).toString(): return '../res/character_11323_t1_str.png'; break;
            case (ghostPoint+228).toString(): return '../res/character_11323_t1_qck.png'; break;
            case (ghostPoint+229).toString(): return '../res/character_11324_t1.png'; break;
            case (ghostPoint+230).toString(): return '../res/character_11325_t1.png'; break;
            case (ghostPoint+231).toString(): return '../res/character_11328_t1_qck.png'; break;
            case (ghostPoint+232).toString(): return '../res/character_11328_t1_dex.png'; break;
            case (ghostPoint+233).toString(): return '../res/character_11326_t1.png'; break;
            case (ghostPoint+234).toString(): return '../res/character_11327_t1.png'; break;
            case (ghostPoint+235).toString(): return '../res/character_11329_t1_qck.png'; break;
            case (ghostPoint+236).toString(): return '../res/character_11329_t1_dex.png'; break;
            case (ghostPoint+237).toString(): return '../res/character_11314_t1.png'; break;
            case (ghostPoint+238).toString(): return '../res/character_11315_t1.png'; break;
            case (ghostPoint+239).toString(): return '../res/character_11317_t1_int.png'; break;
            case (ghostPoint+240).toString(): return '../res/character_11371_t1.png'; break;
            case (ghostPoint+241).toString(): return '../res/character_11372_t1.png'; break;
            case (ghostPoint+242).toString(): return '../res/character_11375_t1_str.png'; break;
            case (ghostPoint+243).toString(): return '../res/character_11375_t1_psy.png'; break;
            case (ghostPoint+244).toString(): return '../res/character_11373_t1.png'; break;
            case (ghostPoint+245).toString(): return '../res/character_11374_t1.png'; break;
            case (ghostPoint+246).toString(): return '../res/character_11376_t1_str.png'; break;
            case (ghostPoint+247).toString(): return '../res/character_11376_t1_psy.png'; break;
            case (ghostPoint+248).toString(): return '../res/character_10889_t1.png'; break;
            case (ghostPoint+249).toString(): return '../res/character_10890_t1.png'; break;
            case (ghostPoint+250).toString(): return '../res/character_10891_t1_dex.png'; break;
            case (ghostPoint+251).toString(): return '../res/character_10891_t1_qck.png'; break;
            case (ghostPoint+252).toString(): return '../res/character_11532_t1.png'; break;
            case (ghostPoint+253).toString(): return '../res/character_11533_t1.png'; break;
            case (ghostPoint+254).toString(): return '../res/character_11534_t1_psy.png'; break;
            case (ghostPoint+255).toString(): return '../res/character_11534_t1_int.png'; break;
            case (ghostPoint+256).toString(): return '../res/character_11661_t1.png'; break;
            case (ghostPoint+257).toString(): return '../res/character_11660_t1.png'; break;
            case (ghostPoint+258).toString(): return '../res/character_11662_t1_dex.png'; break;
            case (ghostPoint+259).toString(): return '../res/character_11662_t1_psy.png'; break;
            case (ghostPoint+260).toString(): return '../res/character_11582_t1.png'; break;
            case (ghostPoint+261).toString(): return '../res/character_11583_t1.png'; break;
            case (ghostPoint+262).toString(): return '../res/character_11586_t1_str.png'; break;
            case (ghostPoint+263).toString(): return '../res/character_11586_t1_psy.png'; break;
            case (ghostPoint+264).toString(): return '../res/character_11584_t1.png'; break;
            case (ghostPoint+265).toString(): return '../res/character_11585_t1.png'; break;
            case (ghostPoint+266).toString(): return '../res/character_11587_t1_str.png'; break;
            case (ghostPoint+267).toString(): return '../res/character_11587_t1_psy.png'; break;
            case (ghostPoint+268).toString(): return '../res/character_11712_t1.png'; break;
            case (ghostPoint+269).toString(): return '../res/character_11713_t1.png'; break;
            case (ghostPoint+270).toString(): return '../res/character_11714_t1_str.png'; break;
            case (ghostPoint+271).toString(): return '../res/character_11714_t1_psy.png'; break;
            case (ghostPoint+272).toString(): return '../res/character_11673_t1.png'; break;
            case (ghostPoint+273).toString(): return '../res/character_11674_t1.png'; break;
            case (ghostPoint+274).toString(): return '../res/character_11675_t1.png'; break;
            case (ghostPoint+275).toString(): return '../res/character_11676_t1.png'; break;
            case (ghostPoint+276).toString(): return '../res/character_11851_t1.png'; break;
            case (ghostPoint+277).toString(): return '../res/character_11852_t1.png'; break;
            case (ghostPoint+278).toString(): return '../res/character_11855_t1_qck.png'; break;
            case (ghostPoint+279).toString(): return '../res/character_11855_t1_dex.png'; break;
            case (ghostPoint+280).toString(): return '../res/character_11853_t1.png'; break;
            case (ghostPoint+281).toString(): return '../res/character_11854_t1.png'; break;
            case (ghostPoint+282).toString(): return '../res/character_11856_t1_qck.png'; break;
            case (ghostPoint+283).toString(): return '../res/character_11856_t1_dex.png'; break;
            case (ghostPoint+284).toString(): return '../res/character_11857_t1.png'; break;
            case (ghostPoint+285).toString(): return '../res/character_11858_t1.png'; break;
            case (ghostPoint+286).toString(): return '../res/character_11861_t1_qck.png'; break;
            case (ghostPoint+287).toString(): return '../res/character_11861_t1_psy.png'; break;
            case (ghostPoint+288).toString(): return '../res/character_11859_t1.png'; break;
            case (ghostPoint+289).toString(): return '../res/character_11860_t1.png'; break;
            case (ghostPoint+290).toString(): return '../res/character_11862_t1_qck.png'; break;
            case (ghostPoint+291).toString(): return '../res/character_11862_t1_psy.png'; break;
            case (ghostPoint+292).toString(): return '../res/character_11904_t1.png'; break;
            case (ghostPoint+293).toString(): return '../res/character_11905_t1.png'; break;
            case (ghostPoint+294).toString(): return '../res/character_11908_t1_qck.png'; break;
            case (ghostPoint+295).toString(): return '../res/character_11908_t1_dex.png'; break;
            case (ghostPoint+296).toString(): return '../res/character_11906_t1.png'; break;
            case (ghostPoint+297).toString(): return '../res/character_11907_t1.png'; break;
            case (ghostPoint+298).toString(): return '../res/character_11909_t1_qck.png'; break;
            case (ghostPoint+299).toString(): return '../res/character_11909_t1_dex.png'; break;
            case (ghostPoint+300).toString(): return '../res/character_11967_t1.png'; break;
            case (ghostPoint+301).toString(): return '../res/character_11968_t1.png'; break;
            case (ghostPoint+302).toString(): return '../res/character_11969_t1.png'; break;
            case (ghostPoint+303).toString(): return '../res/character_11970_t1.png'; break;
            case (ghostPoint+304).toString(): return '../res/character_12009_t1.png'; break;
            case (ghostPoint+305).toString(): return '../res/character_12010_t1.png'; break;
            case (ghostPoint+306).toString(): return '../res/character_12013_t1_int.png'; break;
            case (ghostPoint+307).toString(): return '../res/character_12011_t1.png'; break;
            case (ghostPoint+308).toString(): return '../res/character_12012_t1.png'; break;
            case (ghostPoint+309).toString(): return '../res/character_12014_t1_int.png'; break;
            case (ghostPoint+310).toString(): return '../res/character_11420_t1.png'; break;
            case (ghostPoint+311).toString(): return '../res/character_11421_t1.png'; break;
            case (ghostPoint+312).toString(): return '../res/character_11424_t1_dex.png'; break;
            case (ghostPoint+313).toString(): return '../res/character_11424_t1_psy.png'; break;
            case (ghostPoint+314).toString(): return '../res/character_11422_t1.png'; break;
            case (ghostPoint+315).toString(): return '../res/character_11423_t1.png'; break;
            case (ghostPoint+316).toString(): return '../res/character_11425_t1_dex.png'; break;
            case (ghostPoint+317).toString(): return '../res/character_11425_t1_psy.png'; break;
            case (ghostPoint+318).toString(): return '../res/smuAu7N.png'; break;
            case (ghostPoint+319).toString(): return '../res/ZPSk7PQ.png'; break;
            case (ghostPoint+320).toString(): return '../res/KDugejE_qck.png'; break;
            case (ghostPoint+321).toString(): return '../res/KDugejE_int.png'; break;
            case (ghostPoint+322).toString(): return '../res/character_11099_t1.png'; break;
            case (ghostPoint+323).toString(): return '../res/character_11100_t1.png'; break;
            case (ghostPoint+324).toString(): return '../res/character_11102_t1_qck.png'; break;
            case (ghostPoint+325).toString(): return '../res/character_12068_t1.png'; break;
            case (ghostPoint+326).toString(): return '../res/character_12069_t1.png'; break;
            case (ghostPoint+327).toString(): return '../res/character_11677_t1_str.png'; break;
            case (ghostPoint+328).toString(): return '../res/character_11677_t1_dex.png'; break;
            case (ghostPoint+329).toString(): return '../res/character_12132_t1.png'; break;
            case (ghostPoint+330).toString(): return '../res/character_12133_t1.png'; break;
            case (ghostPoint+331).toString(): return '../res/character_12109_t1_qck.png'; break;
            case (ghostPoint+332).toString(): return '../res/character_12109_t1_dex.png'; break;
            case (ghostPoint+333).toString(): return '../res/character_12107_t1.png'; break;
            case (ghostPoint+334).toString(): return '../res/character_12108_t1.png'; break;
            case (ghostPoint+335).toString(): return '../res/character_12110_t1_qck.png'; break;
            case (ghostPoint+336).toString(): return '../res/character_12110_t1_dex.png'; break;
            case (ghostPoint+337).toString(): return '../res/character_12134_t1.png'; break;
            case (ghostPoint+338).toString(): return '../res/character_12135_t1.png'; break;
            case (ghostPoint+339).toString(): return '../res/character_12111_t1.png'; break;
            case (ghostPoint+340).toString(): return '../res/character_12112_t1.png'; break;
            case (ghostPoint+341).toString(): return '../res/character_12227_t1.png'; break;
            case (ghostPoint+342).toString(): return '../res/character_12228_t1.png'; break;
            case (ghostPoint+343).toString(): return '../res/character_12225_t1_qck.png'; break;
            case (ghostPoint+344).toString(): return '../res/character_12225_t1_dex.png'; break;
            case (ghostPoint+345).toString(): return '../res/character_12223_t1.png'; break;
            case (ghostPoint+346).toString(): return '../res/character_12224_t1.png'; break;
            case (ghostPoint+347).toString(): return '../res/character_12226_t1_qck.png'; break;
            case (ghostPoint+348).toString(): return '../res/character_12226_t1_dex.png'; break;
            case (ghostPoint+349).toString(): return '../res/character_12357_t1.png'; break;
            case (ghostPoint+350).toString(): return '../res/character_12358_t1.png'; break;
            case (ghostPoint+351).toString(): return '../res/character_12361_t1_str.png'; break;
            case (ghostPoint+352).toString(): return '../res/character_12361_t1_psy.png'; break;
            case (ghostPoint+353).toString(): return '../res/character_12359_t1.png'; break;
            case (ghostPoint+354).toString(): return '../res/character_12360_t1.png'; break;
            case (ghostPoint+355).toString(): return '../res/character_12362_t1_str.png'; break;
            case (ghostPoint+356).toString(): return '../res/character_12362_t1_psy.png'; break;
            case (ghostPoint+357).toString(): return '../res/character_12363_t1.png'; break;
            case (ghostPoint+358).toString(): return '../res/character_12364_t1.png'; break;
            case (ghostPoint+359).toString(): return '../res/character_12367_t1_dex.png'; break;
            case (ghostPoint+360).toString(): return '../res/character_12367_t1_int.png'; break;
            case (ghostPoint+361).toString(): return '../res/character_12365_t1.png'; break;
            case (ghostPoint+362).toString(): return '../res/character_12366_t1.png'; break;
            case (ghostPoint+363).toString(): return '../res/character_12368_t1_dex.png'; break;
            case (ghostPoint+364).toString(): return '../res/character_12368_t1_int.png'; break;
            case (ghostPoint+365).toString(): return '../res/character_12379_t1.png'; break;
            case (ghostPoint+366).toString(): return '../res/character_12380_t1.png'; break;
            case (ghostPoint+367).toString(): return '../res/character_12383_t1_str.png'; break;
            case (ghostPoint+368).toString(): return '../res/character_12383_t1_qck.png'; break;
            case (ghostPoint+369).toString(): return '../res/character_12381_t1.png'; break;
            case (ghostPoint+370).toString(): return '../res/character_12382_t1.png'; break;
            case (ghostPoint+371).toString(): return '../res/character_12384_t1_str.png'; break;
            case (ghostPoint+372).toString(): return '../res/character_12384_t1_qck.png'; break;
            case (ghostPoint+373).toString(): return '../res/character_12415_t1.png'; break;
            case (ghostPoint+374).toString(): return '../res/character_12416_t1.png'; break;
            case (ghostPoint+375).toString(): return '../res/character_12419_t1_int.png'; break;
            case (ghostPoint+376).toString(): return '../res/character_12419_t1_psy.png'; break;
            case (ghostPoint+377).toString(): return '../res/character_12417_t1.png'; break;
            case (ghostPoint+378).toString(): return '../res/character_12418_t1.png'; break;
            case (ghostPoint+379).toString(): return '../res/character_12420_t1_int.png'; break;
            case (ghostPoint+380).toString(): return '../res/character_12420_t1_psy.png'; break;
            case (ghostPoint+381).toString(): return '../res/character_12421_t1.png'; break;
            case (ghostPoint+382).toString(): return '../res/character_12422_t1.png'; break;
            case (ghostPoint+383).toString(): return '../res/character_12425_t1_str.png'; break;
            case (ghostPoint+384).toString(): return '../res/character_12425_t1_dex.png'; break;
            case (ghostPoint+385).toString(): return '../res/character_12423_t1.png'; break;
            case (ghostPoint+386).toString(): return '../res/character_12424_t1.png'; break;
            case (ghostPoint+387).toString(): return '../res/character_12426_t1_str.png'; break;
            case (ghostPoint+388).toString(): return '../res/character_12426_t1_dex.png'; break;
            default: break;
        }
        return 'https://onepiece-treasurecruise.com/wp-content/uploads/f' + id + '.png';
    };

    utils.getBigThumbnailUrl = function (n) {
        switch (n){
            case 'skullLuffy':
            case 9001: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_luffy_c.png'; break;
            case 'skullZoro':
            case 9002: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_zoro_c.png'; break;
            case 'skullNami':
            case 9003: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_nami_c.png'; break;
            case 'skullUsopp':
            case 9004: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_usopp_c.png'; break;
            case 'skullSanji':
            case 9005: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_sanji_c.png'; break;
            case 'skullChopper':
            case 9006: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_chopper_c.png'; break;
            case 'skullRobin':
            case 9007: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_robin_c.png'; break;
            case 'skullFranky':
            case 9008: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_franky_c.png'; break;
            case 'skullBrook':
            case 9009: return 'https://onepiece-treasurecruise.com/wp-content/uploads/skull_brook_c.png'; break;
            case 'skullSTR':
            case 9010: return 'https://onepiece-treasurecruise.com/wp-content/uploads/red_skull_c.png'; break;
            case 'skullQCK':
            case 9011: return 'https://onepiece-treasurecruise.com/wp-content/uploads/blue_skull_c.png'; break;
            case 'skullPSY':
            case 9012: return 'https://onepiece-treasurecruise.com/wp-content/uploads/yellow_skull2_c.png'; break;
            case 'skullDEX':
            case 9013: return 'https://onepiece-treasurecruise.com/wp-content/uploads/green_skull2_c.png'; break;
            case 'skullINT':
            case 9014: return 'https://onepiece-treasurecruise.com/wp-content/uploads/black_skull_c.png'; break;
            case 'skullJudge':
            case 9015: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c1.png'; break;
            case 'skullReiju':
            case 9016: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c2.png'; break;
            case 'skullIchiji':
            case 9017: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c3.png'; break;
            case 'skullNiji':
            case 9018: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c4.png'; break;
            case 'skullYonji':
            case 9019: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c5.png'; break;
            case 'skullDoffy':
            case 9020: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_c.png'; break;
            case 'skullEnel':
            case 9021: return 'https://onepiece-treasurecruise.com/wp-content/uploads/enel_skull_c.png'; break;
            case 'skullHiguma':
            case 9022: return 'https://onepiece-treasurecruise.com/wp-content/uploads/higuma_skull_c.png'; break;
            case 'skullSanji2':
            case 9023: return 'https://onepiece-treasurecruise.com/wp-content/uploads/sanji_skull_f.png'; break;
            case 'skullFrankie':
            case 9024: return 'https://onepiece-treasurecruise.com/wp-content/uploads/frankie_skull_c.png'; break;
            case 'skullCavendish':
            case 9025: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Cavendish_skull_c.png'; break;
            case 'skullDoflamingo':
            case 9026: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Doflamingo_skull_c2.png'; break;
            case 'skullIchiji2':
            case 9027: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c6.png'; break;
            case 'skullNiji2':
            case 9028: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c7.png'; break;
            case 'skullYonji2':
            case 9029: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c8.png'; break;
            case 'skullReiju2':
            case 9030: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Jerma_skull_c9.png'; break;
            case 'skullHancock':
            case 9031: return 'https://onepiece-treasurecruise.com/wp-content/uploads/Hancock_skull_c.png'; break;
            case 'skullNami2':
            case 9032: return 'https://onepiece-treasurecruise.com/wp-content/uploads/nami_skull_c.png'; break;
            case 'skullBullet':
            case 9033: return '../res/skullBullet.png'; break;
            case 'skullKatakuri':
            case 9034: return '../res/skullKatakuri.png'; break;
            case 'skullWhitebeard':
            case 9035: return '../res/skullWhitebeard.png'; break;
            case 'skullCP9':
            case 9036: return '../res/skullCP9.png'; break;
        }
        if (window.units[n - 1].incomplete)
            return 'https://onepiece-treasurecruise.com/wp-content/themes/onepiece-treasurecruise/images/noimage.png';
        var id = ('0000' + n).slice(-4).replace(/(057[54])/, '0$1'); // missing aokiji image
        switch(id){
            //case '2262': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c5012.png'; break;
            //case '2263': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c5013.png'; break;
            //case '2500': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c2500.png'; break;
            //case '2685': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c10686.png'; break;
            //case '2686': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/c10687.png'; break;
            //case '2772': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_10993.png'; break;
            //case '3327': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11333-.png'; break;
            //case '3333': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1719.png'; break;
            //case '3334': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1720.png'; break;
            //case '3370': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11102-1.png'; break;
            //case '3374': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11138.png'; break;
            //case '3384': return 'http://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_11138.png'; break;
            case '4986': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1719.png'; break;
            case '4987': return 'https://onepiece-treasurecruise.com/en/wp-content/uploads/sites/2/character_1720.png'; break;
            default: break;
        }
        return 'https://onepiece-treasurecruise.com/wp-content/uploads/c' + id + '.png';
    };

    utils.getThumbnailTitle = function (arg) {
        if (arg === null || arg === undefined)
            return null;
        if (arg.constructor == Object) {
            return [arg.name, 'HP: ' + arg.hp, 'ATK: ' + arg.atk, 'RCV: ' + arg.rcv, 'CMB: ' + arg.cmb].join('\n');
        }
        var unit = (arg.constructor == Object ? arg : units[arg]);
        return [unit.name, 'HP: ' + unit.maxHP, 'ATK: ' + unit.maxATK, 'RCV: ' + unit.maxRCV, 'CMB: ' + unit.combo, 'Cost: ' + unit.cost].join('\n');
    };

    utils.isClickOnOrb = function (e, target) {
        var x = e.offsetX, y = e.offsetY;
        var distance = Math.sqrt(Math.pow(x - 20, 2) + Math.pow(y - 21, 2));
        return distance < 13;
    };

    /* * * * * Misc functions * * * * */

    /* given an array of arrays, generates the cartesian product of
     * all the arrays contained within the root array
     * eg f([[1],[2,3],[4,5,6]]) -> [[1,2,4],[1,2,5],[1,2,6],[1,3,4],[1,3,5],[1,3,6]] */
    utils.arrayProduct = function (data) {
        var result = data.reduce(function (prev, next) {
            if (next.length === 0)
                return prev;
            return next.map(function (n) {
                return prev.map(function (p) {
                    return p.concat([n]);
                });
            }).reduce(function (prev, next) {
                return prev.concat(next);
            }, []);
        }, [[]]);
        return result.filter(function (r) {
            return r.length > 0;
        });
    };

    utils.getOppositeType = function (type) {
        if (!type)
            return null;
        type = type.toUpperCase();
        if (type == 'STR')
            return 'QCK';
        if (type == 'QCK')
            return 'DEX';
        if (type == 'DEX')
            return 'STR';
        if (type == 'PSY')
            return 'INT';
        return 'PSY';
    };

    /* * * * * Searching/filtering * * * * */

    utils.getRegex = function (query) {
        try {
            return new RegExp(query, 'i');
        } catch (e) {
            return new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'i');
        }
    };

    utils.generateSearchParameters = function (query) {
        if (!query || query.trim().length < 2)
            return null;
        if (/^\d+$/.test(query)) {
            var n = parseInt(query,10);
            if (n > 0 && n <= units.length) query = 'id=' + query;
        }
        query = utils.normalizeText(query.toLowerCase().trim());
        var result = {matchers: {}, ranges: {}, query: [], queryTerms: []};
        var ranges = {}, params = ['hp', 'atk', 'stars', 'cost', 'growth', 'rcv', 'id', 'slots', 'combo', 'exp', 'minCD', 'maxCD'];
        var regex = new RegExp('^((type|class|support|family|notfamily):(.+)|(' + params.join('|') + ')(>|<|>=|<=|=)([-?\\d.]+))$', 'i');
        const typeRegex = /^(?:str|dex|qck|psy|int)$/;
        var tokens = query.replace(/&|\//g, ' ').split(/\s+/);
        tokens.forEach(function (x) {
            x = x.replace(/_+/g, ' ');
            var temp = x.match(regex);
            if (!temp) { // if it couldn't be parsed, treat it as string
                if (typeRegex.test(x)) { // if string is a unit type, treat it as `type:X`
                    result.matchers['type'] = new RegExp(x, 'i');
                } else {
                    result.query.push(x);
                    result.queryTerms.push(utils.getRegex(x));
                }
            } else if (temp[4] !== undefined) { // numeric operator
                var parameter = temp[4],
                        op = temp[5],
                        value = parseFloat(temp[6], 10);
                if (parameter === 'exp')
                    parameter = 'maxEXP';
                if (!result.ranges.hasOwnProperty(parameter)) {
                    if (op === '>' || op === '>=') {
                        result.ranges[parameter] = [0, Number.POSITIVE_INFINITY];
                    } else if (op === '<' || op === '<=') {
                        result.ranges[parameter] = [Number.NEGATIVE_INFINITY, 0];
                    }else{
                         result.ranges[parameter] = [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
                    }
                }
                if (op === '=') {
                    result.ranges[parameter][0] = value;
                    result.ranges[parameter][1] = value;
                } else if (op === '<') {
                    result.ranges[parameter][1] =  value - 1;
                } else if (op === '<=') {
                    result.ranges[parameter][1] = value;
                } else if (op === '>') {
                    result.ranges[parameter][0] =  value + 1;
                } else if (op === '>=') {
                    result.ranges[parameter][0] =  value;
                }
            } else // matcher
                result.matchers[temp[2]] = new RegExp(temp[3], 'i');
                //console.log(result.matchers); Here for stuff to try to do custom
        });
        if (result.query.length > 0)
            result.query = result.query.join(' ');
        else
            result.query = null;
        return result;
    };

    /**
     * Checks a unit against a set of parameters generated by `Utils.generateSearchParameters`.
     * Fuzzy search is not supported on this function. To implement fuzzy search, filter
     * with fuzzy search first, then remove `queryTerms` from `searchParameters` before
     * passing it into this function.
     * @param {object} unit - Unit object to check. Get it from `window.units` after
     * `Utils.parseUnits` is called.
     * @param {object} searchParameters - Object returned by `Utils.generateSearchParameters`
     * @returns {boolean} True if given unit matches all parameters
     */
    utils.checkUnitMatchSearchParameters = function (unit, searchParameters) {
        if (typeof unit === 'number' && isFinite(unit))
            unit = window.units[unit];

        // filter by matchers (string operators)
        for (let matcher in searchParameters.matchers) {
            let regex = searchParameters.matchers[matcher];
            if (matcher === 'family'){
                if (!(unit.families && unit.families.some(family => regex.test(family)))) {
                    return false;
                }
            } else if (matcher === 'notfamily'){
                if (unit.families && unit.families.some(family => regex.test(family))) {
                    return false;
                }
            } else if (!regex.test(unit[matcher])) {
                return false;
            }
        }

        // filter by ranges (numeric operators)
        for (let range in searchParameters.ranges) {
            let stat;
            range = range.toLowerCase();

            if (range == 'id') {
                stat = unit.number + 1;
            } else if (range == 'mincd' || range == 'maxcd') {
                stat = window.cooldowns[unit.number];
                if (stat)
                    stat = stat[range == 'mincd' ? 0 : 1];
            } else {
                stat = unit[range] || unit[range] || unit['max' + range.toUpperCase()];
            }

            if (stat === null
                || stat === undefined
                || stat < searchParameters.ranges[range][0]
                || stat > searchParameters.ranges[range][1]
            ) {
                return false;
            }
        }

        // filter by queryTerms
        if (searchParameters.queryTerms && searchParameters.queryTerms.length > 0) {
            let name = Utils.getFullUnitName(id);
            // make sure all terms match
            if (!searchParameters.queryTerms.every(term => term.test(name))){
                return false;
            }
        }
        return true;
    }

    utils.isFodder = function (unit) {
        return (unit.stars < 2 && !utils.isEvolverBooster(unit)) || FODDER_REGEX.test(unit.name);
    };

    utils.isEvolverBooster = function (unit) {
        return /Evolver|Booster/i.test(unit.class);
    };

    utils.searchBaseForms = function (id) {
        if (!reverseEvoMap)
            generateReverseEvoMap();
        if (!reverseEvoMap[id])
            return null;
        return reverseEvoMap[id];
    };

    var updateEvoMap = function (from, to, via) {
        if (!reverseEvoMap[to])
            reverseEvoMap[to] = {};
        if (!reverseEvoMap[to][from])
            reverseEvoMap[to][from] = [];
        reverseEvoMap[to][from].push(via);
    };

    /**
     * @returns {Object} Reverse map (lazy-instantiated) of window.families where
     * the keys are the family names and the values are arrays of the unit ids
     * that have the given family name.
     */
    utils.getReverseFamilyMap = function () {
        if (reverseFamilyMap)
            return reverseFamilyMap;

        reverseFamilyMap = {};
        for (let id in window.families) {
            id = Number(id);
            let families = window.families[id];
            if (!families)
                continue;
            for (const family of families) {
                if (!(family in reverseFamilyMap)) {
                    reverseFamilyMap[family] = [];
                }
                reverseFamilyMap[family].push(id);
            };
        };
        return reverseFamilyMap;
    };

    var generateReverseEvoMap = function () {
        reverseEvoMap = {};
        for (var evo in evolutions) {
            var from = parseInt(evo, 10);
            if (evolutions[evo].evolution.constructor != Array)
                updateEvoMap(from, evolutions[evo].evolution, evolutions[evo].evolvers);
            else
                for (var i = 0; i < evolutions[evo].evolution.length; ++i)
                    updateEvoMap(from, evolutions[evo].evolution[i], evolutions[evo].evolvers[i]);
        }
    };

    /* * * * * Body * * * * */

    window.Utils = utils;

})();
