$GIT_COMMIT_ID = git rev-parse --short HEAD

docker build -t registry.cn-hangzhou.aliyuncs.com/mikaka/shop-web:$GIT_COMMIT_ID .
if ($LASTEXITCODE -ne 0)
{
    Write-Host "Docker 构建失败，退出代码：$LASTEXITCODE" -ForegroundColor Red
    exit 1
}

docker push registry.cn-hangzhou.aliyuncs.com/mikaka/shop-web:$GIT_COMMIT_ID
if ($LASTEXITCODE -ne 0)
{
    Write-Host "Docker 推送失败，退出代码：$LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "完成打包，版本： $GIT_COMMIT_ID"

