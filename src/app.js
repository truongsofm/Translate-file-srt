const axios = require('axios');
//const {Translate} = require('@google-cloud/translate').v2;
//require('dotenv').config();
const fs = require('fs');
const path = require("path");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
readline.question('  ________      ____          __  __  ___   ___  \n' +
    ' |___  /\\ \\    / /\\ \\        / / /_ |/ _ \\ / _ \\ \n' +
    '    / /  \\ \\  / /  \\ \\  /\\  / /   | | (_) | | | |\n' +
    '   / /    \\ \\/ /    \\ \\/  \\/ /    | |> _ <| | | |\n' +
    '  / /__    \\  /      \\  /\\  /     | | (_) | |_| |\n' +
    ' /_____|    \\/        \\/  \\/      |_|\\___/ \\___/\n' +
    '            https://github.com/zvw180' + '\n' +
    'Directory path : '
    , name => {
        const folder = name;
        console.log(`Folder translate: ${name}`);
        //const folder = 'D:/sub';
        //Translate to
        const target = 'vi';

        //const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
        //const translate = new Translate({
            // credentials: CREDENTIALS,
           // projectId: CREDENTIALS.project_id
        //});


        async function nameFile() {
            return new Promise(function (resolve, reject) {
                let mang = [];
                fs.readdirSync(folder).forEach(file => {
                    const extname = path.extname(file);
                    const filename = path.basename(file, extname);
                    const absolutePath = path.resolve(folder, file);
                    // console.log( "File : ", file );
                    // console.log( "filename : ", filename );
                    // console.log( "extname : ", extname );
                    // console.log( "absolutePath : ", absolutePath);
                    if (extname === '.srt') {
                        mang.push({filename: filename, absolutePath: absolutePath});
                    }
                });
                resolve(mang);
            });
        }


        async function app(filename, absolutePath) {
            try {
                const result = fs.readFileSync(absolutePath, 'utf8')
                const data = result.split('\n');
                var items = [];
                for (var i = 0; i < data.length; i += 4) {
                    const texts = data[i + 2];

                    //Translate free start

                    const response = await axios.post(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${texts}`);
                    const retrieve = response.data;
                    var text = '';
                    retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');

                    //Translate free end


                    //google-cloud translate
                    //https://cloud.google.com/iam/docs/creating-managing-service-account-keys

                    //const [text] = await translate.translate(texts, target);

                    //google-cloud translate

                    console.log(data[i]);
                    items.push({
                        id: data[i],
                        startEndTime: data[i + 1],
                        text: text,
                    });
                }
                for (let i = 0; i <= items.length-1; i++) {
                    const content = `${items[i].id}\n${items[i].startEndTime}\n${items[i].text}\n\n`;
                    const fileSave = path.join(folder, filename + "." + target + ".srt");
                    fs.appendFileSync(fileSave, content, err => {
                        if (err) {
                            console.error(err)
                        }

                    })
                }
            } catch (error) {
                console.error(error);
            }
        }

        async function run() {
            const name = await nameFile();
            for (var i = 0; i < name.length; i++) {
                await app(name[i].filename, name[i].absolutePath);
                console.log('\n' +
                    '  _____                   \n' +
                    ' |  __ \\                  \n' +
                    ' | |  | | ___  _ __   ___ \n' +
                    ' | |  | |/ _ \\| \'_ \\ / _ \\\n' +
                    ' | |__| | (_) | | | |  __/\n' +
                    ' |_____/ \\___/|_| |_|\\___|\n');
            }
        }

        run();
        readline.close();
    });
