# LFG-Realm-Scrapper
The first ever public Xbox Looking For Group realm scrapper.

## How to use
1. Clone this repository
2. Install the dependencies with `npm i`
3. Make a realms.json file with a empty array.
4. Make a invaildRealms.json file with a empty array.
5. Run the script with `node .`
6. The script will output a list of realm codes every 60 seconds.

## Webhook
If you want to setup a webhook, which is not required. You'll have to make a .env file including a discord webhook URL.

`
WEBHOOK_URL=WEBHOOK URL HERE
`

## Known Issues
The script sometimes get words from the posts instead of realm codes, which can be ignored as the codes are vaildated using `https://pocket.realms.minecraft.net/worlds/v1/link/<code>`.

## Special Thanks
[@aidgods](https://github.com/aidgods) - Giving the endpoint to view available Looking For Group posts.

## License
This project is licensed under the [AGPL-3.0](LICENSE) license.