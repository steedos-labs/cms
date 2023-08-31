/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2023-08-06 15:34:32
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-08-31 14:27:03
 * @Description:
 */
const util = require('@steedos/utils');
const filters = require('@steedos/filters');
const _ = require('lodash');

const STATUS_PENDING = 1, // 34
  STATUS_APPROVED = 2, // 35
  STATUS_REJECTED = 3, // 36
  STATUS_SPAM = 4, // 37
  STATUS_DELETED = 5;

module.exports = {
    cms_posts_beforeFind: {
        trigger: {
          listenTo: "cms_posts",
          when: ["beforeFind"],
        },
        async handler(ctx) {
          const { userId, spaceId, query } = ctx.params;

          const mQuery = util.metadataDriver.getMongoFilters(query.filters);

          let site = null;

          // 如果指定id查询, 则以直接查看.
          if(mQuery && mQuery.$and && mQuery.$and.length > 0 && mQuery.$and[0]._id){
            const post = await ctx.broker.call(`objectql.findOne`, {objectName: 'cms_posts', id: mQuery.$and[0]._id, fields: ['site']});
            if(post && post.site){
                site = await ctx.broker.call(`objectql.findOne`, {objectName: 'cms_sites', id: post.site});
            }
          }

          if(!site && mQuery && mQuery.$and && mQuery.$and.length > 0 && mQuery.$and[0].site){
            const siteId = mQuery.$and[0].site;
            site = await ctx.broker.call(`objectql.findOne`, {objectName: 'cms_sites', id: siteId});
          }

          const userSession = await ctx.broker.call('@steedos/service-accounts.getUserSession', {userId: userId, spaceId: spaceId});
          // 工作区管理员可看所有
          if(userSession && userSession.is_space_admin){
            return;
          }

          if(site){
            if(!userSession || !site || (site.visibility == 'private' && !_.includes(site.admins, userId))){
                return {
                    query: {
                        ...query,
                        filters: ['_id', '=', '-2']
                    }
                }
            }

            const organizations = _.map(userSession.organizations, '_id');
            const postsFilters = [
                [
                    [
                        "enable_post_permissions", "=", true
                    ],
                    [
                        ["owner","=", userId],
                        "or",
                        ["members.organizations","=", organizations],
                        "or",
                        ["members.users","=", userId]
                    ]
                ],
                'or',
                [
                    "enable_post_permissions", "=", false
                ]
            ];
            
            if(_.isString(query.filters)){
                return {
                    query: {
                        ...query,
                        filters: `(${query.filters}) and (${filters.formatFiltersToODataQuery(postsFilters)})`
                    }
                }
            }else{
                return {
                    query: {
                        ...query,
                        filters: `(${filters.formatFiltersToODataQuery(query.filters)}) and (${filters.formatFiltersToODataQuery(postsFilters)})`
                    }
                }
            }
          }else{
            return {
                query: {
                    ...query,
                    filters: ['_id', '=', '-1']
                }
            }
          }
        },
      },
  cms_posts_beforeInsert: {
    trigger: {
      listenTo: "cms_posts",
      when: ["beforeInsert"],
    },
    async handler(ctx) {
      const { doc, userId } = ctx.params;

      if (!userId) {
        throw new Error("cms_error_login_required");
      }

      if (doc.site) {
        var site = await ctx.broker.call("objectql.findOne", {
          objectName: 'cms_posts', 
          id: doc.site,
          fields: ["enable_post_permissions"],
        });
        if (site && site.enable_post_permissions) {
          // 站点启用文章级权限时判断members必填
          var isMemberUsersEmpty =
            !doc.members || !doc.members.users || !doc.members.users.length;
          var isMemberOrgsEmpty =
            !doc.members ||
            !doc.members.organizations ||
            !doc.members.organizations.length;
          if (isMemberUsersEmpty && isMemberOrgsEmpty) {
            throw new Error("cms_error_required_members_value");
          }
        }
      }

      if (!doc.postDate) {
        doc.postDate = new Date();
      }

      doc.status = STATUS_APPROVED;

      if (doc.body) {
        doc.summary = doc.body.substring(0, 400);
      }

      
    //   doc.created_by = userId;
    //   doc.created = new Date();
    //   doc.modified_by = userId;
    //   doc.modified = new Date();
      return {doc};
    },
  },
  cms_posts_beforeUpdate: {
    trigger: {
      listenTo: "cms_posts",
      when: ["beforeUpdate"],
    },
    async handler(ctx) {
      const { doc, userId, id } = ctx.params;
      if (!userId) {
        throw new Error("cms_error_login_required");
      }
      const record = await ctx.broker.call(`objectql.findOne`, {objectName: 'cms_posts', id: id})
      var newDoc = Object.assign({}, record, doc); //兼容单字段编辑情况
      if (newDoc.site) {
        var site = await ctx.broker.call(`objectql.findOne`, {objectName: 'cms_posts', id: newDoc.site, fields: ['enable_post_permissions']})
        if (site && site.enable_post_permissions) {
          // 站点启用文章级权限时判断members必填
          var isMemberUsersEmpty =
            !newDoc.members ||
            !newDoc.members.users ||
            !newDoc.members.users.length;
          var isMemberOrgsEmpty =
            !newDoc.members ||
            !newDoc.members.organizations ||
            !newDoc.members.organizations.length;
          if (isMemberUsersEmpty && isMemberOrgsEmpty) {
            throw new Error("cms_error_required_members_value");
          }
        }
      }
      
      if (doc.body) {
        doc.summary = doc.body.substring(0, 400);
      }
      return {doc};
    },
  },
  cms_posts_beforeDelete: {
    trigger: {
      listenTo: "cms_posts",
      when: ["beforeDelete"],
    },
    async handler(ctx) {
      const { doc, userId, id } = ctx.params;
      if (!userId) {
        throw new Error("cms_error_login_required");
      }
    },
  },
};
