#!/bin/sh
function buildAndDeployLayer {
    cd packages/
    rm -f */*.tgz
    cd ../modules/libs/nodejs/
    rm -rf node_modules/ package-lock.json
    npm run build
    npm i
    cd ../
    sls deploy
    cd ../../
}
function buildAndDeployService {
    cd services/user-directory/
    sls deploy
    cd ../../
}
function buildAndDeployResources {
    cd services/user-directory/resources/
    sls deploy
    cd ../../../
}

if  [[ $2 = "-d" ]]; then
    export SLS_DEBUG=true
else
    unset SLS_DEBUG
fi

if  [[ $1 = "-h" ]]; then
    echo "use -ls to build and deploy layer and service"
    echo "use -rls to build and deploy resources, layer and service"
    echo "use -a to build and deploy resources, layer, service"
    echo "use -l to build and deploy layer"
    echo "use -s to build and deploy service"
    echo "use -r to build and deploy resources"
    echo "add -d to any command to run in debug mode"
elif  [[ $1 = "-rls" ]]; then
    buildAndDeployResources
    buildAndDeployLayer
    buildAndDeployService
elif  [[ $1 = "-ls" ]]; then
    buildAndDeployLayer
    buildAndDeployService
elif  [[ $1 = "-a" ]]; then
    buildAndDeployResources
    buildAndDeployLayer
    buildAndDeployService
elif  [[ $1 = "-s" ]]; then
    buildAndDeployService
elif  [[ $1 = "-l" ]]; then
    buildAndDeployLayer
elif  [[ $1 = "-r" ]]; then
    buildAndDeployResources
else
    echo "Please specify deployment options"
fi
echo $1 $2
date
echo "End of script..."
