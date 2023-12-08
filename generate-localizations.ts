const { promises } = require('fs');

const rootDir = 'tokens';

function flatten(json) {
    const result = {};
    for (const key of Object.keys(json)) {
        if (typeof json[key] === 'object') {
            const nested = flatten(json[key]);
            for (const nestedKey of Object.keys(nested)) {
                let placeholder = '';
                if (nestedKey.endsWith('.value')) {
                    placeholder = nestedKey
                        .split('.')
                        .filter((element) => element !== 'value')
                        .join('.')
                } else placeholder = nestedKey;
                result[`${key}.${placeholder}`] = nested[nestedKey];
            }
        } else {
            if (key !== 'type') result[key] = json[key];
        }
    }
    return result;
}

function generateLocalizations() {
    promises.readFile(`${rootDir}/$metadata.json`, 'utf-8').then((metadata) => {
        const filePaths = JSON.parse(metadata).tokenSetOrder;
        promises.readFile(`${rootDir}/$themes.json`, 'utf-8').then((themesContent) => {
            const themes = JSON.parse(themesContent);
            themes.forEach((theme) => {
                const languageFiles = Object.entries(theme.selectedTokenSets)
                    .filter(([, val]) => val !== 'disabled')
                    .map(([tokenSet]) => {
                        return `tokens/${filePaths.find((file) => file.endsWith(tokenSet))}.json`
                    });
                languageFiles.forEach((file) => {
                    promises.readFile(file, 'utf-8').then((unflattenedJson) => {
                        console.log(flatten(JSON.parse(unflattenedJson)))
                    })
                })
            })

        })
    })
}

generateLocalizations();