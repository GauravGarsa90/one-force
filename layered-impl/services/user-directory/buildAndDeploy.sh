cd ../../packages/
rm -f */*.tgz
cd ../modules/lib/nodejs
rm -rf node_modules/ package-lock.json
npm run build
npm i
cd ../
export SLS_DEBUG=false
sls deploy
cd ../../services/s3-uploader/
export SLS_DEBUG=false
sls deploy