#!/usr/bin/env bash

echo "temporary test build code"
        touch ./podverse_stage_rsa
        echo $STAGE_SSH_PRIVATE_KEY > ./podverse_stage_rsa
        less ./podverse_stage_rsa
        touch helloooo.txt
        ls
        less 
        ssh -t -i ./podverse_stage_rsa $STAGE_SSH_USERNAME@$STAGE_SSH_HOST

            echo "START: on the stage server"
            docker stop podverse_db_stage;
            docker rm podverse_db_stage;
            docker-compose -f ./podverse-ops/docker-compose.stage.yml up -d podverse_db;
            sleep 10;
            PGPASSWORD='$STAGE_PGPASSWORD' psql -h localhost -U postgres -d postgres -f ./podverse-ops/sample\ database/qa-database.sql;
            exit
            echo "END: on the stage server"

        echo "END: SSH into stage server and restore stage database before running tests"
echo "end temporary test code"

if [ "$PLATFORM" == "ios" ] ; then
    cd ./ios && rm -rf Pods && pod cache clean --all && pod install && cd ..
else
    npx jetify
fi

# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST=${ENV_WHITELIST:-"^RN_"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | sed 's/^RN_//g' > .env
printf "\n.env created with contents:\n\n"
cat .env


