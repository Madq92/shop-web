GIT_COMMIT_ID=`git rev-parse --short HEAD`

docker build -t registry.cn-hangzhou.aliyuncs.com/mikaka/shop-web:$GIT_COMMIT_ID .

docker push registry.cn-hangzhou.aliyuncs.com/mikaka/shop-web:$GIT_COMMIT_ID

echo "完成打包，版本： $GIT_COMMIT_ID"