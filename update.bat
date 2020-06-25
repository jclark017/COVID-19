git fetch
git merge remotes/upstream/master
cd vscode
node convert.js
cd ../sql
sqlite3 ../vscode/output.db ".read outputSqlite"
cd ..