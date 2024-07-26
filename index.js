const { Authflow, Titles } = require("prismarine-auth");

const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs');

const realmArray = require("./realms.json");
const invaildRealmArray = [];

const flow = new Authflow(undefined, "./auth", {
    flow: "sisu",
    authTitle: "000000004424DA1F",
    // You have to use this title to get access to LFG, you could use Titles.XboxAppIOS also.
    deviceType: "Win32"
});

const getXboxToken = async () => {
    return await flow.getXboxToken()
        .catch((err) => {
            console.log(err);
            process.exit(1);
        });
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

const realmCodeRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d_-]{11}/gm;

(async () => {
    const token = await getXboxToken();

    headers.Authorization = `XBL3.0 x=${token.userHash};${token.XSTSToken}`;

    const posts = await fetch(`https://sessiondirectory.xboxlive.com/handles/query?include=relatedInfo,roleInfo,activityInfo`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    const data = await posts.json();

    console.log(`[${chalk.blueBright('-')}] ${chalk.yellow('Grabbing Realm Codes')}`);

    for (let i = 0; i < data.results.length; i++) {
        if (!data.results[i].relatedInfo?.description) continue;

        const realmCodes = data.results[i].relatedInfo.description.text.match(realmCodeRegex);

        if (realmCodes) {
            for (let j = 0; j < realmCodes.length; j++) {
                if (realmArray.includes(realmCodes[j]) || invaildRealmArray.includes(realmCodes[j])) continue;

                console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.magenta('Vaildating Realm Code')}`);

                const response = await fetch(`https://open.minecraft.net/pocket/realms/invite/${realmCodes[j]}`, {
                    method: 'GET',
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.8",
                        "Priority": "u=0, i"
                    }
                });

                if (response.status === 404) {
                    console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Invaild Realm Code")}`);
                    invaildRealmArray.push(realmCodes[j]);
                    continue;
                };

                if (response.status === 200) {
                    realmArray.push(realmCodes[j]);
                    console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.green("Vaild Realm Code")}`);
                    continue;
                }

                if (response.status != 404 || response.status != 200) {
                    console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Unable to View Realm Code")}`);
                    invaildRealmArray.push(realmCodes[j]);
                    continue;
                }
            }
        }
    };

    console.log(`[${chalk.blueBright('-')}] ${chalk.yellow('Finished Grabbing Realm Codes')}`);

    fs.writeFileSync('realms.json', JSON.stringify(realmArray, null, 2), (err) => {
        if (err) console.log(err);
    });

    setInterval(async () => {
        const posts = await fetch(`https://sessiondirectory.xboxlive.com/handles/query?include=relatedInfo,roleInfo,activityInfo`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const data = await posts.json();

        console.log(`[${chalk.blueBright('-')}] ${chalk.yellow('Grabbing Realm Codes')}`);

        for (let i = 0; i < data.results.length; i++) {
            if (!data.results[i].relatedInfo?.description) continue;

            const realmCodes = data.results[i].relatedInfo.description.text.match(realmCodeRegex);

            if (realmCodes) {
                for (let j = 0; j < realmCodes?.length; j++) {
                    if (realmArray.includes(realmCodes[j]) || invaildRealmArray.includes(realmCodes[j])) continue;

                    console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.magenta('Vaildating Realm Code')}`);

                    const response = await fetch(`https://open.minecraft.net/pocket/realms/invite/${realmCodes[j]}`, {
                        method: 'GET',
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.8",
                            "Priority": "u=0, i"
                        }
                    });

                    if (response.status === 404) {
                        console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Invaild Realm Code")}`);
                        invaildRealmArray.push(realmCodes[j]);
                        continue;
                    };

                    if (response.status === 200) {
                        realmArray.push(realmCodes[j]);
                        console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.green("Vaild Realm Code")}`);
                        continue;
                    }

                    if (response.status != 404 || response.status != 200) {
                        console.log(`[${chalk.blueBright(realmCodes[j])}] ${chalk.red("Unable to Vaildate Realm Code")} (${response.status})`);
                        invaildRealmArray.push(realmCodes[j]);
                        continue;
                    }
                }
            }
        };

        console.log(`[${chalk.blueBright('-')}] ${chalk.yellow('Finished Grabbing Realm Codes')}`);

        fs.writeFileSync('realms.json', JSON.stringify(realmArray, null, 2), (err) => {
            if (err) console.log(err);
        });
    }, 60000)
})();