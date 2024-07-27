# LFG-Realm-Scrapper
The first ever public Xbox Looking For Group realm scrapper.

## How to use
1. Clone this repository
2. Install the dependencies with `npm i`
3. Make a realms.json file with a empty array.
4. Run the script with `node .`
5. The script will output a list of realm codes every 60 seconds.

## Webhook
If you want to setup a webhook, which isn't required, you have to make a .env

## Known Issues
The script sometimes get words from the posts instead of realm codes, which can be ignored as the codes are vaildated using `https://open.minecraft.net/pocket/realms/invite/<code>`.

## Special Thanks
[@aidgods](https://github.com/aidgods) - Giving the endpoint to view available Looking For Group posts.

## License
This project is licensed under the [AGPL-3.0](LICENSE) license.