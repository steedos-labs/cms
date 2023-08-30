<!--
 * @Author: baozhoutao@steedos.com
 * @Date: 2023-08-21 15:10:17
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-08-21 15:10:44
 * @Description: 
-->
华炎魔方模版项目
===

<p align="center">
<a href="./README_en.md">English</a>
<a href="https://www.steedos.cn/docs/"> · 文档</a>
<a href="https://www.steedos.cn/videos/"> · 视频</a>
<a href="https://demo.steedos.cn"> · 试用</a>
</p>

# 快速向导

## 启动华炎魔方

开发软件包之前，先启动华炎魔方服务。

1. 将 .env 复制为 .env.local，并修改相关配置参数。
2. 使用 docker 启动华炎魔方。

```bash
docker-compose up
```

打开浏览器，访问 http://127.0.0.1:5000/ ，进入华炎魔方。
打开浏览器，访问 http://127.0.0.1:5200/ ，进入Metabase官方版本。

## 启动Steedos CMS

本项目使用微服务的方式扩展华炎魔方。

```bash
yarn
yarn build
yarn start
```


打开浏览器，访问 http://127.0.0.1:5000/cms ，进入Steedos cms。

## 发版本

修改 steedos-packages/cms/package.json 中的版本号。

```bash
cd steedos-packages/cms/
npm login
npm run release
npx -y cnpm sync @steedos-labs/cms-frontend
```
