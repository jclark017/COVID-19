cd ../PowerBI
del daily.csv
wget https://covidtracking.com/api/v1/states/daily.csv
git fetch --all
git merge remotes/upstream/master
cd vscode
node convert.js
cd ../sql
sqlite3 ../vscode/output.db ".read outputSqlite"
git commit -am "Daily Update"
git push
cd ..