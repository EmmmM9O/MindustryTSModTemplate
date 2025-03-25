# MindustryTSModTemplate
我们使用`mindustry-types`提供类型补全
使用该模板 clone到本地
## 安装
### npm

```shell
npm install
npm format #格式化
npm fix #ESlint fix
npm raw #编译raw文件夹
npm tools #编译tools
npm main #编译main
npm dist
```
记得修改`raw/dist.config.ts`
修改里面`buildCommand`
### yarn

```shell
yarn install
yarn format #格式化
yarn fix #ESlint fix
yarn raw #编译raw文件夹
yarn tools #编译tools
yarn main #编译main
yarn dist
```
### pnpm

```shell
pnpm install
pnpm format #格式化
pnpm fix #ESlint fix
pnpm raw #编译raw文件夹
pnpm tools #编译tools
pnpm main #编译main
pnpm dist
```
记得修改`raw/dist.config.ts`
修改里面`buildCommand`

## 文件目录架构
- project/
  - eslint.config.mjs ESLint配置
  - prettier.config.mjs Prettier配置
  - package.json node配置
  - main/
    - assets/ 资源文件
      - sprites/ 图片
        - ...其他
    - src/
      - main.ts 主程序
      - ... 其他
    - tsconfig.json TS配置
  - raw/ 内容辅助json生成器
    - bundle.config.ts bundle生成配置
    - content.config.ts content生成配置
    - dist.config.ts dist构建配置
    - mod.config.ts **Mod信息配置**
    - src
      - index.ts 构造调用入口 可以自行修改部分
      - bundles/
        - index.ts bundle生成器入口
        - meta.ts 配置bundle的类型 类似于基本模板
        - languages.ts bundle的具体内容
      - content/ content生成器类型还未完成
        - index.ts content生成器入口
        - block.ts 方块
    - tsconfig.json TS配置
  - tools/ 生成器的实现 无需修改 除非需要添加功能和类型

> [!IMPORTANT]
> 不要使用import "./module" 使用 import "module"\
> 不要用class继承java类型\
> 使用extend函数替代\
> 只有对应名称的extend函数有对应补全 比如`extend__Table`

