#!/usr/bin/env bash
# 将构建产物中的 __BASE_PATH__ 占位符替换为实际部署路径（与 build-config.ts 中 BASE_PATH_PLACEHOLDER 一致）。
# 用法：./scripts/replace-base-path.sh /come/game
# 约定：在 dist 目录下执行，或通过环境变量 DIST 指定 dist 路径。

set -e
REPLACE_WITH="${1:?用法: $0 <目标路径，如 /come/game>}"
DIST="${DIST:-dist}"

if [[ ! -d "$DIST" ]]; then
  echo "错误: 目录 $DIST 不存在" >&2
  exit 1
fi

# 占位符需与 build-config.ts 中 BASE_PATH_PLACEHOLDER 一致
PLACEHOLDER='__BASE_PATH__'

echo "替换 $PLACEHOLDER -> $REPLACE_WITH (目录: $DIST)"
find "$DIST" -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) -exec sed -i.bak "s|$PLACEHOLDER|$REPLACE_WITH|g" {} \;
find "$DIST" -type f -name '*.bak' -delete
echo "完成"
