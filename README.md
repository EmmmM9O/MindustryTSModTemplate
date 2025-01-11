# Mindustry TS Mod Template

A mod written in typescript
mindustry declaration file in [mindustry-types](https://github.com/EmmmM9O/mindustry-types)

# Configure

Edit **mod.config.mjs** for mod.json
Edit **dist.config.mjs** for packing options

# Build

```
yarn install
yarn dist
```

# Warn

**DO NOT USE THE CLASS TO EXTEND THE JAVA TYPE SINCE THEY DO NOT HAVE call**
**IF YOU NEED IT USE extend FUNCTION INSTEAD**
**DO NOT IMPORT LIKE `./module` PLEASE `module`**

_[1]_ _I know you may use npm,Edit .husky/pre-commit and dist.config.mjs to change to npm_
_[2]_ _if there are problems on mindustry declaration file.Issueo on_ **mindustry-types**
