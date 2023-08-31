/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2023-08-06 15:34:32
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-08-30 18:05:54
 * @Description: 
 */


module.exports = {
    // cms_categories_beforeInsert: {
    //     trigger: { 
    //         listenTo: 'cms_categories', 
    //         when: ['beforeInsert']
    //     },
    //     async handler(ctx) {
    //         const { doc, userId } = ctx.params;
    //         doc.created_by = userId;
    //         doc.created = new Date();
    //         doc.modified_by = userId;
    //         doc.modified = new Date();
    //         return doc;
    //     }  
    // },
    cms_categories_beforeUpdate: {
        trigger: { 
            listenTo: 'cms_categories', 
            when: ['beforeUpdate']
        },
        async handler(ctx) {
            const { doc, userId, id } = ctx.params;
            const record = await ctx.broker.call(`objectql.findOne`, {objectName: 'cms_categories', id: id, fields: ['_id']})
            if (doc.parent === record._id) {
                throw new Error("cms_categories_error_deny_set_self");
            }

            // doc.modified_by = userId;
            // doc.modified = new Date();
            return {doc};
        }  
    },
    cms_categories_beforeDelete: {
        trigger: { 
            listenTo: 'cms_categories', 
            when: ['beforeDelete']
        },
        async handler(ctx) {
            const { doc, userId, id } = ctx.params;
            const records = await ctx.broker.call(`objectql.find`, {objectName: 'cms_categories', filters: [['parent', '=', id]], fields: ['_id']});
            if (records.length > 0) {
                throw new Error("cms_categories_error_has_children");
            }
            const post =await ctx.broker.call(`objectql.find`, {objectName: 'cms_categories', filters: [['category', '=', id]], fields: ['_id']});
            if (post.length > 0) {
                throw new Error("cms_categories_error_has_posts");
            }
        }  
    }
     
}
