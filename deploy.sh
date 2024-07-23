#!/bin/bash

#****************************************
# update:2024/07/23
# author: ChatGPT by Yamashita
#
# 使用にあたってはドキュメントを確認してください。
#****************************************

# .tune-envファイルを読み込む
source ./.tune-env

# キーとバリューの配列を初期化
PARAM_KEYS=()
PARAM_VALUES=()

# .tune-envファイルの内容をキーとバリューに分割して配列に格納
while IFS='=' read -r line; do
  if [[ -n "$line" && "$line" != \#* ]]; then
    key=${line%%=*}
    value=${line#*=}
    if [[ -n "$key" && -n "$value" ]]; then
      PARAM_KEYS+=("$key")
      PARAM_VALUES+=("$value")
    fi
  fi
done < ./.tune-env

# パラメータオーバーライドを作成
PARAM_OVERRIDE=""

for i in "${!PARAM_KEYS[@]}"; do
    if [ $i -ne 0 ]; then
        PARAM_OVERRIDE+=" "
    fi
    PARAM_OVERRIDE+="ParameterKey=${PARAM_KEYS[$i]},ParameterValue=${PARAM_VALUES[$i]}"
done

# SAMビルドの実行
sam build

# デプロイ時の自動応答オプションの確認
if [ "$1" == "-y" ]; then
    # 自動的に 'y' を入力するために expect スクリプトを使用
    expect -c "
    spawn sam deploy --parameter-overrides $PARAM_OVERRIDE
    expect \"Deploy this changeset? \[y/N\]: \"
    send \"y\r\"
    interact
    "
else
    # 通常のデプロイ
    sam deploy --parameter-overrides $PARAM_OVERRIDE
fi