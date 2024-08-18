const { Authflow } = require("prismarine-auth");

const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs');

require("dotenv").config();

const realmArray = require("./realms.json");
const invaildRealmArray = require("./invaildRealms.json");

let { WEBHOOK_URL: URL } = process.env;

const flow = new Authflow(undefined, "./auth", {
    flow: "sisu",
    authTitle: "000000004424DA1F",
    deviceType: "Win32"
});

const getTokens = async() => {
    const token = await flow.getXboxToken().catch((err) => {
        console.log(err);
        process.exit(1);
    });

    const realmToken = await flow.getXboxToken("https://pocket.realms.minecraft.net/").catch((err) => {
        console.log(err);
        process.exit(1);
    });

    headers.Authorization = `XBL3.0 x=${token.userHash};${token.XSTSToken}`;
    realm_api_headers.authorization = `XBL3.0 x=${realmToken.userHash};${realmToken.XSTSToken}`;

    return;
}

function send(params) {
    fetch(URL, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(params),
    }).catch((error) => console.error(error));
}

const headers = {
    'x-xbl-contract-version': 107,
    'Accept': 'application/json',
    'Accept-Language': 'en-US',
    'Authorization': ''
};

const body = {
    'type': 'search',
    'templateName': 'global(lfg)',
    'orderBy': 'suggestedLfg desc',
    'communicatePermissionRequired': true,
    'includeScheduled': true,
    'filter': `session/titleId eq 1828326430 and session/roles/lfg/confirmed/needs ge 1`
};

const realm_api_headers = {
    "Accept": "*/*",
    "authorization": "",
    "charset": "utf-8",
    "client-ref": "1d19063e681d13fad3185776a6f83cc1b3565626",
    "client-version": "1.21.21",
    "x-clientplatform": "Windows",
    "x-networkprotocolversion": "712",
    "content-type": "application/json",
    "user-agent": "MCPE/UWP",
    "Accept-Language": "en-US",
    "Accept-Encoding": "gzip, deflate, br",
    "Host": "pocket.realms.minecraft.net",
    "Connection": "Keep-Alive"
};

const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d_-]{11,15}/gm;

(async() => {
    await getTokens();

    const fetchCodes = async () => {
        try {
            const posts = await fetch(`https://sessiondirectory.xboxlive.com/handles/query?include=relatedInfo,roleInfo,activityInfo`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            }).catch(() => { });

            const data = await posts.json();

            console.log(`[${chalk.blueBright('-')}] ${chalk.yellow('Grabbing Realm Codes')}`);

            for (let i = 0; i < data.results.length; i++) {
                if (!data.results[i].relatedInfo?.description) continue;

                const realmCodes = data.results[i].relatedInfo.description.text.match(regex);

                if (realmCodes) {
                    for (let j = 0; j < realmCodes.length; j++) {
                        if (realmArray.includes(realmCodes[j].toLowerCase()) || invaildRealmArray.includes(realmCodes[j].toLowerCase())) continue;

                        console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.magenta('Vaildating Realm Code')}`);

                        const response = await fetch(`https://pocket.realms.minecraft.net/worlds/v1/link/${realmCodes[j]}`, {
                            method: "GET",
                            headers: realm_api_headers
                        }).catch(() => {});

                        const realm = await response.json();

                        switch (response.status) {
                            case 403:
                                console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Found in blocklist")}`);

                                if (URL.length >= 100) {
                                    send({
                                        "embeds": [
                                            {
                                                "description": `### New Realm Found\n**Name**: N/A\n**Code**: ${realmCodes[j]}`,
                                                "color": 13210822,
                                                "fields": [],
                                                "author": {
                                                    "name": "Pig",
                                                    "icon_url": "https://minecraftfaces.com/wp-content/bigfaces/big-pig-face.png"
                                                }
                                            }
                                        ],
                                        "username": "Pig",
                                        "avatar_url": "https://minecraftfaces.com/wp-content/bigfaces/big-pig-face.png"
                                    })

                                    console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.green("Webhook sent")}`);
                                }

                                // Since it's vaild, but the account is blacklisted
                                realmArray.push(realmCodes[j].toLowerCase());
                                break;
                            case 404:
                                console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Invaild Realm Code")}`);
                                invaildRealmArray.push(realmCodes[j].toLowerCase());
                                break;
                            case 200:
                                console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.green("Vaild Realm Code")}`);

                                if (URL.length >= 100) {
                                    send({
                                        "embeds": [
                                            {
                                                "description": `### New Realm Found\n**Name**: ${realm.name}\n**Code**: ${realmCodes[j]}`,
                                                "color": 13210822,
                                                "fields": [],
                                                "author": {
                                                    "name": "Pig",
                                                    "icon_url": "https://minecraftfaces.com/wp-content/bigfaces/big-pig-face.png"
                                                }
                                            }
                                        ],
                                        "username": "Pig",
                                        "avatar_url": "https://minecraftfaces.com/wp-content/bigfaces/big-pig-face.png"
                                    })

                                    console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.green("Webhook sent")}`);
                                }

                                realmArray.push(realmCodes[j].toLowerCase());
                                break;
                            case 401:
                                console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Unable to retrieve realm code, refreshing tokens.")}`);
                                await getTokens();
                                break;
                            default:
                                console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Unable to retrieve realm code")}`);
                                break;
                        }
                    }
                }
            };

            console.log(`[${chalk.blueBright('-')}] ${chalk.yellow('Finished Grabbing Realm Code(s)')}`);
        } catch (error) {
            console.log(error)
            console.log(`[${chalk.blueBright('-')}] ${chalk.red("Something went wrong")} (${error?.code})`);
        }

        fs.writeFileSync('realms.json', JSON.stringify(realmArray, null, 2), (err) => {
            if (err) console.log(err);
        });

        fs.writeFileSync('invaildRealms.json', JSON.stringify(invaildRealmArray, null, 2), (err) => {
            if (err) console.log(err);
        });

        return;
    };

    fetchCodes();

    setInterval(() => { fetchCodes(); }, 60000);
})();