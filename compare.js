const path = require('path')
const fs = require('fs')
const ROOT_PATH = path.resolve(__dirname, './')

let pChangeArr = []
let cChangeArr = []
let dChangeArr = []

function compareAddress(newJson, oldJson) {
    for (p of newJson) {
        let pi = oldJson.findIndex(e => e.code == p.code)
        if ( pi >= 0){
            if (p.name != oldJson[pi].name) {
                pChangeArr.push({type: 'CN', name: p.name, code: p.code})
            }
            for (city of p.sub) {
                let ci = oldJson[pi].sub.findIndex(e => e.code == city.code)
                if (ci >= 0) {
                    if (city.name != oldJson[pi].sub[ci].name) {
                        cChangeArr.push({type: 'CN', name: city.name, code: city.code})
                    }
                    for (dist of city.sub) {
                        let di = oldJson[pi].sub[ci].sub.findIndex(e => e.code == dist.code) 
                        if (di >= 0) {
                            if (dist.name != oldJson[pi].sub[ci].sub[di].name) {
                                dChangeArr.push({type: 'CN', name: dist.name, code: dist.code})
                            }
                        } else {
                            dChangeArr.push({type: 'C', name: dist.name, code: dist.code})
                        }
                    }
                } else {
                    cChangeArr.push({type: 'C', name: city.name, code: city.code})
                }
            }
        } else {
            pChangeArr.push({type: 'C', name: p.name, code: p.code})
        }
    } 
}

function compareOldAddressToNewAddress (oldJson, newJson) {
    for (p of oldJson) {
        if (p.code == '90' || p.code == '12' || p.code == '81' || p.code == '000000') continue // 港，澳，台，海外
        let pi = newJson.findIndex(e => e.code == p.code)
        if ( pi >= 0){
            for (city of p.sub) {
                let ci = newJson[pi].sub.findIndex(e => e.code == city.code)
                if (ci >= 0) {
                    for (dist of city.sub) {
                        let di = newJson[pi].sub[ci].sub.findIndex(e => e.code == dist.code) 
                        if (di >= 0) {
                        } else {
                            dChangeArr.push({type: 'CD', name: dist.name, code: dist.code})
                        }
                    }
                } else {
                    cChangeArr.push({type: 'CD', name: city.name, code: city.code})
                }
            }
        } else {
            pChangeArr.push({type: 'CD', name: p.name, code: p.code})
        }
    } 
}


function logCompareResult (parr, carr, darr) {
    var str = ''
    for (item of parr) {
        if (item.type == 'CD') {
            console.info('此省份条目有变更（有可能已经被删除）\t' + item.name + '\t' + item.code)
            str += '此省份条目有变更（有可能已经被删除）\t：' + item.name + '\t' + item.code + '\n'
        } else {
            console.info('此省份条目有变更：\t' + item.name + '\t' + item.code)
            str += '此省份条目有变更：\t' + item.name + '\t' + item.code + '\n'
        }
    }
    for (item of carr) {
        if (item.type == 'CD') {
            console.info('此市级条目有变更（有可能已经被删除）：\t' + item.name + '\t' + item.code)
            str += '此市级条目有变更（有可能已经被删除）：\t' + item.name + '\t' + item.code + '\n'
        } else {
            console.info('此市级条目有变更：\t' + item.name + '\t' + item.code)
            str += '此市级条目有变更：\t' + item.name + '\t' + item.code + '\n'
        }
    }
    for (item of darr) {
        if (item.type == 'CD') {
            console.info('此区级条目有变更（有可能已经被删除）：\t' + item.name + '\t' + item.code)
            str += '此区级条目有变更（有可能已经被删除）：\t' + item.name + '\t' + item.code + '\n'
        } else {
            console.info('此区级条目有变更：\t' + item.name + '\t' + item.code)
            str += '此区级条目有变更：\t' + item.name + '\t' + item.code + '\n'
        }
    }
    fs.readdir(path.resolve(ROOT_PATH, './logs'), (err, files) => {
        console.log(err, files)
        if (err) {
            fs.mkdirSync(path.resolve(ROOT_PATH, './logs'))
        }
        let date = new Date()
        let fileName = 'log-' + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + '.log'
        fs.writeFile(path.resolve(ROOT_PATH, './logs/' + fileName), str, (err) => {
            if (err) throw err;
        });
    })
}

compareAddress(require('./fetched/address-2019422.json'), require('./addressHistory/address.json'))
compareOldAddressToNewAddress(require('./addressHistory/address.json'), require('./fetched/address-2019422.json'))

logCompareResult (pChangeArr, cChangeArr, dChangeArr)