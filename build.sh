GIT_COMMIT_ID=`git rev-parse --short HEAD`

docker build -t registry.cn-hangzhou.aliyuncs.com/mikaka/shop-web:$GIT_COMMIT_ID .
if [ $? -ne 0 ]; then
    echo "Docker 构建失败"
    exit 1
fi

docker push registry.cn-hangzhou.aliyuncs.com/mikaka/shop-web:$GIT_COMMIT_ID
if [ $? -ne 0 ]; then
    echo "Docker 推送失败"
    exit 1
fi

echo "完成打包，版本： $GIT_COMMIT_ID"