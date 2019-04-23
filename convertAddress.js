const path = require('path')
const fs = require('fs')
const ROOT_PATH = path.resolve(__dirname, './')

let json = require('./transformed/web/address.json')
let str = new String()
let separator = '\t'
let lineBreak = '\n'
let sep_level1 = '	'
let sep_level2 = '	　　'
let sep_level3 = '	　　　'
for (var p of json) {
    str = str.concat(p.code + sep_level1 + p.name + lineBreak)
    if (p.sub && p.sub.length) {
        for (c of p.sub) {
            str = str.concat(c.code + sep_level2 + c.name + lineBreak)
            if (c.sub && c.sub.length) {
                for (var d of c.sub) {
                    str = str.concat(d.code + sep_level3 + d.name + lineBreak)
                }
            }
        }
    }
}
console.log(33, str)
fs.readdir(path.resolve(ROOT_PATH, './transformed'), (err, files) => {
    console.log(err, files)
    if (err) {
        fs.mkdirSync(path.resolve(ROOT_PATH, './transformed'))
    }
    fs.readdir(path.resolve(ROOT_PATH, './transformed/app'), (err, files) => {
        console.log(err, files)
        if (err) {
            fs.mkdirSync(path.resolve(ROOT_PATH, './transformed/app'))
        }
        let fileName = 'address'
        fs.writeFile(path.resolve(ROOT_PATH, './transformed/app/' + fileName), str, (err) => {
            if (err) throw err;
        });
    })
})







