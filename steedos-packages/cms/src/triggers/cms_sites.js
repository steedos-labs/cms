/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2023-08-06 15:34:32
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-08-30 10:17:03
 * @Description:
 */
module.exports = {
  cms_sites_beforeInsert: {
    trigger: {
      listenTo: "cms_sites",
      when: ["beforeInsert"],
    },
    async handler(ctx) {
      const { doc, userId } = ctx.params;

      if (!userId) {
        throw new Error("cms_error_login_required");
      }
      
      doc.owner = userId;
      if (!doc.admins) {
        doc.admins = [userId];
      }
      if (doc.admins.indexOf(userId) < 0) {
        return doc.admins.push(userId);
      }
      return doc;
    },
  },
  cms_sites_beforeUpdate: {
    trigger: {
      listenTo: "cms_sites",
      when: ["beforeUpdate"],
    },
    async handler(ctx) {
      const { doc, userId, id } = ctx.params;
      if (!userId) {
        throw new Error("cms_error_login_required");
      }
      // if (doc.admins) {
      //   if (doc.admins.indexOf(userId) < 0) {
      //     doc.admins.push(userId);
      //   }
      // }
      return doc;
    },
  },
  cms_sites_beforeRemove: {
    trigger: {
      listenTo: "cms_sites",
      when: ["beforeRemove"],
    },
    async handler(ctx) {
      const { doc, userId, id } = ctx.params;
      if (!userId) {
        throw new Error("cms_error_login_required");
      }


      const category = await ctx.broker.call(`objectql.count`, {objectName: 'cms_categories', filters: ['site', '=', doc._id]})
      if (category > 0) {
        throw new Error("cms_sites_error_has_categories");
      }
      const post = await ctx.broker.call(`objectql.count`, {objectName: 'cms_posts', filters: ['site', '=', doc._id]})
      if (post > 0) {
        throw new Error("cms_sites_error_has_posts");
      }
    },
  },
};
