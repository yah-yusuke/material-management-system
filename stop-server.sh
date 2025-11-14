#!/bin/bash
# 開発サーバーを停止するスクリプト

echo "開発サーバーを停止します..."

# Viteプロセスを探して終了
pkill -f "vite"

echo "サーバーを停止しました"
