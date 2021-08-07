const axios = require('axios');
const {Translate} = require('@google-cloud/translate').v2;
require('dotenv').config();
const fs = require('fs');
const path = require( "path" );
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
readline.question('Folder?', name => {
    const folder = name
    console.log(`Folder: ${name}`);
    //const folder = 'D:/p2p/udemy-laravelframeworkbuildprofessionalecommerce/udemy-laravelframeworkbuildprofessionalecommerce/laravel-framework-build-professional-ecommerce/01 Introduction';
    const target = 'vi';
    const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
    const translate = new Translate({
        credentials: CREDENTIALS,
        projectId: CREDENTIALS.project_id
    });


    async function nameFile() {
        return new Promise(function(resolve, reject) {
            let mang=[];
            fs.readdirSync( folder ).forEach( file => {
                const extname = path.extname( file );
                const filename = path.basename( file, extname );
                const absolutePath = path.resolve( folder, file );
                // console.log( "File : ", file );
                // console.log( "filename : ", filename );
                // console.log( "extname : ", extname );
                // console.log( "absolutePath : ", absolutePath);
                if (extname ==='.srt') {
                    mang.push( {filename:filename,absolutePath:absolutePath} );
                }
            });
            resolve(mang);
        });
    }


    async function app(filename,absolutePath) {
        try {
            const result = fs.readFileSync(absolutePath, 'utf8')
            const data = result.split('\n');
            var items = [];
            for (var i = 0; i < data.length; i += 4) {
                const texts = data[i + 2];
                // const response = await axios.post(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${texts}`);
                // const retrieve = response.data;
                // var text = '';
                // retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');


                const [text] = await translate.translate(texts, target);
			console.log(data[i]);
                items.push({
                    id: data[i],
                    startEndTime: data[i + 1],
                    text: text,
                });
            }
            for (let i = 0; i <= items.length; i++) {
                const content = `${items[i].id}\n${items[i].startEndTime}\n${items[i].text}\n\n`;
                const fileSave=path.join(folder,filename+"."+target+".srt");
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
        for (var i=0; i<name.length; i++) {
            await app(name[i].filename,name[i].absolutePath);
            console.log('done!');
        }
    }
    run();
    readline.close();
});

