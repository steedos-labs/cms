/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2023-08-09 11:47:34
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-09-08 18:36:55
 * @Description: 
 */
const path = require('path');
const packageName = "@steedos-labs/cms";
const packageLoader = require('@steedos/service-package-loader');

const triggers = require('./triggers/index.js');
const rests = require('./rests/index.js');

module.exports = {
    name: packageName,
    namespace: "steedos",
    mixins: [packageLoader],
    dependencies: [],
    settings: {
        packageInfo: {
            path: path.join(__dirname, ".."),
            name: packageName,
            isPackage: true
        },
    },
    actions: {
        ...triggers,
        ...rests
    },
    methods: {
    },

    async started() {
    }

}