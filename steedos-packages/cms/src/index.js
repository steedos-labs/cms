/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2023-08-09 11:47:34
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-08-30 17:46:41
 * @Description: 
 */
const path = require('path');
const packageName = "@steedos-labs/cms";
const packageLoader = require('@steedos/service-package-loader');

const triggers = require('./triggers/index.js');

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
        ...triggers
    },
    methods: {
    },

    async started() {
       console.log(`settings`, this.settings)
    }

}